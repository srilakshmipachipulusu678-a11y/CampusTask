
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const db = require("./db");

// Gmail configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Run every day at 9:00 AM (India time)
cron.schedule(
  "0 9 * * *",
  () => {
    console.log("Checking assignment deadline reminders...");

    const query = `
      SELECT
        a.id AS assignment_id,
        a.title,
        a.due_date,
        u.id AS student_id,
        u.name,
        u.email
      FROM assignments a
      JOIN student_enrollments se
        ON se.section_id = a.section_id
      JOIN users u
        ON u.id = se.student_id
      LEFT JOIN submissions sub
        ON sub.assignment_id = a.id
        AND sub.student_id = u.id
      LEFT JOIN email_reminders er
        ON er.assignment_id = a.id
        AND er.student_id = u.id
      WHERE DATE(a.due_date) = DATE_ADD(CURDATE(), INTERVAL 2 DAY)
        AND sub.id IS NULL
        AND er.id IS NULL
        AND u.role = 'student'
        AND u.is_active = 1
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Reminder query error:", err);
        return;
      }

      if (results.length === 0) {
        console.log("No assignment reminders to send today.");
        return;
      }

      results.forEach((student) => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: student.email,
          subject: "CampusTask - Assignment Deadline Reminder",
          html: `
            <h2>Hello ${student.name}!</h2>
            <p>This is a friendly reminder from CampusTask.</p>
            <p>Your assignment <strong>${student.title}</strong>
            is due on <strong>${student.due_date}</strong>.</p>
            <p>Please submit your assignment before the deadline.</p>
            <p>Best wishes,<br>CampusTask Team</p>
          `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Email error:", error);
            return;
          }

          console.log("Reminder email sent:", student.email);

          const insertQuery = `
            INSERT INTO email_reminders
            (assignment_id, student_id, sent_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
          `;

          db.query(
            insertQuery,
            [student.assignment_id, student.student_id],
            (insertError) => {
              if (insertError) {
                console.error("Reminder save error:", insertError);
              }
            }
          );
        });
      });
    });
  },
  {
    timezone: "Asia/Kolkata",
  }
);

console.log("Assignment email reminder scheduler started.");
