const express = require("express");
const router = express.Router();
const db = require("../db");
const path = require("path");
const fs = require("fs");


// ==========================================

// GET FACULTY ASSIGNED SUBJECTS

// ==========================================



router.get("/subjects/:facultyId", (req, res) => {

  const { facultyId } = req.params;
const sql = "SELECT s.id AS subject_id, s.subject_name, s.subject_code, sec.id AS section_id, sec.section_name, fs.academic_year_id, ay.year_name FROM faculty_sections fs JOIN subjects s ON fs.subject_id = s.id JOIN sections sec ON fs.section_id = sec.id JOIN academic_years ay ON fs.academic_year_id = ay.id WHERE fs.faculty_id = ? ORDER BY s.subject_name";



  db.query(sql, [facultyId], (err, results) => {

    if (err) {

      console.error("Faculty subjects error:", err);

      return res.status(500).json({

        success: false,

        message: "Failed to fetch faculty subjects"

      });

    }



    res.json({

      success: true,

      subjects: results

    });

  });

});



// ==========================================

// GET FACULTY ASSIGNMENTS

// ==========================================



router.get("/assignments/:facultyId", (req, res) => {

  const { facultyId } = req.params;
 

const sql = "SELECT a.id, a.title, a.description, a.due_date, a.max_marks, a.allow_resubmission, a.subject_id, a.section_id, a.academic_year_id, s.subject_name, s.subject_code, sec.section_name, ay.year_name, COUNT(sub.id) AS submission_count FROM assignments a JOIN subjects s ON s.id = a.subject_id LEFT JOIN sections sec ON sec.id = a.section_id LEFT JOIN academic_years ay ON ay.id = a.academic_year_id LEFT JOIN submissions sub ON sub.assignment_id = a.id WHERE a.faculty_id = ? GROUP BY a.id ORDER BY a.due_date DESC";


  db.query(sql, [facultyId], (err, results) => {

    if (err) {

      console.error("Faculty assignments fetch error:", err);

      return res.status(500).json({

        success: false,

        message: "Failed to fetch assignments"

      });

    }



    res.json({

      success: true,

      assignments: results

    });

  });

});



// ==========================================

// CREATE ASSIGNMENT

// ==========================================



router.post("/assignments", (req, res) => {

  const {

    faculty_id,

    subject_id,

    section_id,

    academic_year_id,

    title,

    description,

    due_date,

    max_marks,

    allow_resubmission

  } = req.body;



  if (

    !faculty_id ||

    !subject_id ||

    !section_id ||

    !academic_year_id ||

    !title?.trim() ||

    !description?.trim() ||

    !due_date

  ) {

    return res.status(400).json({

      success: false,

      message: "Please fill all required assignment details."

    });

  }



  const marks = Number(max_marks || 100);



  if (!Number.isFinite(marks) || marks <= 0) {

    return res.status(400).json({

      success: false,

      message: "Maximum marks must be greater than zero."

    });

  }



  const verifySql = `

    SELECT id

    FROM faculty_sections

    WHERE faculty_id = ?

      AND subject_id = ?

      AND section_id = ?

      AND academic_year_id = ?

  `;



  db.query(

    verifySql,

    [faculty_id, subject_id, section_id, academic_year_id],

    (err, rows) => {

      if (err) {

        console.error("Assignment validation error:", err);

        return res.status(500).json({

          success: false,

          message: "Unable to validate faculty assignment."

        });

      }



      if (rows.length === 0) {

        return res.status(403).json({

          success: false,

          message: "You are not assigned to this subject and section."

        });

      }



      const insertSql = `

        INSERT INTO assignments (

          faculty_id,

          subject_id,

          section_id,

          academic_year_id,

          title,

          description,

          due_date,

          max_marks,

          allow_resubmission

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

      `;



      db.query(

        insertSql,

        [

          faculty_id,

          subject_id,

          section_id,

          academic_year_id,

          title.trim(),

          description.trim(),

          due_date,

          marks,

          allow_resubmission ? 1 : 0

        ],

        (insertErr, result) => {

          if (insertErr) {

            console.error("Assignment creation error:", insertErr);

            return res.status(500).json({

              success: false,

              message: "Failed to create assignment."

            });

          }



          res.status(201).json({

            success: true,

            message: "Assignment created successfully.",

            assignmentId: result.insertId

          });

        }

      );

    }

  );

});



// ==========================================

// UPDATE ASSIGNMENT

// ==========================================



