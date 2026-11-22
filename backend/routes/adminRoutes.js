
const express = require("express");
const router = express.Router();
const db = require("../db");
const requireAdmin = require("../middleware/adminAuth");

const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

router.get("/overview", (req, res) => {
  const queries = {
    students: "SELECT COUNT(*) AS total FROM users WHERE role = 'student'",
    faculty: "SELECT COUNT(*) AS total FROM users WHERE role = 'faculty'",
    departments: "SELECT COUNT(*) AS total FROM departments",
    activeUsers: "SELECT COUNT(*) AS total FROM users WHERE is_active = 1",
  };

  const results = {};

  db.query(queries.students, (err, studentResult) => {
    if (err) return res.status(500).json({ message: "Failed to fetch students" });

    results.totalStudents = studentResult[0].total;

    db.query(queries.faculty, (err, facultyResult) => {
      if (err) return res.status(500).json({ message: "Failed to fetch faculty" });

      results.totalFaculty = facultyResult[0].total;

      db.query(queries.departments, (err, departmentResult) => {
        if (err) return res.status(500).json({ message: "Failed to fetch departments" });

        results.totalDepartments = departmentResult[0].total;

        db.query(queries.activeUsers, (err, activeResult) => {
          if (err) return res.status(500).json({ message: "Failed to fetch active users" });

          results.activeUsers = activeResult[0].total;

          res.json(results);
        });
      });
    });
  });
});


router.get("/section-attendance", (req, res) => {
  const query = `
    SELECT
      s.section_name,
      s.course_name,
      COUNT(DISTINCT CONCAT(a.student_id, '-', a.subject_id, '-', a.attendance_date)) AS total_records,
      COUNT(DISTINCT CASE
        WHEN a.attendance_status = 'Present'
        THEN CONCAT(a.student_id, '-', a.subject_id, '-', a.attendance_date)
      END) AS present_records
    FROM sections s
    LEFT JOIN student_enrollments se
      ON se.section_id = s.id AND se.status = 'active'
    LEFT JOIN attendance a
      ON a.student_id = se.student_id
    WHERE s.is_active = 1
    GROUP BY s.id, s.section_name, s.course_name
    ORDER BY s.course_name, s.section_name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Section attendance error:", err);
      return res.status(500).json({
        message: "Failed to fetch section attendance"
      });
    }

    const formattedResults = results.map((row) => ({
      section_name: row.section_name,
      course_name: row.course_name,
      attendance_percentage:
        row.total_records > 0
          ? Number(
              ((row.present_records / row.total_records) * 100).toFixed(2)
            )
          : 0
    }));

    res.json(formattedResults);
  });
});



router.get("/subject-average-marks", (req, res) => {
  const query = `
    SELECT
      s.subject_name,
      ROUND(AVG((m.marks_obtained / m.max_marks) * 100), 2) AS average_percentage
    FROM mid_marks m
    JOIN subjects s ON s.id = m.subject_id
    GROUP BY s.id, s.subject_name
    ORDER BY s.subject_name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Subject average marks error:", err);
      return res.status(500).json({
        message: "Failed to fetch subject average marks"
      });
    }

    res.json(results);
  });
});



router.get("/students", (req, res) => {
  const query = `
    SELECT
      id,
      name,
      email,
      role,
      is_active
    FROM users
    WHERE role = 'student'
    ORDER BY name ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Student list error:", err);
      return res.status(500).json({
        message: "Failed to fetch students"
      });
    }

    res.json(results);
  });
});


router.get("/students", (req, res) => {
  const query = `
    SELECT id, name, email, role, is_active
    FROM users
    WHERE role = 'student'
    ORDER BY name ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Student list error:", err);
      return res.status(500).json({
        message: "Failed to fetch students"
      });
    }

    res.json(results);
  });
});


