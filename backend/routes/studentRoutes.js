
const express = require("express");
const router = express.Router();
const db = require("../db");

// Get student profile
router.get("/profile/:id", (req, res) => {
  const studentId = req.params.id;

  const query = `
    SELECT id, roll_number, name, email, role, created_at
    FROM users
    WHERE id = ? AND role = 'student' AND is_active = 1
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Profile fetch error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      student: results[0]
    });
  });
});

 // Get assignments for a student
router.get("/assignments/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const query = `
    SELECT
      a.id,
      a.title,
      a.description,
      a.due_date,
      a.max_marks,
      a.allow_resubmission,
      s.subject_name
    FROM assignments a
    JOIN student_enrollments se
      ON se.section_id = a.section_id
    JOIN subjects s
      ON s.id = a.subject_id
    WHERE se.student_id = ?
    ORDER BY a.due_date ASC
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Assignments fetch error:", err);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch assignments"
      });
    }

    res.json({
      success: true,
      assignments: results
    });
  });
});
// Student Assignment Upload
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload folder
const uploadFolder = path.join(__dirname, "../uploads/assignments");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// File storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1000000);

    cb(null, uniqueName + path.extname(file.originalname).toLowerCase());
  }
});

// Allowed file types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];

  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, DOCX and TXT files are allowed."));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Submit assignment API
router.post(
  "/assignments/submit",
  (req, res, next) => {
    upload.single("assignmentFile")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size must not exceed 5 MB."
          });
        }

        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      next();
    });
  },
  (req, res) => {
    const { assignment_id, student_id } = req.body;

    if (!assignment_id || !student_id || !req.file) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: "Assignment, student and file are required."
      });
    }

    // Check assignment deadline and student enrollment
    const checkQuery = `
      SELECT a.id, a.due_date, a.allow_resubmission
      FROM assignments a
      JOIN student_enrollments se
        ON se.section_id = a.section_id
      WHERE a.id = ?
        AND se.student_id = ?
    `;

    db.query(
      checkQuery,
      [assignment_id, student_id],
      (err, results) => {
        if (err) {
          fs.unlinkSync(req.file.path);

          return res.status(500).json({
            success: false,
            message: "Database error while validating assignment."
          });
        }

        if (results.length === 0) {
          fs.unlinkSync(req.file.path);

          return res.status(403).json({
            success: false,
            message: "This assignment is not assigned to you."
          });
        }

        const assignment = results[0];
      const now = new Date();
const dueDate = new Date(assignment.due_date);
dueDate.setHours(23, 59, 59, 999);

if (now > dueDate) {
          fs.unlinkSync(req.file.path);

          return res.status(403).json({
            success: false,
            message: "Time is up! Submission closed."
          });
        }

        // Check existing submission
        const existingQuery = `
          SELECT id, status
          FROM submissions
          WHERE assignment_id = ? AND student_id = ?
        `;

        db.query(
          existingQuery,
          [assignment_id, student_id],
          (err, existing) => {
            if (err) {
              fs.unlinkSync(req.file.path);

              return res.status(500).json({
                success: false,
                message: "Unable to check previous submission."
              });
            }

            if (
              existing.length > 0 &&
              Number(assignment.allow_resubmission) !== 1
            ) {
              fs.unlinkSync(req.file.path);

              return res.status(403).json({
                success: false,
                message: "Resubmission is not allowed for this assignment."
              });
            }

            const filePath = "uploads/assignments/" + req.file.filename;

            if (existing.length > 0) {
              const updateQuery = `
                UPDATE submissions
                SET file_path = ?, submitted_at = CURRENT_TIMESTAMP,
                    status = 'submitted'
                WHERE assignment_id = ? AND student_id = ?
              `;

              db.query(
                updateQuery,
                [filePath, assignment_id, student_id],
                (err) => {
                  if (err) {
                    fs.unlinkSync(req.file.path);

                    return res.status(500).json({
                      success: false,
                      message: "Unable to update submission."
                    });
                  }

                  return res.json({
                    success: true,
                    message: "Assignment resubmitted successfully!"
                  });
                }
              );
            } else {
              const insertQuery = `
                INSERT INTO submissions
                (assignment_id, student_id, file_path, submitted_at, status)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'submitted')
              `;

              db.query(
                insertQuery,
                [assignment_id, student_id, filePath],
                (err) => {
                  if (err) {
                    fs.unlinkSync(req.file.path);

                    return res.status(500).json({
                      success: false,
                      message: "Unable to save submission."
                    });
                  }

                  const notificationQuery = `
  SELECT faculty_id, title
  FROM assignments
  WHERE id = ?
`;

db.query(notificationQuery, [assignment_id], (notifyErr, assignmentData) => {
  if (notifyErr || assignmentData.length === 0) {
    return res.json({
      success: true,
      message: "Assignment submitted successfully!"
    });
  }

  const facultyId = assignmentData[0].faculty_id;
  const assignmentTitle = assignmentData[0].title;

  const notificationInsert = `
    INSERT INTO notifications
    (student_id, recipient_id, recipient_role, sender_id,
     title, message, notification_type, related_id, is_read)
    VALUES (?, ?, 'faculty', ?, ?, ?, 'assignment_submission', ?, 0)
  `;

  db.query(
    notificationInsert,
    [
      student_id,
      facultyId,
      student_id,
      "New Assignment Submission",
      `A student submitted: ${assignmentTitle}`,
      assignment_id
    ],
    () => {
      return res.json({
        success: true,
        message: "Assignment submitted successfully!"
      });
    }
  );
});

                  return res.json({
                    success: true,
                    message: "Assignment submitted successfully!"
                  });
                }
              );
            }
          }
        );
      }
    );
  }
);