router.put("/assignments/:assignmentId", (req, res) => {

  const { assignmentId } = req.params;



  const {

    faculty_id,

    subject_id,

    section_id,

    academic_year_id,

    title,

    description,

    due_date,

    max_marks,

    allow_resubmission

  } = req.body;



  if (

    !faculty_id ||

    !subject_id ||

    !section_id ||

    !academic_year_id ||

    !title?.trim() ||

    !description?.trim() ||

    !due_date

  ) {

    return res.status(400).json({

      success: false,

      message: "Please fill all required assignment details."

    });

  }



  const marks = Number(max_marks || 100);



  if (!Number.isFinite(marks) || marks <= 0) {

    return res.status(400).json({

      success: false,

      message: "Maximum marks must be greater than zero."

    });

  }



  const verifySql = `

    SELECT id

    FROM faculty_sections

    WHERE faculty_id = ?

      AND subject_id = ?

      AND section_id = ?

      AND academic_year_id = ?

  `;



  db.query(

    verifySql,

    [faculty_id, subject_id, section_id, academic_year_id],

    (err, rows) => {

      if (err) {

        console.error("Assignment validation error:", err);

        return res.status(500).json({

          success: false,

          message: "Unable to validate faculty assignment."

        });

      }



      if (rows.length === 0) {

        return res.status(403).json({

          success: false,

          message: "You are not assigned to this subject and section."

        });

      }



      const updateSql = `

        UPDATE assignments

        SET subject_id = ?,

            section_id = ?,

            academic_year_id = ?,

            title = ?,

            description = ?,

            due_date = ?,

            max_marks = ?,

            allow_resubmission = ?

        WHERE id = ? AND faculty_id = ?

      `;



      db.query(

        updateSql,

        [

          subject_id,

          section_id,

          academic_year_id,

          title.trim(),

          description.trim(),

          due_date,

          marks,

          allow_resubmission ? 1 : 0,

          assignmentId,

          faculty_id

        ],

        (updateErr, result) => {

          if (updateErr) {

            console.error("Assignment update error:", updateErr);

            return res.status(500).json({

              success: false,

              message: "Failed to update assignment."

            });

          }



          if (result.affectedRows === 0) {

            return res.status(404).json({

              success: false,

              message: "Assignment not found."

            });

          }

          res.json({

            success: true,

            message: "Assignment updated successfully."

          });

        }

      );

    }

  );

});



// ==========================================

// DELETE ASSIGNMENT

// ==========================================



router.delete("/assignments/:assignmentId", (req, res) => {

  const { faculty_id } = req.body;

  const { assignmentId } = req.params;



  if (!faculty_id) {

    return res.status(400).json({

      success: false,

      message: "Faculty ID is required."

    });

  }



  const sql = `

    DELETE FROM assignments

    WHERE id = ? AND faculty_id = ?

  `;



  db.query(sql, [assignmentId, faculty_id], (err, result) => {

    if (err) {

      console.error("Assignment deletion error:", err);

      return res.status(500).json({

        success: false,

        message: "Failed to delete assignment."

      });

    }



    if (result.affectedRows === 0) {

      return res.status(404).json({

        success: false,

        message: "Assignment not found."

      });

    }



    res.json({

      success: true,

      message: "Assignment deleted successfully."

    });

  });

});


/* ==========================================
   GET STUDENTS WHO HAVE NOT SUBMITTED
========================================== */

router.get("/not-submitted/:assignmentId", (req, res) => {
  const { assignmentId } = req.params;
  const { faculty_id } = req.query;

  if (!faculty_id) {
    return res.status(400).json({
      success: false,
      message: "Faculty ID is required."
    });
  }

  const sql = `
    SELECT
      se.student_id,
      se.roll_number,
      u.name AS student_name,
      u.email AS student_email
    FROM assignments a
    JOIN faculty_sections fs
      ON fs.faculty_id = a.faculty_id
      AND fs.section_id = a.section_id
      AND fs.subject_id = a.subject_id
      AND fs.academic_year_id = a.academic_year_id
    JOIN student_enrollments se
      ON se.section_id = fs.section_id
    JOIN users u
      ON u.id = se.student_id
    LEFT JOIN submissions sub
      ON sub.assignment_id = a.id
      AND sub.student_id = se.student_id
    WHERE a.id = ?
      AND a.faculty_id = ?
      AND se.status = 'active'
      AND sub.id IS NULL
    ORDER BY se.roll_number ASC
  `;

  db.query(sql, [assignmentId, faculty_id], (err, results) => {
    if (err) {
      console.error("Not submitted students error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch students who have not submitted."
      });
    }

    res.json({
      success: true,
      students: results
    });
  });
});