router.put("/students/:id/status", (req, res) => {
  const { is_active } = req.body;
  const studentId = req.params.id;

  const query = `
    UPDATE users
    SET is_active = ?
    WHERE id = ? AND role = 'student'
  `;

  db.query(query, [is_active, studentId], (err, result) => {
    if (err) {
      console.error("Student status update error:", err);
      return res.status(500).json({
        message: "Failed to update student status"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student status updated successfully"
    });
  });
});


router.get("/faculty", (req, res) => {
  const query = `
    SELECT id, name, email, role, is_active
    FROM users
    WHERE role = 'faculty'
    ORDER BY name ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Faculty list error:", err);
      return res.status(500).json({
        message: "Failed to fetch faculty"
      });
    }

    res.json(results);
  });
});

router.put("/faculty/:id/status", (req, res) => {
  const { is_active } = req.body;
  const facultyId = req.params.id;

  const query = `
    UPDATE users
    SET is_active = ?
    WHERE id = ? AND role = 'faculty'
  `;

  db.query(query, [is_active, facultyId], (err, result) => {
    if (err) {
      console.error("Faculty status update error:", err);
      return res.status(500).json({
        message: "Failed to update faculty status"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Faculty not found"
      });
    }

    res.json({
      message: "Faculty status updated successfully"
    });
  });
});



router.get("/departments", (req, res) => {
  const query = `
    SELECT id, department_name
    FROM departments
    ORDER BY department_name ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Department list error:", err);
      return res.status(500).json({
        message: "Failed to fetch departments"
      });
    }

    res.json(results);
  });
});

router.post("/departments", (req, res) => {
  const { department_name } = req.body;

  if (!department_name || !department_name.trim()) {
    return res.status(400).json({
      message: "Department name is required"
    });
  }

  const query = `
    INSERT INTO departments (department_name)
    VALUES (?)
  `;

  db.query(query, [department_name.trim()], (err, result) => {
    if (err) {
      console.error("Department creation error:", err);
      return res.status(500).json({
        message: "Failed to create department"
      });
    }

    res.status(201).json({
      id: result.insertId,
      department_name: department_name.trim()
    });
  });
});

