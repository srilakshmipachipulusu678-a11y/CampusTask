const express = require("express");
const router = express.Router();
const db = require("../db");
const requirePrincipal = require("../middleware/principalAuth");

router.get("/semester-results", requirePrincipal, (req, res) => {
  const query = `
    SELECT
      sr.id,
      sr.student_id,
      u.name AS student_name,
      u.email AS student_email,
      sr.subject_id,
      s.subject_name,
      sr.academic_year_id,
      ay.year_name AS academic_year,
      sr.semester_number,
      sr.marks_obtained,
      sr.max_marks,
      sr.result_status,
      sr.approval_status,
      sr.approved_by,
      sr.approved_at
    FROM semester_results sr
    JOIN users u ON u.id = sr.student_id
    JOIN subjects s ON s.id = sr.subject_id
    JOIN academic_years ay ON ay.id = sr.academic_year_id
    ORDER BY
      sr.approval_status = 'Pending' DESC,
      ay.year_name,
      sr.semester_number,
      u.name,
      s.subject_name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Principal results fetch error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch semester results."
      });
    }

    res.json({
      success: true,
      results
    });
  });
});

router.put("/semester-results/:resultId/approve", requirePrincipal, (req, res) => {
  const resultId = req.params.resultId;
  const principalId = req.user.id;

  const query = `
    UPDATE semester_results
    SET approval_status = 'Approved',
        approved_by = ?,
        approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND approval_status = 'Pending'
  `;

  db.query(query, [principalId, resultId], (err, result) => {
    if (err) {
      console.error("Result approval error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to approve result."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Result not found or already processed."
      });
    }

    res.json({
      success: true,
      message: "Semester result approved successfully."
    });
  });
});

router.put("/semester-results/:resultId/reject", requirePrincipal, (req, res) => {
  const resultId = req.params.resultId;
  const principalId = req.user.id;

  const query = `
    UPDATE semester_results
    SET approval_status = 'Rejected',
        approved_by = ?,
        approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND approval_status = 'Pending'
  `;

  db.query(query, [principalId, resultId], (err, result) => {
    if (err) {
      console.error("Result rejection error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to reject result."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Result not found or already processed."
      });
    }

    res.json({
      success: true,
      message: "Semester result rejected successfully."
    });
  });
});


router.get("/dashboard-overview", requirePrincipal, (req, res) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM users
       WHERE role = 'student' AND is_active = 1) AS total_students,

      (SELECT COUNT(*) FROM users
       WHERE role = 'faculty' AND is_active = 1) AS total_faculty,

      (SELECT COUNT(*) FROM departments
       WHERE is_active = 1) AS total_departments,

      (SELECT COUNT(*) FROM sections
       WHERE is_active = 1) AS total_sections,

      (SELECT year_name FROM academic_years
       WHERE is_current = 1 LIMIT 1) AS active_academic_year,

      (SELECT COUNT(*) FROM semester_results
       WHERE approval_status = 'Pending') AS pending_approvals
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Principal dashboard overview error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard overview."
      });
    }

    res.json({
      success: true,
      overview: results[0]
    });
  });
});


router.get("/faculty-monitoring", requirePrincipal, (req, res) => {
  const query = `
    SELECT
      f.id AS faculty_id,
      f.name AS faculty_name,
      f.email,
      f.is_active,
      GROUP_CONCAT(DISTINCT d.department_name SEPARATOR ', ') AS departments,
      GROUP_CONCAT(
        DISTINCT s.subject_name
        SEPARATOR ', '
      ) AS assigned_subjects,
      GROUP_CONCAT(
        DISTINCT CONCAT(
          sec.course_name,
          ' - Year ',
          sec.year_of_study,
          ' - Section ',
          sec.section_name
        )
        SEPARATOR ', '
      ) AS assigned_sections
    FROM users f
    LEFT JOIN faculty_sections fs
      ON fs.faculty_id = f.id
    LEFT JOIN sections sec
      ON sec.id = fs.section_id
    LEFT JOIN departments d
      ON d.id = sec.department_id
    LEFT JOIN subjects s
      ON s.id = fs.subject_id
    WHERE f.role = 'faculty'
    GROUP BY
      f.id,
      f.name,
      f.email,
      f.is_active
    ORDER BY f.name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Faculty monitoring error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch faculty details."
      });
    }

    res.json({
      success: true,
      total_faculty: results.length,
      faculty: results
    });
  });
});