/* ==========================================
   GET STUDENT SUBMISSIONS
========================================== */

router.get("/submissions/:assignmentId", (req, res) => {
  const { assignmentId } = req.params;
  const { faculty_id } = req.query;

  if (!faculty_id) {
    return res.status(400).json({
      success: false,
      message: "Faculty ID is required."
    });
  }

  const sql = `
    SELECT
      sub.id AS submission_id,
      sub.student_id,
      sub.file_path,
      sub.submitted_at,
      sub.marks AS marks_obtained,
      sub.feedback,
      sub.status,
      u.name AS student_name,
      u.email AS student_email,
      a.title AS assignment_title,
      a.max_marks
    FROM submissions sub
    JOIN users u ON u.id = sub.student_id
    JOIN assignments a ON a.id = sub.assignment_id
    WHERE sub.assignment_id = ?
      AND a.faculty_id = ?
    ORDER BY sub.submitted_at DESC
  `;

  db.query(sql, [assignmentId, faculty_id], (err, results) => {
    if (err) {
      console.error("Faculty submissions fetch error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch submissions."
      });
    }

    res.json({
      success: true,
      submissions: results
    });
  });
});




/* ==========================================
   VIEW STUDENT SUBMISSION PDF
========================================== */

router.get("/submission-file/:submissionId", (req, res) => {
  const { submissionId } = req.params;
  const { faculty_id } = req.query;

  if (!faculty_id) {
    return res.status(400).json({
      success: false,
      message: "Faculty ID is required."
    });
  }

  const sql = `
    SELECT sub.file_path
    FROM submissions sub
    JOIN assignments a ON a.id = sub.assignment_id
    WHERE sub.id = ?
      AND a.faculty_id = ?
  `;

  db.query(sql, [submissionId, faculty_id], (err, results) => {
    if (err) {
      console.error("Submission file fetch error:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to open submission."
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found."
      });
    }

    const filePath = results[0].file_path;

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: "Submission file is missing."
      });
    }
    
const absolutePath = path.resolve(__dirname, "..", filePath);

fs.access(absolutePath, fs.constants.R_OK, (fileErr) => {
  if (fileErr) {
    console.error("Submission file missing:", fileErr);

    return res.status(404).json({
      success: false,
      message: "Submission file not found on server."
    });
  }

  const ext = path.extname(absolutePath).toLowerCase();

  const mimeTypes = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain"
  };

  const contentType = mimeTypes[ext];

  if (!contentType) {
    return res.status(400).json({
      success: false,
      message: "Unsupported submission file format."
    });
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", "inline");

  res.sendFile(absolutePath);
});

    
  });
});


// ==========================================

// EVALUATE STUDENT SUBMISSION

// ==========================================