router.delete("/departments/:id", (req, res) => {
  const departmentId = req.params.id;

  const query = `
    DELETE FROM departments
    WHERE id = ?
  `;

  db.query(query, [departmentId], (err, result) => {
    if (err) {
      console.error("Department deletion error:", err);
      return res.status(500).json({
        message: "Cannot delete department. It may be linked to other records."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    res.json({
      message: "Department deleted successfully"
    });
  });
});



router.get("/sections", (req, res) => {
  const query = `
    SELECT
      s.id,
      s.section_name,
      s.course_name,
      s.year_of_study,
      s.is_active,
      d.department_name,
      ay.year_name
    FROM sections s
    JOIN departments d ON s.department_id = d.id
    JOIN academic_years ay ON s.academic_year_id = ay.id
    ORDER BY s.course_name, s.year_of_study, s.section_name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Sections fetch error:", err);
      return res.status(500).json({
        message: "Failed to fetch sections"
      });
    }

    res.json(results);
  });
});

router.get("/section-form-data", (req, res) => {
  const departmentsQuery = `
    SELECT id, department_name
    FROM departments
    WHERE is_active = 1
    ORDER BY department_name
  `;

  const yearsQuery = `
    SELECT id, year_name
    FROM academic_years
    ORDER BY start_date DESC
  `;

  db.query(departmentsQuery, (err, departments) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch departments"
      });
    }

    db.query(yearsQuery, (err, academicYears) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to fetch academic years"
        });
      }

      res.json({ departments, academicYears });
    });
  });
});

router.post("/sections", (req, res) => {
  const {
    department_id,
    course_name,
    year_of_study,
    section_name,
    academic_year_id
  } = req.body;

  if (
    !department_id ||
    !course_name ||
    !year_of_study ||
    !section_name ||
    !academic_year_id
  ) {
    return res.status(400).json({
      message: "Please fill in all fields"
    });
  }

  const query = `
    INSERT INTO sections
    (department_id, course_name, year_of_study, section_name, academic_year_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      department_id,
      course_name.trim(),
      year_of_study,
      section_name.trim(),
      academic_year_id
    ],
    (err, result) => {
      if (err) {
        console.error("Section creation error:", err);
        return res.status(500).json({
          message: "Failed to create section. Check whether it already exists."
        });
      }

      res.status(201).json({
        message: "Section created successfully",
        id: result.insertId
      });
    }
  );
});

router.delete("/sections/:id", (req, res) => {
  const sectionId = req.params.id;

  db.query(
    "DELETE FROM sections WHERE id = ?",
    [sectionId],
    (err, result) => {
      if (err) {
        console.error("Section deletion error:", err);
        return res.status(500).json({
          message: "Cannot delete section because it may have enrolled students or linked records."
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Section not found"
        });
      }

      res.json({ message: "Section deleted successfully" });
    }
  );
});



router.get("/academic-years", (req, res) => {
  const query = `
    SELECT id, year_name, start_date, end_date, is_current
    FROM academic_years
    ORDER BY start_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Academic years fetch error:", err);
      return res.status(500).json({
        message: "Failed to fetch academic years"
      });
    }

    res.json(results);
  });
});

router.post("/academic-years", (req, res) => {
  const { year_name, start_date, end_date } = req.body;

  if (!year_name || !start_date || !end_date) {
    return res.status(400).json({
      message: "Please fill in all fields"
    });
  }

  if (start_date >= end_date) {
    return res.status(400).json({
      message: "End date must be after start date"
    });
  }

  const query = `
    INSERT INTO academic_years
    (year_name, start_date, end_date, is_current)
    VALUES (?, ?, ?, 0)
  `;

  db.query(query, [year_name.trim(), start_date, end_date], (err, result) => {
    if (err) {
      console.error("Academic year creation error:", err);
      return res.status(500).json({
        message: "Failed to create academic year"
      });
    }

    res.status(201).json({
      id: result.insertId,
      year_name: year_name.trim(),
      start_date,
      end_date,
      is_current: 0
    });
  });
});

router.put("/academic-years/:id/current", (req, res) => {
  const academicYearId = req.params.id;

  db.query(
    "UPDATE academic_years SET is_current = 0",
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update academic year"
        });
      }

      db.query(
        "UPDATE academic_years SET is_current = 1 WHERE id = ?",
        [academicYearId],
        (err, result) => {
          if (err) {
            console.error("Set current academic year error:", err);
            return res.status(500).json({
              message: "Failed to set current academic year"
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              message: "Academic year not found"
            });
          }

          res.json({
            message: "Current academic year updated successfully"
          });
        }
      );
    }
  );
});


router.get("/faculty-assignments", (req, res) => {
  const query = `
    SELECT
      fs.id,
      u.name AS faculty_name,
      u.email AS faculty_email,
      s.subject_name,
      sec.course_name,
      sec.year_of_study,
      sec.section_name,
      ay.year_name
    FROM faculty_sections fs
    JOIN users u ON fs.faculty_id = u.id
    JOIN subjects s ON fs.subject_id = s.id
    JOIN sections sec ON fs.section_id = sec.id
    JOIN academic_years ay ON fs.academic_year_id = ay.id
    ORDER BY u.name, s.subject_name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Faculty assignments fetch error:", err);
      return res.status(500).json({
        message: "Failed to fetch faculty assignments"
      });
    }

    res.json(results);
  });
});

router.get("/faculty-assignment-form-data", (req, res) => {
  const facultyQuery = `
    SELECT id, name
    FROM users
    WHERE role = 'faculty' AND is_active = 1
    ORDER BY name
  `;

  const subjectsQuery = `
    SELECT id, subject_name, subject_code, semester
    FROM subjects
    ORDER BY subject_name
  `;

  const sectionsQuery = `
    SELECT id, course_name, year_of_study, section_name, academic_year_id
    FROM sections
    WHERE is_active = 1
    ORDER BY course_name, year_of_study, section_name
  `;

  const yearsQuery = `
    SELECT id, year_name
    FROM academic_years
    ORDER BY start_date DESC
  `;

  db.query(facultyQuery, (err, faculty) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch faculty" });
    }

    db.query(subjectsQuery, (err, subjects) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch subjects" });
      }

      db.query(sectionsQuery, (err, sections) => {
        if (err) {
          return res.status(500).json({ message: "Failed to fetch sections" });
        }

        db.query(yearsQuery, (err, academicYears) => {
          if (err) {
            return res.status(500).json({
              message: "Failed to fetch academic years"
            });
          }

          res.json({ faculty, subjects, sections, academicYears });
        });
      });
    });
  });
});