router.get("/student-monitoring", requirePrincipal, (req, res) => {
  const query = `
    SELECT
      u.id AS student_id,
      u.name AS student_name,
      u.email,
      se.roll_number,
      d.department_name,
      sec.course_name,
      sec.year_of_study,
      sec.section_name,
      ay.year_name AS academic_year,
      u.is_active,
      se.status AS enrollment_status
    FROM users u
    LEFT JOIN student_enrollments se
      ON se.student_id = u.id
      AND se.status = 'active'
    LEFT JOIN sections sec
      ON sec.id = se.section_id
    LEFT JOIN departments d
      ON d.id = sec.department_id
    LEFT JOIN academic_years ay
      ON ay.id = sec.academic_year_id
    WHERE u.role = 'student'
    ORDER BY u.name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Student monitoring error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch student details."
      });
    }

    res.json({
      success: true,
      total_students: results.length,
      students: results
    });
  });
});



router.get("/attendance-overview", requirePrincipal, (req, res) => {
  const query = `
    SELECT
      a.student_id,
      u.name AS student_name,
      se.roll_number,
      a.subject_id,
      s.subject_name,
      a.attendance_date,
      a.attendance_status,
      d.department_name,
      sec.course_name,
      sec.year_of_study,
      sec.section_name
    FROM attendance a
    JOIN users u ON u.id = a.student_id
    LEFT JOIN student_enrollments se
      ON se.student_id = a.student_id
      AND se.status = 'active'
    LEFT JOIN sections sec ON sec.id = se.section_id
    LEFT JOIN departments d ON d.id = sec.department_id
    JOIN subjects s ON s.id = a.subject_id
    WHERE u.role = 'student'
    ORDER BY a.attendance_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Principal attendance overview error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch attendance details."
      });
    }

    const totalRecords = results.length;
    const presentRecords = results.filter(
      item => item.attendance_status === "Present"
    ).length;
    const absentRecords = results.filter(
      item => item.attendance_status === "Absent"
    ).length;

    const attendancePercentage = totalRecords > 0
      ? Number(((presentRecords / totalRecords) * 100).toFixed(2))
      : 0;

    res.json({
      success: true,
      overview: {
        total_records: totalRecords,
        present_records: presentRecords,
        absent_records: absentRecords,
        attendance_percentage: attendancePercentage
      },
      attendance: results
    });
  });
});



router.get("/attendance-breakdown", requirePrincipal, (req, res) => {
  const query = `
    SELECT
      COALESCE(d.department_name, 'Not Assigned') AS department_name,
      COALESCE(sec.course_name, 'Not Assigned') AS course_name,
      sec.year_of_study,
      COALESCE(sec.section_name, 'Not Assigned') AS section_name,
      COUNT(*) AS total_records,
      SUM(CASE
        WHEN a.attendance_status = 'Present' THEN 1
        ELSE 0
      END) AS present_records,
      SUM(CASE
        WHEN a.attendance_status = 'Absent' THEN 1
        ELSE 0
      END) AS absent_records,
      ROUND(
        SUM(CASE
          WHEN a.attendance_status = 'Present' THEN 1
          ELSE 0
        END) * 100.0 / COUNT(*),
        2
      ) AS attendance_percentage
    FROM attendance a
    LEFT JOIN student_enrollments se
      ON se.student_id = a.student_id
      AND se.status = 'active'
    LEFT JOIN sections sec
      ON sec.id = se.section_id
    LEFT JOIN departments d
      ON d.id = sec.department_id
    GROUP BY
      d.department_name,
      sec.course_name,
      sec.year_of_study,
      sec.section_name
    ORDER BY d.department_name, sec.section_name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Attendance breakdown error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch attendance breakdown."
      });
    }

    res.json({
      success: true,
      breakdown: results
    });
  });
});



router.get("/mid-marks-overview", requirePrincipal, (req, res) => {
  const query = `
    SELECT
      mm.id,
      mm.student_id,
      u.name AS student_name,
      se.roll_number,
      mm.subject_id,
      s.subject_name,
      s.semester,
      mm.exam_type,
      mm.marks_obtained,
      mm.max_marks,
      d.department_name,
      sec.course_name,
      sec.year_of_study,
      sec.section_name,
      mm.updated_at
    FROM mid_marks mm
    JOIN users u ON u.id = mm.student_id
    JOIN subjects s ON s.id = mm.subject_id
    LEFT JOIN student_enrollments se
      ON se.student_id = mm.student_id
      AND se.status = 'active'
    LEFT JOIN sections sec ON sec.id = se.section_id
    LEFT JOIN departments d ON d.id = sec.department_id
    WHERE u.role = 'student'
    ORDER BY mm.updated_at DESC, u.name, s.subject_name
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Principal mid marks overview error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch mid marks."
      });
    }

    const totalRecords = results.length;

    const averagePercentage = totalRecords > 0
      ? Number((
          results.reduce(
            (sum, item) =>
              sum + (Number(item.marks_obtained) / Number(item.max_marks)) * 100,
            0
          ) / totalRecords
        ).toFixed(2))
      : 0;

    res.json({
      success: true,
      overview: {
        total_records: totalRecords,
        average_percentage: averagePercentage
      },
      mid_marks: results
    });
  });
});