router.put("/submissions/:submissionId/evaluate", (req, res) => {
  const { submissionId } = req.params;
  const { marks_obtained, feedback, faculty_id } = req.body;

  if (
    marks_obtained === undefined ||
    marks_obtained === null ||
    marks_obtained === "" ||
    !faculty_id
  ) {
    return res.status(400).json({
      success: false,
      message: "Marks and faculty ID are required."
    });
  }

  const marks = Number(marks_obtained);

  if (!Number.isFinite(marks) || marks < 0) {
    return res.status(400).json({
      success: false,
      message: "Please enter valid marks."
    });
  }

  // Validate submission ownership and maximum marks
  const checkSql =
    "SELECT sub.id, a.max_marks FROM submissions sub " +
    "JOIN assignments a ON a.id = sub.assignment_id " +
    "WHERE sub.id = ? AND a.faculty_id = ?";

  db.query(checkSql, [submissionId, faculty_id], (checkErr, results) => {
    if (checkErr) {
      console.error("Evaluation validation error:", checkErr);

      return res.status(500).json({
        success: false,
        message: "Failed to validate submission."
      });
    }

    if (!results.length) {
      return res.status(404).json({
        success: false,
        message: "Submission not found for this faculty."
      });
    }

    const maxMarks = Number(results[0].max_marks);

    if (marks > maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks cannot exceed ${maxMarks}.`
      });
    }

    const updateSql =
      "UPDATE submissions SET marks = ?, feedback = ?, " +
      "status = 'evaluated' WHERE id = ?";

    db.query(
      updateSql,
      [marks, feedback || "", submissionId],
      (updateErr) => {
        if (updateErr) {
          console.error("Evaluation update error:", updateErr);

          return res.status(500).json({
            success: false,
            message: "Failed to save evaluation."
          });
        }

        res.json({
          success: true,
          message: "Submission evaluated successfully."
        });
      }
    );
  });
});


// ==========================================

// GET STUDENTS AND EXISTING ATTENDANCE


router.get(
  "/attendance/:facultyId/:subjectId/:sectionId/:academicYearId/:date",
  (req, res) => {
    const {
      facultyId,
      subjectId,
      sectionId,
      academicYearId,
      date
    } = req.params;

    const checkFacultyQuery =
      "SELECT id FROM faculty_sections WHERE faculty_id = ? AND subject_id = ? AND section_id = ? AND academic_year_id = ?";

    db.query(
      checkFacultyQuery,
      [facultyId, subjectId, sectionId, academicYearId],
      (err, facultyResult) => {
        if (err) {
          console.error("Attendance faculty validation error:", err);

          return res.status(500).json({
            success: false,
            message: "Unable to verify faculty assignment."
          });
        }

        if (facultyResult.length === 0) {
          return res.status(403).json({
            success: false,
            message: "You are not assigned to this subject and section."
          });
        }

        const selectedDate = new Date(date + "T00:00:00");

        if (isNaN(selectedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid attendance date."
          });
        }

        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ];

        const dayOfWeek = days[selectedDate.getDay()];

        const timetableQuery = `
          SELECT id
          FROM timetables
          WHERE faculty_id = ?
            AND subject_id = ?
            AND section_id = ?
            AND academic_year_id = ?
            AND day_of_week = ?
        `;

        db.query(
          timetableQuery,
          [facultyId, subjectId, sectionId, academicYearId, dayOfWeek],
          (timetableErr, timetableResult) => {
            if (timetableErr) {
              console.error("Attendance timetable error:", timetableErr);

              return res.status(500).json({
                success: false,
                message: "Unable to check timetable."
              });
            }

            if (timetableResult.length === 0) {
              return res.json({
                success: true,
                hasClass: false,
                message: "No classes today",
                students: []
              });
            }

            const sql = `
              SELECT
                u.id AS student_id,
                u.name AS student_name,
                a.attendance_status
              FROM student_enrollments se
              JOIN users u ON u.id = se.student_id
              LEFT JOIN attendance a
                ON a.student_id = u.id
                AND a.subject_id = ?
                AND a.attendance_date = ?
              WHERE se.section_id = ?
                AND se.status = 'active'
                AND u.role = 'student'
              ORDER BY u.name
            `;

            db.query(
              sql,
              [subjectId, date, sectionId],
              (studentErr, students) => {
                if (studentErr) {
                  console.error("Attendance students error:", studentErr);

                  return res.status(500).json({
                    success: false,
                    message: "Unable to fetch students."
                  });
                }

                return res.json({
                  success: true,
                  hasClass: true,
                  students
                });
              }
            );
          }
        );
      }
    );
  }
);


// SAVE OR UPDATE ATTENDANCE

// ==========================================



router.post("/attendance", (req, res) => {

  const {

    faculty_id,

    subject_id,

    section_id,

    academic_year_id,

    attendance_date,

    attendance

  } = req.body;



  if (

    !faculty_id ||

    !subject_id ||

    !section_id ||

    !academic_year_id ||

    !attendance_date ||

    !Array.isArray(attendance) ||

    attendance.length === 0

  ) {

    return res.status(400).json({

      success: false,

      message: "Please provide all attendance details."

    });

  }



 const validStatuses = ["present", "absent", "late", "od"];



  for (const record of attendance) {

    if (

      !record.student_id ||

      !validStatuses.includes(record.attendance_status)

    ) {

      return res.status(400).json({

        success: false,

        message: "Invalid student attendance details."

      });

    }

  }

const checkFacultyQuery = "SELECT id FROM faculty_sections WHERE faculty_id = ? AND subject_id = ? AND section_id = ? AND academic_year_id = ?";

  db.query(
    studentsQuery,
    [section_id, academic_year_id],

    (err, facultyResult) => {

      if (err) {

        console.error("Attendance faculty validation error:", err);



        return res.status(500).json({

          success: false,

          message: "Unable to verify faculty assignment."

        });

      }



      if (facultyResult.length === 0) {

        return res.status(403).json({

          success: false,

          message: "You are not assigned to this subject and section."

        });

      }



      const studentsQuery = `

        SELECT student_id

        FROM student_enrollments

        WHERE section_id = ?

          AND academic_year_id = ?

          AND status = 'active'

      `;



      db.query(

        studentsQuery,

        [section_id, academic_year_id],

        (studentErr, studentResults) => {

          if (studentErr) {

            console.error("Attendance student validation error:", studentErr);



            return res.status(500).json({

              success: false,

              message: "Unable to verify students."

            });

          }



          const validStudentIds = new Set(

            studentResults.map(row => String(row.student_id))

          );



          for (const record of attendance) {

            if (!validStudentIds.has(String(record.student_id))) {

              return res.status(403).json({

                success: false,

                message: "Invalid student for this section."

              });

            }

          }



          let completed = 0;

          let hasError = false;



          attendance.forEach(record => {

            const checkQuery = `

              SELECT id

              FROM attendance

              WHERE student_id = ?

                AND subject_id = ?

                AND attendance_date = ?

            `;



            db.query(

              checkQuery,

              [

                record.student_id,

                subject_id,

                attendance_date

              ],

              (checkErr, existing) => {

                if (checkErr) {

                  hasError = true;

                  completed++;



                  if (completed === attendance.length) {

                    return res.status(500).json({

                      success: false,

                      message: "Failed to save attendance."

                    });

                  }



                  return;

                }



                if (existing.length > 0) {

                  const updateQuery = `

                    UPDATE attendance

                    SET attendance_status = ?,

                        updated_by = ?

                    WHERE student_id = ?

                      AND subject_id = ?

                      AND attendance_date = ?

                  `;



                  db.query(

                    updateQuery,

                    [
  record.attendance_status,
  faculty_id,
  record.student_id,
  subject_id,
  section_id,
  academic_year_id,
  attendance_date
],

                    updateErr => {

                      if (updateErr) hasError = true;



                      completed++;



                      if (completed === attendance.length) {

                        res.status(hasError ? 500 : 200).json({

                          success: !hasError,

                          message: hasError

                            ? "Some attendance records could not be saved."

                            : "Attendance saved successfully."

                        });

                      }

                    }

                  );

                } else {

                  const insertQuery = `

                    INSERT INTO attendance (

                     student_id,
subject_id,
section_id,
academic_year_id,
attendance_date,
attendance_status,
updated_by

                    )

                   VALUES (?, ?, ?, ?, ?, ?, ?)

                  `;



                  db.query(

                    insertQuery,

                    [
  record.student_id,
  subject_id,
  section_id,
  academic_year_id,
  attendance_date,
  record.attendance_status,
  faculty_id
],

                    insertErr => {

                      if (insertErr) hasError = true;



                      completed++;



                      if (completed === attendance.length) {

                        res.status(hasError ? 500 : 200).json({

                          success: !hasError,

                          message: hasError

                            ? "Some attendance records could not be saved."

                            : "Attendance saved successfully."

                        });

                      }

                    }

                  );

                }

              }

            );

          });

        }

      );

    }

  );

});


// ==========================================
// GET MID MARKS
// ==========================================

router.get("/midmarks/:facultyId/:subjectId/:sectionId/:academicYearId/:examType", (req, res) => {
  const {
    facultyId,
    subjectId,
    sectionId,
    academicYearId,
    examType
  } = req.params;

  if (!["Mid-1", "Mid-2"].includes(examType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid exam type."
    });
  }

  const verifySql = `
    SELECT id
    FROM faculty_sections
    WHERE faculty_id = ?
      AND subject_id = ?
      AND section_id = ?
      AND academic_year_id = ?
  `;

  db.query(
    verifySql,
    [facultyId, subjectId, sectionId, academicYearId],
    (err, facultyRows) => {
      if (err) {
        console.error("Faculty validation error:", err);
        return res.status(500).json({
          success: false,
          message: "Faculty validation failed."
        });
      }

      if (!facultyRows.length) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this subject and section."
        });
      }

      const sql = `
        SELECT
          se.student_id,
          se.roll_number,
          u.name AS student_name,
          m.id AS mark_id,
          m.marks_obtained,
          m.max_marks
        FROM student_enrollments se
        JOIN users u ON u.id = se.student_id
        LEFT JOIN mid_marks m
          ON m.student_id = se.student_id
          AND m.subject_id = ?
          AND m.exam_type = ?
        WHERE se.section_id = ?
          AND se.status = 'active'
          AND u.role = 'student'
        ORDER BY se.roll_number ASC
      `;

      db.query(
        sql,
        [subjectId, examType, sectionId],
        (fetchErr, results) => {
          if (fetchErr) {
            console.error("Mid marks fetch error:", fetchErr);
            return res.status(500).json({
              success: false,
              message: "Failed to fetch mid marks."
            });
          }

          res.json({
            success: true,
            students: results
          });
        }
      );
    }
  );
});


// ==========================================
// SAVE OR UPDATE MID MARKS
// ==========================================

router.post("/midmarks", (req, res) => {
  const {
    faculty_id,
    subject_id,
    section_id,
    academic_year_id,
    exam_type,
    marks
  } = req.body;

  if (
    !faculty_id ||
    !subject_id ||
    !section_id ||
    !academic_year_id ||
    !exam_type ||
    !Array.isArray(marks)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all mid marks details."
    });
  }

  if (!["Mid-1", "Mid-2"].includes(exam_type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid exam type."
    });
  }

  const maxMarks = 30;

  for (const record of marks) {
    if (
      !record.student_id ||
      record.marks_obtained === undefined ||
      record.marks_obtained === null ||
      record.marks_obtained === "" ||
      !Number.isFinite(Number(record.marks_obtained)) ||
      Number(record.marks_obtained) < 0 ||
      Number(record.marks_obtained) > maxMarks
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter valid marks between 0 and 30."
      });
    }
  }

  const verifySql = `
    SELECT id
    FROM faculty_sections
    WHERE faculty_id = ?
      AND subject_id = ?
      AND section_id = ?
      AND academic_year_id = ?
  `;

  db.query(
    verifySql,
    [faculty_id, subject_id, section_id, academic_year_id],
    (err, facultyRows) => {
      if (err) {
        console.error("Faculty validation error:", err);
        return res.status(500).json({
          success: false,
          message: "Faculty validation failed."
        });
      }

      if (!facultyRows.length) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this subject and section."
        });
      }

      const studentSql = `
        SELECT student_id
        FROM student_enrollments
        WHERE section_id = ?
          AND status = 'active'
      `;

      db.query(studentSql, [section_id], (studentErr, studentRows) => {
        if (studentErr) {
          console.error("Student validation error:", studentErr);
          return res.status(500).json({
            success: false,
            message: "Student validation failed."
          });
        }

        const validIds = new Set(
          studentRows.map(row => String(row.student_id))
        );

        for (const record of marks) {
          if (!validIds.has(String(record.student_id))) {
            return res.status(403).json({
              success: false,
              message: "Invalid student for this section."
            });
          }
        }

        if (marks.length === 0) {
          return res.json({
            success: true,
            message: "No marks to save."
          });
        }

        let completed = 0;
        let hasError = false;

        marks.forEach(record => {
          const checkSql = `
            SELECT id
            FROM mid_marks
            WHERE student_id = ?
              AND subject_id = ?
              AND exam_type = ?
          `;

          db.query(
            checkSql,
            [record.student_id, subject_id, exam_type],
            (checkErr, existing) => {
              if (checkErr) {
                console.error("Mid marks check error:", checkErr);
                hasError = true;
                completed++;
                return finish();
              }

              if (existing.length > 0) {
                const updateSql = `
                  UPDATE mid_marks
                  SET marks_obtained = ?,
                      max_marks = ?,
                      updated_by = ?
                  WHERE student_id = ?
                    AND subject_id = ?
                    AND exam_type = ?
                `;

                db.query(
                  updateSql,
                  [
                    Number(record.marks_obtained),
                    maxMarks,
                    faculty_id,
                    record.student_id,
                    subject_id,
                    exam_type
                  ],
                  updateErr => {
                    if (updateErr) {
                      console.error("Mid marks update error:", updateErr);
                      hasError = true;
                    }

                    completed++;
                    finish();
                  }
                );
              } else {
                const insertSql = `
                  INSERT INTO mid_marks
                    (student_id, subject_id, exam_type,
                     marks_obtained, max_marks, updated_by)
                  VALUES (?, ?, ?, ?, ?, ?)
                `;

                db.query(
                  insertSql,
                  [
                    record.student_id,
                    subject_id,
                    exam_type,
                    Number(record.marks_obtained),
                    maxMarks,
                    faculty_id
                  ],
                  insertErr => {
                    if (insertErr) {
                      console.error("Mid marks insert error:", insertErr);
                      hasError = true;
                    }

                    completed++;
                    finish();
                  }
                );
              }
            }
          );
        });

        function finish() {
          if (completed === marks.length) {
            res.status(hasError ? 500 : 200).json({
              success: !hasError,
              message: hasError
                ? "Some marks could not be saved."
                : "Mid marks saved successfully."
            });
          }
        }
      });
    }
  );
});



// ==========================================

// GET FACULTY TIMETABLE

// ==========================================




router.get("/timetable/:facultyId", (req, res) => {
  const { facultyId } = req.params;

  const sql = `
    SELECT
      t.id,
      t.day_of_week,
      t.start_time,
      t.end_time,
      t.room_number,
      t.subject_id,
      t.section_id,
      t.academic_year_id,
      s.subject_name AS subject_name,
      sec.section_name AS section_name
    FROM timetables t
    JOIN subjects s ON t.subject_id = s.id
    JOIN sections sec ON t.section_id = sec.id
    WHERE t.faculty_id = ?
    ORDER BY
      FIELD(t.day_of_week,
        'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday', 'Sunday'),
      t.start_time
  `;

  db.query(sql, [facultyId], (err, results) => {
    if (err) {
      console.error("Faculty timetable error:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch timetable."
      });
    }

    res.json({
      success: true,
      timetable: results
    });
  });
});






// ==========================================

// GET FACULTY PROFILE

// ==========================================



router.get("/profile/:facultyId", (req, res) => {

  const { facultyId } = req.params;



  const sql = `

    SELECT id, name, email, role, department_id

    FROM users

    WHERE id = ?

      AND role = 'faculty'

  `;



  db.query(sql, [facultyId], (err, results) => {

    if (err) {

      console.error("Faculty profile fetch error:", err);



      return res.status(500).json({

        success: false,

        message: "Failed to fetch faculty profile."

      });

    }



    if (!results.length) {

      return res.status(404).json({

        success: false,

        message: "Faculty profile not found."

      });

    }



    res.json({

      success: true,

      profile: results[0]

    });

  });

});



// ==========================================

// UPDATE FACULTY PROFILE

// ==========================================



router.put("/profile/:facultyId", (req, res) => {

  const { facultyId } = req.params;

  const { name, email } = req.body;



  if (!name?.trim() || !email?.trim()) {

    return res.status(400).json({

      success: false,

      message: "Name and email are required."

    });

  }



  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



  if (!emailRegex.test(email.trim())) {

    return res.status(400).json({

      success: false,

      message: "Please enter a valid email."

    });

  }



  const sql = `

    UPDATE users

    SET name = ?,

        email = ?

    WHERE id = ?

      AND role = 'faculty'

  `;



  db.query(

    sql,

    [name.trim(), email.trim(), facultyId],

    (err, result) => {

      if (err) {

        if (err.code === "ER_DUP_ENTRY") {

          return res.status(409).json({

            success: false,

            message: "This email is already registered."

          });

        }



        console.error("Faculty profile update error:", err);



        return res.status(500).json({

          success: false,

          message: "Failed to update faculty profile."

        });

      }



      if (result.affectedRows === 0) {

        return res.status(404).json({

          success: false,

          message: "Faculty profile not found or no changes made."

        });

      }



      res.json({

        success: true,

        message: "Faculty profile updated successfully."

      });

    }

  );

});



 // ==========================================
// FACULTY UPLOAD SEMESTER RESULTS
// ==========================================



router.post("/semester-results/upload", (req, res) => {
  const {
    facultyId,
    subjectId,
    sectionId,
    academicYearId,
    semesterNumber,
    results
  } = req.body;

  if (
    !facultyId ||
    !subjectId ||
    !sectionId ||
    !academicYearId ||
    !semesterNumber ||
    !Number.isInteger(Number(semesterNumber)) ||
    Number(semesterNumber) < 1 ||
    Number(semesterNumber) > 8 ||
    !Array.isArray(results) ||
    results.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide valid semester details and student results."
    });
  }

  const studentIds = new Set();

  for (const item of results) {
    const marks = Number(item.marksObtained);
    const maxMarks = Number(item.maxMarks ?? 100);

    if (
      !item.studentId ||
      studentIds.has(String(item.studentId)) ||
      item.marksObtained === "" ||
      item.marksObtained === undefined ||
      !Number.isFinite(marks) ||
      !Number.isFinite(maxMarks) ||
      marks < 0 ||
      maxMarks <= 0 ||
      marks > maxMarks
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or duplicate student marks. Check the entered marks."
      });
    }

    studentIds.add(String(item.studentId));
  }

  const checkFacultySql = `
    SELECT id
    FROM faculty_sections
    WHERE faculty_id = ?
      AND subject_id = ?
      AND section_id = ?
      AND academic_year_id = ?
  `;

  db.query(
    checkFacultySql,
    [facultyId, subjectId, sectionId, academicYearId],
    (err, facultyCheck) => {
      if (err) {
        console.error("Faculty assignment check error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to verify faculty assignment."
        });
      }

      if (!facultyCheck.length) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this subject and section."
        });
      }

      const placeholders = results.map(() => "?").join(",");

      const studentSql = `
        SELECT student_id
        FROM student_enrollments
        WHERE section_id = ?
          AND academic_year_id = ?
          AND status = 'active'
          AND student_id IN (${placeholders})
      `;

      db.query(
        studentSql,
        [sectionId, academicYearId, ...studentIds],
        (studentErr, studentRows) => {
          if (studentErr) {
            console.error("Student verification error:", studentErr);
            return res.status(500).json({
              success: false,
              message: "Failed to verify students."
            });
          }

          const validIds = new Set(
            studentRows.map(row => String(row.student_id))
          );

          if (
            validIds.size !== studentIds.size ||
            [...studentIds].some(id => !validIds.has(id))
          ) {
            return res.status(403).json({
              success: false,
              message: "Some students do not belong to this section."
            });
          }

          let completed = 0;
          let hasError = false;

          results.forEach(item => {
            const marks = Number(item.marksObtained);
            const maxMarks = Number(item.maxMarks ?? 100);
            const resultStatus =
              marks >= maxMarks * 0.35 ? "Pass" : "Fail";

            const checkSql = `
              SELECT id, approval_status
              FROM semester_results
              WHERE student_id = ?
                AND subject_id = ?
                AND academic_year_id = ?
                AND semester_number = ?
            `;

            db.query(
              checkSql,
              [item.studentId, subjectId, academicYearId, semesterNumber],
              (checkErr, existing) => {
                if (checkErr) {
                  console.error("Existing result check error:", checkErr);
                  hasError = true;
                  return finish();
                }

                if (existing.length > 0) {
                  const updateSql = `
                    UPDATE semester_results
                    SET marks_obtained = ?,
                        max_marks = ?,
                        result_status = ?,
                        updated_by = ?,
                        approval_status = 'Pending',
                        approved_by = NULL,
                        approved_at = NULL
                    WHERE id = ?
                  `;

                  db.query(
                    updateSql,
                    [
                      marks,
                      maxMarks,
                      resultStatus,
                      facultyId,
                      existing[0].id
                    ],
                    updateErr => {
                      if (updateErr) {
                        console.error("Result update error:", updateErr);
                        hasError = true;
                      }
                      finish();
                    }
                  );
                } else {
                  const insertSql = `
                    INSERT INTO semester_results (
                      student_id,
                      subject_id,
                      academic_year_id,
                      semester_number,
                      marks_obtained,
                      max_marks,
                      result_status,
                      updated_by,
                      approval_status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
                  `;

                  db.query(
                    insertSql,
                    [
                      item.studentId,
                      subjectId,
                      academicYearId,
                      semesterNumber,
                      marks,
                      maxMarks,
                      resultStatus,
                      facultyId
                    ],
                    insertErr => {
                      if (insertErr) {
                        console.error("Result insert error:", insertErr);
                        hasError = true;
                      }
                      finish();
                    }
                  );
                }
              }
            );
          });

          function finish() {
            completed++;

            if (completed === results.length) {
              res.status(hasError ? 500 : 200).json({
                success: !hasError,
                message: hasError
                  ? "Some semester results could not be saved."
                  : "Semester results saved and sent for approval.",
                processedCount: completed
              });
            }
          }
        }
      );
    }
  );
});





router.get("/semester-results/:facultyId", async (req, res) => {
  const { facultyId } = req.params;
  const { subjectId, sectionId, academicYearId } = req.query;

  if (!subjectId || !sectionId || !academicYearId) {
    return res.status(400).json({
      message: "Subject, section and academic year are required."
    });
  }

  try {
    const [assignment] = await db.promise().query(
      `SELECT id
       FROM faculty_sections
       WHERE faculty_id = ?
       AND subject_id = ?
       AND section_id = ?
       AND academic_year_id = ?`,
      [facultyId, subjectId, sectionId, academicYearId]
    );

    if (assignment.length === 0) {
      return res.status(403).json({
        message: "You are not assigned to this subject and section."
      });
    }

   const [students] = await db.promise().query(
  `SELECT
     u.id AS student_id,
     u.name AS student_name,
     se.roll_number
   FROM student_enrollments se
   JOIN users u ON u.id = se.student_id
   WHERE se.section_id = ?
   AND se.status = 'active'
   AND u.role = 'student'
   ORDER BY se.roll_number`,
  [sectionId]
);

    return res.json({ students });
  } catch (error) {
    console.error("Semester results students error:", error);
    return res.status(500).json({
      message: "Unable to load students."
    });
  }
});


// ==========================================

// EXPORT ROUTER

// ==========================================



module.exports = router;
