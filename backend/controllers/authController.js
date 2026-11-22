
const db = require("../db");
const bcrypt = require("bcrypt");

const crypto = require("crypto");
const nodemailer = require("nodemailer");

const allowedRoles = ["student", "faculty", "principal", "admin"];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const login = (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";
  const role = req.body.role || "";

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 255 ||
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > 4096 ||
    !allowedRoles.includes(role)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid email, password, or role.",
    });
  }

  const maxAttempts = 5;
  const windowSeconds = 15 * 60;
  const lockSeconds = 15 * 60;

  db.getConnection((connectionErr, connection) => {
    if (connectionErr) {
      console.error("DB CONNECTION ERROR:", connectionErr);
      return res.status(500).json({
        success: false,
        message: "Database connection error. Please try again.",
      });
    }

    const safeRollback = (error) => {
      connection.rollback(() => {
        connection.release();
        console.error("LOGIN DATABASE ERROR:", error);

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "A login error occurred. Please try again later.",
          });
        }
      });
    };

    connection.beginTransaction((err) => {
      if (err) return safeRollback(err);

      const seedQuery = `
        INSERT IGNORE INTO login_attempts
        (email, failed_attempts, window_started_at, locked_until)
        VALUES (?, 0, NOW(), NULL)
      `;

      connection.query(seedQuery, [email], (err) => {
        if (err) return safeRollback(err);

        const lockQuery = `
          SELECT failed_attempts, window_started_at, locked_until
          FROM login_attempts
          WHERE email = ?
          FOR UPDATE
        `;

        connection.query(lockQuery, [email], (err, attempts) => {
          if (err || !attempts.length) {
            return safeRollback(err || new Error("Login attempts record not found"));
          }

          const attempt = attempts[0];
          const now = Math.floor(Date.now() / 1000);

          const lockUntil = attempt.locked_until
            ? Math.floor(new Date(attempt.locked_until).getTime() / 1000)
            : null;

          if (lockUntil && lockUntil > now) {
            const remainingMinutes = Math.min(
              15,
              Math.max(1, Math.ceil((lockUntil - now) / 60))
            );

            return connection.commit((commitErr) => {
              if (commitErr) return safeRollback(commitErr);

              connection.release();

              return res.status(423).json({
                success: false,
                locked: true,
                minutes: remainingMinutes,
                message: `Too many failed attempts. Try again after ${remainingMinutes} minutes.`,
              });
            });
          }

          let failedAttempts = Number(attempt.failed_attempts);
          let windowStartedAt = attempt.window_started_at;

          const windowStart = Math.floor(
            new Date(windowStartedAt).getTime() / 1000
          );

          if (
            lockUntil ||
            !windowStart ||
            now - windowStart >= windowSeconds
          ) {
            failedAttempts = 0;
            windowStartedAt = new Date(now * 1000)
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
          }

          const userQuery = `
            SELECT id, name, email, password, role
            FROM users
            WHERE email = ?
              AND role = ?
              AND is_active = 1
            LIMIT 1
          `;

          connection.query(userQuery, [email, role], async (err, users) => {
            if (err) return safeRollback(err);

            const user = users[0];
            let passwordValid = false;

            if (user) {
              try {
                passwordValid = await bcrypt.compare(password, user.password);
              } catch {
                passwordValid = false;
              }
            }

            if (!user || !passwordValid) {
              failedAttempts++;

              const lockedUntil =
                failedAttempts >= maxAttempts
                  ? new Date((now + lockSeconds) * 1000)
                      .toISOString()
                      .slice(0, 19)
                      .replace("T", " ")
                  : null;

              const updateQuery = `
                UPDATE login_attempts
                SET failed_attempts = ?,
                    window_started_at = ?,
                    locked_until = ?
                WHERE email = ?
              `;

              return connection.query(
                updateQuery,
                [failedAttempts, windowStartedAt, lockedUntil, email],
                (err) => {
                  if (err) return safeRollback(err);

                  connection.commit((err) => {
                    if (err) return safeRollback(err);

                    connection.release();

                    if (failedAttempts >= maxAttempts) {
                      return res.status(423).json({
                        success: false,
                        locked: true,
                        minutes: 15,
                        message: "Too many failed attempts. Please try again after 15 minutes.",
                      });
                    }

                    return res.status(401).json({
                      success: false,
                      message: "Invalid email, password, or role.",
                    });
                  });
                }
              );
            }

            connection.query(
              "DELETE FROM login_attempts WHERE email = ?",
              [email],
              (err) => {
                if (err) return safeRollback(err);

                connection.commit((err) => {
                  if (err) return safeRollback(err);

                  connection.release();

                  req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                  };

                  req.session.save((sessionErr) => {
                    if (sessionErr) {
                      console.error("SESSION SAVE ERROR:", sessionErr);

                      return res.status(500).json({
                        success: false,
                        message: "Unable to create login session. Please try again.",
                      });
                    }

                    return res.json({
                      success: true,
                      message: "Login successful!",
                      role: user.role,
                      user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                      },
                      redirect: getDashboard(user.role),
                    });
                  });
                });
              }
            );
          });
        });
      });
    });
  });
};



