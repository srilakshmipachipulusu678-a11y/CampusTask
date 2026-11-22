
import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StudentDashboard({ user }) {
  const studentName = user?.name || "";

  const [activeSection, setActiveSection] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);

  const [studentProfile, setStudentProfile] = useState(user || null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState("");
  const [submissions, setSubmissions] = useState([]);
const [uploadingAssignment, setUploadingAssignment] = useState(null);
const [uploadMessage, setUploadMessage] = useState("");
const [attendance, setAttendance] = useState([]);
const [attendanceSummary, setAttendanceSummary] = useState({
  total_classes: 0,
  attended_classes: 0,
  overall_percentage: 0
});
const [attendanceLoading, setAttendanceLoading] = useState(false);
const [attendanceError, setAttendanceError] = useState("");
const [midMarks, setMidMarks] = useState([]);
const [marksLoading, setMarksLoading] = useState(false);
const [marksError, setMarksError] = useState("");
const [semesterResults, setSemesterResults] = useState([]);
const [resultsLoading, setResultsLoading] = useState(false);
const [resultsError, setResultsError] = useState("");
const [timetable, setTimetable] = useState([]);
const [timetableLoading, setTimetableLoading] = useState(false);
const [timetableError, setTimetableError] = useState("");
const [notifications, setNotifications] = useState([]);
const unreadCount = notifications.filter(
  (item) => Number(item.is_read) === 0
).length;
const [notificationsLoading, setNotificationsLoading] = useState(false);
const [notificationsError, setNotificationsError] = useState("");

const [dashboardSummary, setDashboardSummary] = useState({
  totalAssignments: 0,
  submittedAssignments: 0,
  pendingAssignments: 0,
});

  // Fetch Student Profile
  useEffect(() => {
    if (activeSection === "profile" && user?.id) {
      setProfileLoading(true);

      fetch(`http://localhost:5000/api/student/profile/${user.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load student profile");
          }
          return response.json();
        })
        .then((data) => {
          setStudentProfile(data.student);
          setProfileError("");
        })
        .catch((error) => {
          console.error("Profile error:", error);
          setProfileError("Unable to load profile.");
        })
        .finally(() => {
          setProfileLoading(false);
        });
    }
  }, [activeSection, user]);
  // Fetch student submission status
useEffect(() => {
  if (
    (activeSection === "assignments" ||
      activeSection === "dashboard") &&
    user?.id
  ) {
    fetch(
      `http://localhost:5000/api/student/assignments/submission/${user.id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
      })
      .catch((error) => {
        console.error("Submission status error:", error);
      });
  }
}, [activeSection, user]);


  // Fetch Student Assignments
useEffect(() => {
  if (
    (activeSection === "assignments" || activeSection === "dashboard") &&
    user?.id
  ) {
      setAssignmentsLoading(true);

      fetch(`http://localhost:5000/api/student/assignments/${user.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load assignments");
          }
          return response.json();
        })
        .then((data) => {
          setAssignments(data.assignments);
          setAssignmentsError("");
        })
        .catch((error) => {
          console.error("Assignments error:", error);
          setAssignmentsError("Unable to load assignments.");
        })
        .finally(() => {
          setAssignmentsLoading(false);
        });
    }
  }, [activeSection, user]);

  
useEffect(() => {
if ((activeSection === "attendance" || activeSection === "dashboard") && user?.id) {
    setAttendanceLoading(true);
    setAttendanceError("");

    fetch(`http://localhost:5000/api/student/attendance/${user.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch attendance");
        }
        return response.json();
      })
      .then((data) => {
        setAttendance(data.attendance || []);
        console.log(JSON.stringify(data.attendance, null, 2));
        setAttendanceSummary(
          data.summary || {
            total_classes: 0,
            attended_classes: 0,
            overall_percentage: 0,
          }
        );
      })
      .catch((error) => {
        console.error("Attendance error:", error);
        setAttendanceError("Unable to load attendance.");
      })
      .finally(() => {
        setAttendanceLoading(false);
      });
  }
}, [activeSection, user]);