router.post("/faculty-assignments", (req, res) => {
  const {
    faculty_id,
    subject_id,
    section_id,
    academic_year_id
  } = req.body;

  if (!faculty_id || !subject_id || !section_id || !academic_year_id) {
    return res.status(400).json({
      message: "Please select all assignment details"
    });
  }

  const query = `
    INSERT INTO faculty_sections
    (faculty_id, section_id, subject_id, academic_year_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    query,
    [faculty_id, section_id, subject_id, academic_year_id],
    (err, result) => {
      if (err) {
        console.error("Faculty assignment creation error:", err);
        return res.status(500).json({
          message: "Assignment failed. It may already exist."
        });
      }

      res.status(201).json({
        message: "Faculty assigned successfully",
        id: result.insertId
      });
    }
  );
});

router.delete("/faculty-assignments/:id", (req, res) => {
  db.query(
    "DELETE FROM faculty_sections WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error("Faculty assignment delete error:", err);
        return res.status(500).json({
          message: "Failed to remove assignment"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Assignment not found"
        });
      }

      res.json({ message: "Assignment removed successfully" });
    }
  );
});

router.use(requireAdmin);



const profilePhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads/profile-photos");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
    }
});

const profilePhotoUpload = multer({
    storage: profilePhotoStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG and WEBP images are allowed."));
        }
    }
});

router.get("/profile", requireAdmin, (req, res) => {
    const userId = req.session.user.id;

    const sql = `
        SELECT id, name, email, phone, profile_photo, role
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Failed to fetch profile." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Admin not found." });
        }

        res.json(results[0]);
    });
});

router.put("/profile", requireAdmin, (req, res) => {
    const userId = req.session.user.id;
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required." });
    }

    const checkSql = "SELECT id FROM users WHERE email = ? AND id != ?";

    db.query(checkSql, [email, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error." });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: "Email already exists." });
        }

        const updateSql = `
            UPDATE users
            SET name = ?, email = ?, phone = ?
            WHERE id = ?
        `;

        db.query(updateSql, [name.trim(), email.trim(), phone || null, userId], (err) => {
            if (err) {
                return res.status(500).json({ message: "Failed to update profile." });
            }

            req.session.user.name = name.trim();
            req.session.user.email = email.trim();

            res.json({ message: "Profile updated successfully." });
        });
    });
});

router.post("/profile/photo", requireAdmin, (req, res) => {
    profilePhotoUpload.single("photo")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                message: err.code === "LIMIT_FILE_SIZE"
                    ? "Photo must be smaller than 2 MB."
                    : err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Please select a photo." });
        }

        const userId = req.session.user.id;
        const photoPath = "/uploads/profile-photos/" + req.file.filename;

        db.query(
            "SELECT profile_photo FROM users WHERE id = ?",
            [userId],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ message: "Database error." });
                }

                const oldPhoto = results[0]?.profile_photo;

                db.query(
                    "UPDATE users SET profile_photo = ? WHERE id = ?",
                    [photoPath, userId],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ message: "Failed to update photo." });
                        }

                        if (oldPhoto && oldPhoto.startsWith("/uploads/profile-photos/")) {
                            const oldFile = path.resolve(
                                __dirname,
                                "..",
                                oldPhoto.replace(/^\/+/, "")
                            );

                            const uploadDir = path.resolve(__dirname, "../uploads/profile-photos");

                            if (
                                oldFile.startsWith(uploadDir + path.sep) &&
                                fs.existsSync(oldFile)
                            ) {
                                fs.unlink(oldFile, () => {});
                            }
                        }

                        res.json({
                            message: "Profile photo updated successfully.",
                            profile_photo: photoPath
                        });
                    }
                );
            }
        );
    });
});

router.put("/profile/password", requireAdmin, (req, res) => {
    const userId = req.session.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Please enter both passwords." });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            message: "New password must contain at least 8 characters."
        });
    }

    db.query(
        "SELECT password FROM users WHERE id = ?",
        [userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database error." });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Admin not found." });
            }

            bcrypt.compare(currentPassword, results[0].password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ message: "Password verification failed." });
                }

                if (!isMatch) {
                    return res.status(400).json({ message: "Current password is incorrect." });
                }

                bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                    if (err) {
                        return res.status(500).json({ message: "Password encryption failed." });
                    }

                    db.query(
                        "UPDATE users SET password = ? WHERE id = ?",
                        [hashedPassword, userId],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ message: "Failed to change password." });
                            }

                            res.json({ message: "Password changed successfully." });
                        }
                    );
                });
            });
        }
    );
});




module.exports = router;