// Get submission status for student
router.get("/assignments/submission/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const query = `
    SELECT assignment_id, submitted_at, status
    FROM submissions
    WHERE student_id = ?
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Submission status error:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch submission status."
      });
    }

    res.json({
      success: true,
      submissions: results
    });
  });
});


 // Get student subject-wise attendance
router.get("/attendance/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const query = `
    SELECT
      a.subject_id,
      s.subject_name,
      COUNT(a.id) AS total_classes,
      SUM(
        CASE
          WHEN a.attendance_status = 'Present' THEN 1
          ELSE 0
        END
      ) AS attended_classes,
      SUM(
        CASE
          WHEN a.attendance_status = 'Absent' THEN 1
          ELSE 0
        END
      ) AS absent_classes,
      ROUND(
        (
          SUM(
            CASE
              WHEN a.attendance_status = 'Present' THEN 1
              ELSE 0
            END
          ) / COUNT(a.id)
        ) * 100,
        2
      ) AS attendance_percentage
    FROM attendance a
    JOIN subjects s
      ON s.id = a.subject_id
    WHERE a.student_id = ?
    GROUP BY a.subject_id, s.subject_name
    ORDER BY s.subject_name ASC
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Attendance fetch error:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch attendance."
      });
    }

    const totalClasses = results.reduce(
      (sum, subject) => sum + Number(subject.total_classes),
      0
    );

    const totalAttended = results.reduce(
      (sum, subject) => sum + Number(subject.attended_classes),
      0
    );

    const overallPercentage =
      totalClasses > 0
        ? Number(((totalAttended / totalClasses) * 100).toFixed(2))
        : 0;

    res.json({
      success: true,
      attendance: results,
      summary: {
        total_classes: totalClasses,
        attended_classes: totalAttended,
        overall_percentage: overallPercentage
      }
    });
  });
});


router.get("/midmarks/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const query = `
    SELECT
      m.subject_id,
      s.subject_name,
      m.exam_type,
      m.marks_obtained,
      m.max_marks
    FROM mid_marks m
    JOIN subjects s ON s.id = m.subject_id
    WHERE m.student_id = ?
    ORDER BY s.subject_name, m.exam_type
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Mid marks fetch error:", err);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch mid marks."
      });
    }

    res.json({
      success: true,
      marks: results
    });
  });
});


router.get("/results/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const query = `
    SELECT
      sr.subject_id,
      s.subject_name,
      sr.academic_year_id,
      sr.semester_number,
      sr.marks_obtained,
      sr.max_marks,
      sr.result_status
    FROM semester_results sr
    JOIN subjects s
      ON s.id = sr.subject_id
    WHERE sr.student_id = ?
    ORDER BY sr.academic_year_id, sr.semester_number, s.subject_name
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Semester results fetch error:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch semester results."
      });
    }

    res.json({
      success: true,
      results: results
    });
  });
});


router.get("/timetable/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const query = `
    SELECT
      t.id,
      t.day_of_week,
      t.start_time,
      t.end_time,
      t.room_number,
      s.subject_name,
      u.name AS faculty_name
    FROM timetables t
    JOIN student_enrollments se
      ON se.section_id = t.section_id
    JOIN subjects s
      ON s.id = t.subject_id
    JOIN users u
      ON u.id = t.faculty_id
    WHERE se.student_id = ?
    ORDER BY
      FIELD(
        t.day_of_week,
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ),
      t.start_time
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Timetable fetch error:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch timetable."
      });
    }

    res.json({
      success: true,
      timetable: results
    });
  });
});

// GET STUDENT NOTIFICATIONS
router.get("/notifications/:studentId", (req, res) => {
  const { studentId } = req.params;

  const sql = `
    SELECT id, title, message, notification_type, 
           is_read, created_at
    FROM notifications
    WHERE student_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("NOTIFICATIONS ERROR:", err);
      return res.status(500).json({
        message: "Failed to fetch notifications"
      });
    }

    res.json(results);
  });
});

// MARK NOTIFICATION AS READ
router.put("/notifications/read/:notificationId", (req, res) => {
  const { notificationId } = req.params;

  const sql = `
    UPDATE notifications
    SET is_read = 1
    WHERE id = ?
  `;

  db.query(sql, [notificationId], (err, result) => {
    if (err) {
      console.error("MARK READ ERROR:", err);
      return res.status(500).json({
        message: "Failed to update notification"
      });
    }

    res.json({
      message: "Notification marked as read"
    });
  });
});


module.exports = router;