router.get("/academic-reports", requirePrincipal, async (req, res) => {
  const runQuery = (query) => {
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  };

  try {
    const [attendance, midMarks, semesterResults] = await Promise.all([
      runQuery(`
        SELECT
          COUNT(*) AS total_records,
          SUM(CASE WHEN LOWER(attendance_status) = 'present' THEN 1 ELSE 0 END) AS present,
          SUM(CASE WHEN LOWER(attendance_status) = 'absent' THEN 1 ELSE 0 END) AS absent,
          ROUND(
            SUM(CASE WHEN LOWER(attendance_status) = 'present' THEN 1 ELSE 0 END)
            * 100.0 / NULLIF(COUNT(*), 0),
            2
          ) AS attendance_percentage
        FROM attendance
      `),

      runQuery(`
        SELECT
          COUNT(*) AS total_records,
          ROUND(
            AVG(marks_obtained * 100.0 / NULLIF(max_marks, 0)),
            2
          ) AS average_percentage
        FROM mid_marks
      `),

      runQuery(`
        SELECT
          COUNT(*) AS total_records,
          SUM(CASE WHEN approval_status = 'Approved' THEN 1 ELSE 0 END) AS approved,
          SUM(CASE WHEN approval_status = 'Pending' THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN approval_status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
          SUM(CASE WHEN approval_status = 'Approved' AND result_status = 'Pass' THEN 1 ELSE 0 END) AS passed,
          SUM(CASE WHEN approval_status = 'Approved' AND result_status = 'Fail' THEN 1 ELSE 0 END) AS failed,
          ROUND(
            AVG(
              CASE
                WHEN approval_status = 'Approved'
                THEN marks_obtained * 100.0 / NULLIF(max_marks, 0)
              END
            ),
            2
          ) AS average_percentage
        FROM semester_results
      `)
    ]);

    res.json({
      success: true,
      reports: {
        attendance: attendance[0],
        mid_marks: midMarks[0],
        semester_results: semesterResults[0]
      }
    });
  } catch (error) {
    console.error("Academic reports error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch academic reports."
    });
  }
});


router.get("/timetable-overview", requirePrincipal, (req, res) => {
  const query = `
    SELECT
      t.id,
      t.day_of_week,
      t.start_time,
      t.end_time,
      t.room_number,
      s.section_name,
      s.course_name,
      s.year_of_study,
      d.department_name,
      sub.subject_code,
      sub.subject_name,
      u.name AS faculty_name,
      ay.year_name AS academic_year
    FROM timetables t
    JOIN sections s ON s.id = t.section_id
    JOIN subjects sub ON sub.id = t.subject_id
    JOIN users u ON u.id = t.faculty_id AND u.role = 'faculty'
    JOIN academic_years ay ON ay.id = t.academic_year_id
    LEFT JOIN departments d ON d.id = s.department_id
    ORDER BY
      FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
      t.start_time
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Principal timetable fetch error:", err);
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


router.get("/notifications", requirePrincipal, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      id,
      title,
      message,
      notification_type,
      related_id,
      is_read,
      created_at
    FROM notifications
    WHERE recipient_id = ?
      AND recipient_role = 'principal'
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Principal notifications error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications."
      });
    }

    res.json({
      success: true,
      notifications: results
    });
  });
});



module.exports = router;