useEffect(() => {
  if (activeSection === "marks" && user?.id) {
    setMarksLoading(true);
    setMarksError("");

    fetch(`http://localhost:5000/api/student/midmarks/${user.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch marks");
        }
        return response.json();
      })
      .then((data) => {
        setMidMarks(data.marks || []);
      })
      .catch((error) => {
        console.error("Mid marks error:", error);
        setMarksError("Unable to load mid marks.");
      })
      .finally(() => {
        setMarksLoading(false);
      });
  }
}, [activeSection, user]);

useEffect(() => {
  if (activeSection === "results" && user?.id) {
    setResultsLoading(true);
    setResultsError("");

    fetch(`http://localhost:5000/api/student/results/${user.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch semester results");
        }

        return response.json();
      })
      .then((data) => {
        setSemesterResults(data.results || []);
      })
      .catch((error) => {
        console.error("Results fetch error:", error);
        setResultsError("Unable to load semester results.");
      })
      .finally(() => {
        setResultsLoading(false);
      });
  }
}, [activeSection, user]);


useEffect(() => {
  if (activeSection === "timetable" && user?.id) {
    setTimetableLoading(true);
    setTimetableError("");

    fetch(`http://localhost:5000/api/student/timetable/${user.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch timetable");
        }

        return response.json();
      })
      .then((data) => {
        setTimetable(data.timetable || []);
      })
      .catch((error) => {
        console.error("Timetable error:", error);
        setTimetableError("Unable to load timetable.");
      })
      .finally(() => {
        setTimetableLoading(false);
      });
  }
}, [activeSection, user]);

useEffect(() => {
if (!user?.id) return;
  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const response = await fetch(
  `http://localhost:5000/api/notifications/${user.id}/student`
);

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Notifications error:", error);
      setNotificationsError("Unable to load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  fetchNotifications();
}, [activeSection, user?.id]);


useEffect(() => {
  const total = assignments.length;

  const submitted = assignments.filter((assignment) =>
    submissions.some(
      (submission) =>
        Number(submission.assignment_id) === Number(assignment.id)
    )
  ).length;

  setDashboardSummary({
    totalAssignments: total,
    submittedAssignments: submitted,
    pendingAssignments: total - submitted,
  });
}, [assignments, submissions]);

  // Handle assignment upload
const handleAssignmentUpload = async (assignmentId) => {
  const fileInput = document.getElementById(`file-${assignmentId}`);

  if (!fileInput || !fileInput.files[0]) {
    setUploadMessage("Please select a file first.");
    return;
  }

  const file = fileInput.files[0];

  const allowedExtensions = ["pdf", "doc", "docx", "txt"];
  const extension = file.name.split(".").pop().toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    setUploadMessage("Only PDF, DOC, DOCX and TXT files are allowed.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setUploadMessage("File size must not exceed 5 MB.");
    return;
  }

  const formData = new FormData();

  formData.append("assignmentFile", file);
  formData.append("assignment_id", assignmentId);
  formData.append("student_id", user.id);

  setUploadingAssignment(assignmentId);
  setUploadMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/student/assignments/submit",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setUploadMessage(data.message || "Upload failed.");
      return;
    }

    setUploadMessage(data.message);

    // Refresh submission status
    const statusResponse = await fetch(
      `http://localhost:5000/api/student/assignments/submission/${user.id}`
    );

    const statusData = await statusResponse.json();

    setSubmissions(statusData.submissions || []);
    fileInput.value = "";
  } catch (error) {
    console.error("Upload error:", error);
    setUploadMessage("Unable to connect to server.");
  } finally {
    setUploadingAssignment(null);
  }
};
  const handleLogout = () => {
    window.location.href = "/";
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "assignments", label: "Assignments", icon: "📚" },
    { id: "attendance", label: "Attendance", icon: "📊" },
    { id: "marks", label: "Mid Marks", icon: "📝" },
    { id: "timetable", label: "Timetable", icon: "🗓️" },
    { id: "profile", label: "My Profile", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },

  ];



  const renderContent = () => {
    switch (activeSection) {

      case "notifications":
  return (
    <section className="dashboard-section">
      <h2>🔔 Notifications</h2>

      {notificationsLoading && <p>Loading notifications...</p>}

      {notificationsError && <p>{notificationsError}</p>}

      {!notificationsLoading && notifications.length === 0 && (
        <p className="empty-message">
          No notifications yet.
        </p>
      )}

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card ${
              Number(notification.is_read) === 1 ? "read" : "unread"
            }`}
          >
            <h3>{notification.title}</h3>

            <p>{notification.message}</p>

            <small>
              {new Date(notification.created_at).toLocaleString("en-IN")}
            </small>

            {Number(notification.is_read) === 0 && (
              <button
                onClick={async () => {
                  const response = await fetch(
`http://localhost:5000/api/notifications/${notification.id}/read/${user.id}/student`,
                    { method: "PUT" }
                  );

                  if (response.ok) {
                    setNotifications((prev) =>
                      prev.map((item) =>
                        item.id === notification.id
                          ? { ...item, is_read: 1 }
                          : item
                      )
                    );
                  }
                }}
              >
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );


      case "assignments":
        return (
          <section className="dashboard-section">
            <h2>📚 My Assignments</h2>

            {assignmentsLoading && <p>Loading assignments...</p>}

            {assignmentsError && <p>{assignmentsError}</p>}

            {!assignmentsLoading && assignments.length === 0 && (
              <p className="empty-message">
                No assignments available.
              </p>
            )}

            <div className="assignments-list">
              {assignments.map((assignment) => (
                <div className="assignment-card" key={assignment.id}>
                  <h3>{assignment.title}</h3>

                  <p>{assignment.description}</p>

                  <p>
                    <strong>Subject:</strong> {assignment.subject_name}
                  </p>

                  <p>
                    <strong>Due Date:</strong>{" "}
                    {new Date(assignment.due_date).toLocaleDateString("en-IN")}
                  </p>

                  <p>
                    <strong>Maximum Marks:</strong> {assignment.max_marks}
                  </p>
                  {(() => {
  const submission = submissions.find(
    (item) => Number(item.assignment_id) === Number(assignment.id)
  );

  const isSubmitted = !!submission;

  const dueDate = new Date(assignment.due_date);
dueDate.setHours(23, 59, 59, 999);

const isExpired = new Date() > dueDate;

  const canResubmit =
    Number(assignment.allow_resubmission) === 1;

  return (
    <div className="assignment-actions">
      {isSubmitted ? (
        <span className="assignment-status submitted">
          ✅ Submitted
        </span>
      ) : isExpired ? (
        <span className="assignment-status expired">
          🔒 Time is up! Submission closed.
        </span>
      ) : (
        <span className="assignment-status">
          📝 Pending
        </span>
      )}

      {!isExpired && (!isSubmitted || canResubmit) && (
        <div className="upload-controls">
          <input
            type="file"
            id={`file-${assignment.id}`}
            accept=".pdf,.doc,.docx,.txt"
          />

          <button
            className="upload-btn"
            onClick={() => handleAssignmentUpload(assignment.id)}
            disabled={uploadingAssignment === assignment.id}
          >
            {uploadingAssignment === assignment.id
              ? "Uploading..."
              : isSubmitted
              ? "Resubmit Assignment"
              : "Upload Assignment"}
          </button>
        </div>
      )}

      {isSubmitted && !canResubmit && (
        <p className="upload-info">
          Resubmission is not allowed.
        </p>
      )}

      {uploadMessage && (
        <p className="upload-message">{uploadMessage}</p>
      )}
    </div>
  );
})()}
                </div>
              ))}
            </div>
          </section>
        );

      