const forgotPassword = (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  db.query(
    "SELECT id, name, email FROM users WHERE email = ? AND is_active = 1",
    [email],
    async (err, results) => {
      if (err) {
        console.error("FORGOT PASSWORD ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again.",
        });
      }

      // Do not reveal whether the email exists
      if (!results.length) {
        return res.json({
          success: true,
          message: "If your email is registered, an OTP will be sent.",
        });
      }

      const user = results[0];
      const otp = crypto.randomInt(100000, 1000000).toString();

      try {
        const otpHash = await bcrypt.hash(otp, 10);

        db.query(
          "DELETE FROM password_resets WHERE user_id = ?",
          [user.id],
          (deleteErr) => {
            if (deleteErr) {
              console.error(deleteErr);
              return res.status(500).json({
                success: false,
                message: "Unable to generate OTP.",
              });
            }

            db.query(
              `INSERT INTO password_resets
              (user_id, otp_hash, expires_at, attempts, created_at)
              VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 0, NOW())`,
              [user.id, otpHash],
              async (insertErr) => {
                if (insertErr) {
                  console.error(insertErr);
                  return res.status(500).json({
                    success: false,
                    message: "Unable to generate OTP.",
                  });
                }

                try {
                  await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: "NBKRIST - Password Reset OTP",
                    text: `Hello ${user.name},

Your NBKRIST password reset OTP is: ${otp}

This OTP expires in 5 minutes.
If you did not request this, please ignore this email.`,
                  });

                  return res.json({
                    success: true,
                    message: "OTP sent to your registered email.",
                  });
                } catch (mailErr) {
                  console.error("EMAIL ERROR:", mailErr);
                  return res.status(500).json({
                    success: false,
                    message: "Unable to send OTP email.",
                  });
                }
              }
            );
          }
        );
      } catch (hashErr) {
        console.error(hashErr);
        return res.status(500).json({
          success: false,
          message: "Unable to generate OTP.",
        });
      }
    }
  );
};


const verifyOTP = (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();

  if (!email || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email and 6-digit OTP.",
    });
  }

  db.query(
    `SELECT pr.id, pr.otp_hash, pr.expires_at, pr.attempts
     FROM password_resets pr
     JOIN users u ON u.id = pr.user_id
     WHERE u.email = ?
       AND u.is_active = 1
       AND pr.used_at IS NULL
     ORDER BY pr.created_at DESC
     LIMIT 1`,
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Unable to verify OTP.",
        });
      }

      if (!results.length) {
        return res.status(400).json({
          success: false,
          message: "OTP is invalid or expired.",
        });
      }

      const reset = results[0];

      if (new Date(reset.expires_at) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new one.",
        });
      }

      if (reset.attempts >= 5) {
        return res.status(429).json({
          success: false,
          message: "Too many attempts. Please request a new OTP.",
        });
      }

      const match = await bcrypt.compare(otp, reset.otp_hash);

      if (!match) {
        db.query(
          "UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?",
          [reset.id]
        );

        return res.status(400).json({
          success: false,
          message: "Incorrect OTP.",
        });
      }

      return res.json({
        success: true,
        message: "OTP verified successfully.",
      });
    }
  );
};


const resetPassword = (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();
  const newPassword = req.body.newPassword || "";
  const confirmPassword = req.body.confirmPassword || "";

  if (
    !email ||
    !/^\d{6}$/.test(otp) ||
    typeof newPassword !== "string" ||
    newPassword.length < 8 ||
    newPassword.length > 72 ||
    newPassword !== confirmPassword
  ) {
    return res.status(400).json({
      success: false,
      message: "Check OTP and password. Password must be at least 8 characters and both passwords must match.",
    });
  }

  db.query(
    `SELECT pr.id, pr.user_id, pr.otp_hash, pr.expires_at, pr.attempts
     FROM password_resets pr
     JOIN users u ON u.id = pr.user_id
     WHERE u.email = ?
       AND u.is_active = 1
       AND pr.used_at IS NULL
     ORDER BY pr.created_at DESC
     LIMIT 1`,
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Unable to reset password.",
        });
      }

      if (!results.length) {
        return res.status(400).json({
          success: false,
          message: "OTP is invalid or expired.",
        });
      }

      const reset = results[0];

      if (
        new Date(reset.expires_at) <= new Date() ||
        reset.attempts >= 5
      ) {
        return res.status(400).json({
          success: false,
          message: "OTP expired or maximum attempts reached.",
        });
      }

      const match = await bcrypt.compare(otp, reset.otp_hash);

      if (!match) {
        db.query(
          "UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?",
          [reset.id]
        );

        return res.status(400).json({
          success: false,
          message: "Incorrect OTP.",
        });
      }

      try {
        const passwordHash = await bcrypt.hash(newPassword, 10);

        db.beginTransaction((transactionErr) => {
          if (transactionErr) {
            return res.status(500).json({
              success: false,
              message: "Unable to reset password.",
            });
          }

          db.query(
            "UPDATE users SET password = ? WHERE id = ?",
            [passwordHash, reset.user_id],
            (updateErr) => {
              if (updateErr) {
                return rollback(res, updateErr);
              }

              db.query(
                "UPDATE password_resets SET used_at = NOW() WHERE id = ?",
                [reset.id],
                (resetErr) => {
                  if (resetErr) {
                    return rollback(res, resetErr);
                  }

                  db.commit((commitErr) => {
                    if (commitErr) {
                      return rollback(res, commitErr);
                    }

                    return res.json({
                      success: true,
                      message: "Password reset successful. Please login.",
                    });
                  });
                }
              );
            }
          );
        });
      } catch (hashErr) {
        console.error(hashErr);
        return res.status(500).json({
          success: false,
          message: "Unable to reset password.",
        });
      }
    }
  );
};


const getDashboard = (role) => {
  const dashboards = {
    student: "/student/dashboard",
    faculty: "/faculty/dashboard",
    principal: "/principal/dashboard",
    admin: "/admin/dashboard",
  };

  return dashboards[role] || "/";
};

const rollback = (res, error = null) => {
  db.rollback(() => {
    console.error("LOGIN DATABASE ERROR:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "A login error occurred. Please try again later.",
      });
    }
  });
};

module.exports = {
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
};