case "attendance":
  return (
    <section className="dashboard-section">
      <h2>📊 My Attendance</h2>

      {attendanceLoading && <p>Loading attendance...</p>}

      {attendanceError && (
        <p className="upload-message">{attendanceError}</p>
      )}

      {!attendanceLoading && (
        <>
          <div className="attendance-overview">
            <div className="attendance-overview-card">
              <span>Overall Attendance</span>
              <h2>{attendanceSummary.overall_percentage}%</h2>

              <div className="attendance-progress">
                <div
                  className="attendance-progress-fill"
                  style={{
                    width: `${attendanceSummary.overall_percentage}%`,
                  }}
                ></div>
              </div>

              <p>
                {attendanceSummary.overall_percentage >= 75
                  ? "✅ You have sufficient attendance"
                  : "⚠️ Attendance is below 75%"}
              </p>
            </div>

            <div className="attendance-stat-card">
              <h3>Total Classes</h3>
              <h2>{attendanceSummary.total_classes}</h2>
            </div>

            <div className="attendance-stat-card">
              <h3>Classes Attended</h3>
              <h2>{attendanceSummary.attended_classes}</h2>
            </div>
          </div>

          <h3 className="attendance-subheading">
            📚 Subject-wise Attendance
          </h3>

          {attendance.length === 0 ? (
            <p className="empty-message">
              No attendance records available yet.
            </p>
          ) : (
            <div className="attendance-list">
              {attendance.map((subject) => (
                <div
                  className="attendance-card"
                  key={subject.subject_id}
                >
                  <div className="attendance-card-header">
                    <h3>{subject.subject_name}</h3>

                    <span
                      className={`attendance-badge ${
                        Number(subject.attendance_percentage) >= 75
                          ? "good"
                          : "low"
                      }`}
                    >
                      {subject.attendance_percentage}%
                    </span>
                  </div>

                  <div className="attendance-progress">
                    <div
                      className={`attendance-progress-fill ${
                        Number(subject.attendance_percentage) >= 75
                          ? "good-fill"
                          : "low-fill"
                      }`}
                      style={{
                        width: `${subject.attendance_percentage}%`,
                      }}
                    ></div>
                  </div>

                  <div className="attendance-card-details">
                    <span>
                      ✅ Present: {subject.attended_classes}
                    </span>

                    <span>
                      ❌ Absent: {subject.absent_classes}
                    </span>

                    <span>
                      📖 Total: {subject.total_classes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );


      
case "marks":
  return (
    <section className="dashboard-section">
      <h2>📝 My Mid Examination Marks</h2>

      {marksLoading && <p>Loading marks...</p>}

      {marksError && (
        <p className="upload-message">{marksError}</p>
      )}

      {!marksLoading && midMarks.length === 0 && (
        <p className="empty-message">
          No mid examination marks published yet.
        </p>
      )}

      {!marksLoading && midMarks.length > 0 && (
        <div className="marks-list">
          {midMarks.map((mark, index) => {
            const percentage =
              Number(mark.max_marks) > 0
                ? (
                    (Number(mark.marks_obtained) /
                      Number(mark.max_marks)) *
                    100
                  ).toFixed(1)
                : 0;

            return (
              <div className="marks-card" key={index}>
                <h3>{mark.subject_name}</h3>

                <span className="exam-badge">
                  {mark.exam_type}
                </span>

                <h2>
                  {mark.marks_obtained}
                  <span> / {mark.max_marks}</span>
                </h2>

                <div className="marks-progress">
                  <div
                    className="marks-progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <p>{percentage}% Score</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

        case "results":
        return (
          <section className="dashboard-section">
            <h2>🎓 Semester Results</h2>

            {resultsLoading && <p>Loading semester results...</p>}

            {resultsError && (
              <p className="upload-message">{resultsError}</p>
            )}

            {!resultsLoading && semesterResults.length === 0 && (
              <p className="empty-message">
                No semester results published yet.
              </p>
            )}

            {!resultsLoading &&
              Object.entries(
                semesterResults.reduce((groups, result) => {
                  const key = `Semester ${result.semester_number}`;

                  if (!groups[key]) {
                    groups[key] = [];
                  }

                  groups[key].push(result);
                  return groups;
                }, {})
              ).map(([semester, subjects]) => (
                <div className="semester-result-card" key={semester}>
                  <h3>{semester}</h3>

                  <div className="results-table-wrapper">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Marks</th>
                          <th>Result</th>
                        </tr>
                      </thead>

                      <tbody>
                        {subjects.map((result, index) => (
                          <tr key={`${result.subject_id}-${index}`}>
                            <td>{result.subject_name}</td>

                            <td>
                              {result.marks_obtained} / {result.max_marks}
                            </td>

                            <td>
                              <span
                                className={`result-badge ${
                                  result.result_status === "Pass"
                                    ? "pass"
                                    : result.result_status === "Fail"
                                    ? "fail"
                                    : "pending"
                                }`}
                              >
                                {result.result_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </section>
        );


      
case "timetable":
  return (
    <section className="dashboard-section">
      <h2>🗓️ My Weekly Timetable</h2>

      {timetableLoading && <p>Loading timetable...</p>}

      {timetableError && (
        <p className="upload-message">{timetableError}</p>
      )}

      {!timetableLoading && timetable.length === 0 && (
        <p className="empty-message">
          Your timetable has not been published yet.
        </p>
      )}

      {!timetableLoading && timetable.length > 0 && (
        <div className="timetable-list">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => {
            const dayClasses = timetable.filter(
              (item) => item.day_of_week === day
            );

            if (dayClasses.length === 0) return null;

            return (
              <div className="timetable-day" key={day}>
                <h3>{day}</h3>

                {dayClasses.map((item) => (
                  <div className="timetable-card" key={item.id}>
                    <h4>{item.subject_name}</h4>

                    <p>
                      🕒 {item.start_time.slice(0, 5)} –{" "}
                      {item.end_time.slice(0, 5)}
                    </p>

                    <p>👨‍🏫 {item.faculty_name}</p>

                    <p>📍 {item.room_number || "Room not assigned"}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

      case "profile":
        return (
          <section className="dashboard-section">
            <h2>👤 My Profile</h2>

            {profileLoading && <p>Loading profile...</p>}

            {profileError && <p>{profileError}</p>}

            {studentProfile && !profileLoading && (
              <div className="profile-details">
                <p>
                  <strong>Name:</strong> {studentProfile.name}
                </p>
                <p>
                  <strong>Roll Number:</strong> {studentProfile.roll_number}
                </p>
                <p>
                  <strong>Email:</strong> {studentProfile.email}
                </p>
                <p>
                  <strong>Role:</strong> {studentProfile.role}
                </p>
              </div>
            )}
          </section>
        );

      default:
  return (
    <section className="dashboard-section">

      <div className="attendance-graph-card">
  <h2>📊 My Attendance</h2>

  <div className="attendance-graph-summary">
    <div>
      <span>Total Classes</span>
      <h3>{attendanceSummary.total_classes}</h3>
    </div>

    <div>
      <span>Attended</span>
      <h3>{attendanceSummary.attended_classes}</h3>
    </div>

    <div>
      <span>Attendance</span>
      <h3>{attendanceSummary.overall_percentage}%</h3>
    </div>
  </div>

  <div className="attendance-chart">
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
  data={attendance}
  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
>
  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

  <XAxis
    dataKey="subject_name"
    tick={{ fill: "#6b7280", fontSize: 12 }}
  />

  <YAxis
    domain={[0, 100]}
    tickFormatter={(value) => `${value}%`}
    tick={{ fill: "#6b7280", fontSize: 12 }}
  />

  <Tooltip
    formatter={(value) => [`${value}%`, "Attendance"]}
  />

  <Line
    type="monotone"
    dataKey="attendance_percentage"
    stroke="#8b5cf6"
    strokeWidth={3}
    dot={{ r: 6, fill: "#8b5cf6" }}
    activeDot={{ r: 8 }}
  />
</LineChart>
    </ResponsiveContainer>
  </div>
</div>

      <h2>📌 Upcoming & Pending Tasks</h2>

    

      {assignmentsLoading && <p>Loading pending assignments...</p>}

      {!assignmentsLoading &&
        assignments.filter((assignment) => {
          const submission = submissions.find(
            (item) =>
              Number(item.assignment_id) === Number(assignment.id)
          );

          const dueDate = new Date(assignment.due_date);
          dueDate.setHours(23, 59, 59, 999);

          const isExpired = new Date() > dueDate;

          return !submission && !isExpired;
        }).length === 0 && (
          <p className="empty-message">
            🎉 No pending assignments. You are all caught up!
          </p>
        )}

      <div className="assignments-list">
        {assignments
          .filter((assignment) => {
            const submission = submissions.find(
              (item) =>
                Number(item.assignment_id) === Number(assignment.id)
            );

            const dueDate = new Date(assignment.due_date);
            dueDate.setHours(23, 59, 59, 999);

            const isExpired = new Date() > dueDate;

            return !submission && !isExpired;
          })
          .map((assignment) => (
            <div className="assignment-card" key={assignment.id}>
              <h3>{assignment.title}</h3>

              <p>{assignment.description}</p>

              <p>
                <strong>Subject:</strong> {assignment.subject_name}
              </p>

              <p>
                <strong>Due Date:</strong>{" "}
                {new Date(assignment.due_date).toLocaleDateString("en-IN")}
              </p>

              <p>
                <strong>Maximum Marks:</strong> {assignment.max_marks}
              </p>

              <span className="assignment-status">
                📝 Pending
              </span>

              <button
                className="upload-btn"
                onClick={() => setActiveSection("assignments")}
              >
                View Assignment
              </button>
            </div>
          ))}
      </div>
    </section>
  );
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="college-brand">
          <h2>NBKRIST</h2>
        </div>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main">

        {showNotifications && (
  <div className="notification-panel">
    <h3>🔔 Notifications</h3>

    {assignments
      .filter((assignment) => {
        const submission = submissions.find(
          (item) =>
            Number(item.assignment_id) === Number(assignment.id)
        );

        const dueDate = new Date(assignment.due_date);
        dueDate.setHours(23, 59, 59, 999);

        return !submission && new Date() <= dueDate;
      })
      .map((assignment) => (
        <div
          className="notification-item"
          key={assignment.id}
          onClick={() => {
            setActiveSection("assignments");
            setShowNotifications(false);
          }}
        >
          <strong>{assignment.title}</strong>
          <p>Assignment pending submission</p>
          <small>
            Due:{" "}
            {new Date(assignment.due_date).toLocaleDateString("en-IN")}
          </small>
        </div>
      ))}

    {assignments.filter((assignment) => {
      const submission = submissions.find(
        (item) =>
          Number(item.assignment_id) === Number(assignment.id)
      );

      const dueDate = new Date(assignment.due_date);
      dueDate.setHours(23, 59, 59, 999);

      return !submission && new Date() <= dueDate;
    }).length === 0 && (
      <p className="empty-message">No new notifications 🎉</p>
    )}
  </div>
)}

        <header className="dashboard-header">
          <div>
            <h1>
              Welcome back, {studentName.replace(/student/i, "").trim()}! 👋
            </h1>
            <p>NBKR Institute of Science and Technology</p>
          </div>

          <div className="header-actions">
  <button
  className="notification-btn"
  onClick={() => setShowNotifications(!showNotifications)}
  title="Notifications"
>
  🔔

  {unreadCount > 0 && (
    <span className="notification-count">
      {unreadCount}
    </span>
  )}
</button>

  <div className="student-avatar" title={studentName}>
    {studentName.charAt(0).toUpperCase()}
  </div>
</div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

export default StudentDashboard;
