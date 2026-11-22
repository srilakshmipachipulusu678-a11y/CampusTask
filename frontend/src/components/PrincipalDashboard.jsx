
import { useState, useEffect } from "react";
import "./PrincipalDashboard.css";

function PrincipalDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");

  const [overview, setOverview] = useState(null);
const [overviewLoading, setOverviewLoading] = useState(false);
const [overviewError, setOverviewError] = useState("");

const [facultyList, setFacultyList] = useState([]);
const [facultyLoading, setFacultyLoading] = useState(false);
const [facultyError, setFacultyError] = useState("");

const [studentList, setStudentList] = useState([]);
const [studentLoading, setStudentLoading] = useState(false);
const [studentError, setStudentError] = useState("");

const [attendanceData, setAttendanceData] = useState([]);
const [attendanceOverview, setAttendanceOverview] = useState(null);
const [attendanceLoading, setAttendanceLoading] = useState(false);
const [attendanceError, setAttendanceError] = useState("");
const [attendanceBreakdown, setAttendanceBreakdown] = useState([]);

const [midMarksData, setMidMarksData] = useState([]);
const [midMarksOverview, setMidMarksOverview] = useState(null);
const [midMarksLoading, setMidMarksLoading] = useState(false);
const [midMarksError, setMidMarksError] = useState("");

const [academicReports, setAcademicReports] = useState(null);
const [academicReportsLoading, setAcademicReportsLoading] = useState(false);
const [academicReportsError, setAcademicReportsError] = useState("");

const [timetableData, setTimetableData] = useState([]);
const [timetableLoading, setTimetableLoading] = useState(false);
const [timetableError, setTimetableError] = useState("");

const [notifications, setNotifications] = useState([]);
const [notificationsLoading, setNotificationsLoading] = useState(false);
const [notificationsError, setNotificationsError] = useState("");

  const menuItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Faculty Monitoring", icon: "♙" },
    { name: "Student Monitoring", icon: "♧" },
    { name: "Attendance", icon: "▦" },
    { name: "Mid Marks", icon: "▥" },
    { name: "Semester Results", icon: "🎓" },
    { name: "Academic Reports", icon: "▤" },
    { name: "Timetable", icon: "▦" },
    { name: "Notifications", icon: "♧" },
    { name: "My Profile", icon: "♙" }
  ];

const fetchDashboardOverview = async () => {
  setOverviewLoading(true);
  setOverviewError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/principal/dashboard-overview",
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch dashboard overview");
    }

    setOverview(data.overview);
  } catch (error) {
    setOverviewError(error.message);
  } finally {
    setOverviewLoading(false);
  }
};

const fetchFacultyMonitoring = async () => {
  setFacultyLoading(true);
  setFacultyError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/principal/faculty-monitoring",
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch faculty details");
    }

    setFacultyList(data.faculty || []);
  } catch (error) {
    setFacultyError(error.message);
  } finally {
    setFacultyLoading(false);
  }
};

const fetchStudentMonitoring = async () => {
  setStudentLoading(true);
  setStudentError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/principal/student-monitoring",
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch student details");
    }

    setStudentList(data.students || []);
  } catch (error) {
    setStudentError(error.message);
  } finally {
    setStudentLoading(false);
  }
};

const fetchAttendanceOverview = async () => {
  setAttendanceLoading(true);
  setAttendanceError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/principal/attendance-overview",
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch attendance details");
    }

    setAttendanceData(data.attendance || []);
    setAttendanceOverview(data.overview || null);
  } catch (error) {
    setAttendanceError(error.message);
  } finally {
    setAttendanceLoading(false);
  }
};


const fetchAttendanceBreakdown = async () => {
  setAttendanceLoading(true);
  setAttendanceError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/principal/attendance-breakdown",
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch attendance breakdown");
    }

    setAttendanceBreakdown(data.breakdown || []);
  } catch (error) {
    setAttendanceError(error.message);
  } finally {
    setAttendanceLoading(false);
  }
};



const fetchMidMarksOverview = async () => {
  setMidMarksLoading(true);
  setMidMarksError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/principal/mid-marks-overview",
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch mid marks");
    }

    setMidMarksData(data.mid_marks || []);
    setMidMarksOverview(data.overview || null);
  } catch (error) {
    setMidMarksError(error.message);
  } finally {
    setMidMarksLoading(false);
  }
};

const fetchAcademicReports = async () => {
  setAcademicReportsLoading(true);
  setAcademicReportsError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/principal/academic-reports",
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch academic reports");
    }

    setAcademicReports(data.reports || null);
  } catch (error) {
    setAcademicReportsError(error.message);
  } finally {
    setAcademicReportsLoading(false);
  }
};

const fetchTimetable = async () => {
  setTimetableLoading(true);
  setTimetableError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/principal/timetable-overview",
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch timetable");
    }

    setTimetableData(data.timetable || []);
  } catch (error) {
    setTimetableError(error.message);
  } finally {
    setTimetableLoading(false);
  }
};

const fetchNotifications = async () => {
  setNotificationsLoading(true);
  setNotificationsError("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/principal/notifications",
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch notifications");
    }

    setNotifications(data.notifications || []);
  } catch (error) {
    setNotificationsError(error.message);
  } finally {
    setNotificationsLoading(false);
  }
};

  const fetchSemesterResults = async () => {
    setResultsLoading(true);
    setResultsError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/principal/semester-results",
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch semester results");
      }

      setResults(data.results || []);
    } catch (error) {
      setResultsError(error.message);
    } finally {
      setResultsLoading(false);
    }
  };

  const handleResultAction = async (resultId, action) => {
    const confirmAction = window.confirm(
      `Are you sure you want to ${action} this semester result?`
    );

    if (!confirmAction) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/principal/semester-results/${resultId}/${action}`,
        {
          method: "PUT",
          credentials: "include"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} result`);
      }

      alert(data.message);
      fetchSemesterResults();
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
  if (activeTab === "Dashboard") {
    fetchDashboardOverview();
  }

  if (activeTab === "Faculty Monitoring") {
    fetchFacultyMonitoring();
  }

  if (activeTab === "Student Monitoring") {
    fetchStudentMonitoring();
  }

  if (activeTab === "Attendance") {
  fetchAttendanceOverview();
  fetchAttendanceBreakdown();
}

if (activeTab === "Mid Marks") {
  fetchMidMarksOverview();
}

if (activeTab === "Academic Reports") {
  fetchAcademicReports();
}

if (activeTab === "Timetable") {
  fetchTimetable();
}

if (activeTab === "Notifications") {
  fetchNotifications();
}

  if (activeTab === "Semester Results") {
    fetchSemesterResults();
  }
}, [activeTab]);

  return (
    <div className="principal-layout">
      <aside className="principal-sidebar">
        <div className="principal-brand">
          <img
            src="/images/nbkr-logo.png"
            alt="NBKRIST Logo"
            className="principal-logo"
          />

          <div className="principal-brand-text">
            <h2>NBKRIST</h2>
            <p>
              NBKR Institute of
              <br />
              Science and Technology
            </p>
          </div>
        </div>

        <nav className="principal-navigation">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`principal-nav-item ${
                activeTab === item.name ? "active" : ""
              }`}
              onClick={() => setActiveTab(item.name)}
            >
              <span className="principal-nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <button className="principal-logout-btn" onClick={onLogout}>
          ⇥ &nbsp; Logout
        </button>
      </aside>

      <main className="principal-main">
        <div className="principal-decoration-top"></div>
        <div className="principal-decoration-bottom"></div>

        <header className="principal-header">
          <div className="principal-title-row">
            <span className="principal-title-icon">🎓</span>
            <h1>{activeTab}</h1>
          </div>

          <div className="principal-welcome">
            <span>♟</span>
            <p>Welcome, {user?.name || "College Principal"}!</p>
          </div>
        </header>

        <div className="principal-content">
          {activeTab === "Dashboard" && (
  <section className="principal-dashboard-overview">
    <div className="principal-dashboard-heading">
      <h2>Academic Overview</h2>
      <p>Welcome to your college administration dashboard.</p>
    </div>

    {overviewLoading && (
      <p className="overview-loading">Loading dashboard details...</p>
    )}

    {overviewError && (
      <p className="overview-error">{overviewError}</p>
    )}

    {!overviewLoading && !overviewError && overview && (
      <>
        <div className="principal-overview-grid">
          <div className="overview-card">
            <span className="overview-card-icon">🎓</span>
            <p>Total Students</p>
            <h3>{overview.total_students}</h3>
          </div>

          <div className="overview-card">
            <span className="overview-card-icon">👨‍🏫</span>
            <p>Total Faculty</p>
            <h3>{overview.total_faculty}</h3>
          </div>

          <div className="overview-card">
            <span className="overview-card-icon">🏢</span>
            <p>Departments</p>
            <h3>{overview.total_departments}</h3>
          </div>

          <div className="overview-card">
            <span className="overview-card-icon">📚</span>
            <p>Total Sections</p>
            <h3>{overview.total_sections}</h3>
          </div>

          <div className="overview-card">
            <span className="overview-card-icon">📅</span>
            <p>Active Academic Year</p>
            <h3>{overview.active_academic_year || "Not Set"}</h3>
          </div>

          <div className="overview-card">
            <span className="overview-card-icon">⏳</span>
            <p>Pending Approvals</p>
            <h3>{overview.pending_approvals}</h3>
          </div>
        </div>

        <div className="principal-recent-activities">
          <h2>Recent Notifications</h2>
          <p>No recent notifications available.</p>
        </div>
      </>
    )}
  </section>
)}

          {activeTab === "Semester Results" && (
            <section className="principal-card results-section">
              <h2 className="principal-section-title">
                Semester Results Approval
              </h2>

              {resultsLoading && (
                <p className="principal-loading">
                  Loading semester results...
                </p>
              )}

              {resultsError && (
                <p className="principal-error">{resultsError}</p>
              )}

              {!resultsLoading && !resultsError && results.length === 0 && (
                <div className="principal-empty">
                  <div className="principal-empty-icon">🎓</div>
                  <p>No semester results available.</p>
                </div>
              )}

              {!resultsLoading && !resultsError && results.length > 0 && (
                <div className="principal-table-wrapper">
                  <table className="principal-results-table">
                    <thead>
                      <tr>
                        {[
                          "Student",
                          "Subject",
                          "Academic Year",
                          "Semester",
                          "Marks",
                          "Result",
                          "Approval",
                          "Action"
                        ].map((heading) => (
                          <th key={heading}>{heading}</th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {results.map((item) => (
                        <tr key={item.id}>
                          <td>{item.student_name}</td>
                          <td>{item.subject_name}</td>
                          <td>{item.academic_year}</td>
                          <td>{item.semester_number}</td>
                          <td>
                            {item.marks_obtained}/{item.max_marks}
                          </td>
                          <td>{item.result_status}</td>
                          <td>
                            <span
                              className={`approval-status ${
                                item.approval_status?.toLowerCase()
                              }`}
                            >
                              {item.approval_status}
                            </span>
                          </td>
                          <td>
                            {item.approval_status === "Pending" ? (
                              <div className="principal-action-buttons">
                                <button
                                  className="approve-btn"
                                  onClick={() =>
                                    handleResultAction(item.id, "approve")
                                  }
                                >
                                  Approve
                                </button>

                                <button
                                  className="reject-btn"
                                  onClick={() =>
                                    handleResultAction(item.id, "reject")
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span
                                className={`final-status ${
                                  item.approval_status === "Approved"
                                    ? "approved"
                                    : "rejected"
                                }`}
                              >
                                {item.approval_status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === "Faculty Monitoring" && (
  <section className="principal-card faculty-monitoring-section">
    <div className="faculty-monitoring-heading">
      <h2>Faculty Monitoring</h2>
      <p>View faculty details and their academic assignments.</p>
      <div className="faculty-total">
        Total Faculty: {facultyList.length}
      </div>
    </div>

    {facultyLoading && (
      <p className="principal-loading">Loading faculty details...</p>
    )}

    {facultyError && (
      <p className="principal-error">{facultyError}</p>
    )}

    {!facultyLoading && !facultyError && facultyList.length === 0 && (
      <div className="principal-empty">
        <p>No faculty records available.</p>
      </div>
    )}

    {!facultyLoading && !facultyError && facultyList.length > 0 && (
      <div className="principal-table-wrapper">
        <table className="principal-results-table faculty-table">
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Assigned Subjects</th>
              <th>Assigned Sections</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {facultyList.map((faculty) => (
              <tr key={faculty.faculty_id}>
                <td>{faculty.faculty_name}</td>
                <td>{faculty.email}</td>
                <td>{faculty.departments || "Not Assigned"}</td>
                <td>{faculty.assigned_subjects || "Not Assigned"}</td>
                <td>{faculty.assigned_sections || "Not Assigned"}</td>
                <td>
                  <span className={`faculty-status ${
                    Number(faculty.is_active) === 1 ? "active" : "inactive"
                  }`}>
                    {Number(faculty.is_active) === 1 ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}


{activeTab === "Student Monitoring" && (
  <section className="principal-card student-monitoring-section">
    <div className="student-monitoring-heading">
      <h2>Student Monitoring</h2>
      <p>View student profiles and academic enrollment details.</p>
      <div className="student-total">
        Total Students: {studentList.length}
      </div>
    </div>

    {studentLoading && (
      <p className="principal-loading">Loading student details...</p>
    )}

    {studentError && (
      <p className="principal-error">{studentError}</p>
    )}

    {!studentLoading && !studentError && studentList.length === 0 && (
      <div className="principal-empty">
        <p>No student records available.</p>
      </div>
    )}

    {!studentLoading && !studentError && studentList.length > 0 && (
      <div className="principal-table-wrapper">
        <table className="principal-results-table student-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll Number</th>
              <th>Email</th>
              <th>Department</th>
              <th>Course & Year</th>
              <th>Section</th>
              <th>Academic Year</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {studentList.map((student) => (
              <tr key={student.student_id}>
                <td>{student.student_name}</td>
                <td>{student.roll_number || "Not Assigned"}</td>
                <td>{student.email}</td>
                <td>{student.department_name || "Not Assigned"}</td>
                <td>
                  {student.course_name
                    ? `${student.course_name} - Year ${student.year_of_study}`
                    : "Not Assigned"}
                </td>
                <td>{student.section_name || "Not Assigned"}</td>
                <td>{student.academic_year || "Not Assigned"}</td>
                <td>
                  <span className={`faculty-status ${
                    Number(student.is_active) === 1 ? "active" : "inactive"
                  }`}>
                    {Number(student.is_active) === 1 ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}

          

{activeTab === "Attendance" && (
  <section className="principal-card attendance-overview-section">
    <div className="attendance-heading">
      <h2>Attendance Overview</h2>
      <p>Monitor overall student attendance records.</p>
    </div>

    {attendanceLoading && (
      <p className="principal-loading">Loading attendance details...</p>
    )}

    {attendanceError && (
      <p className="principal-error">{attendanceError}</p>
    )}

    {!attendanceLoading && !attendanceError && attendanceOverview && (
      <>
        <div className="attendance-summary-grid">
          <div className="attendance-summary-card">
            <p>Total Records</p>
            <h3>{attendanceOverview.total_records}</h3>
          </div>

          <div className="attendance-summary-card">
            <p>Present</p>
            <h3>{attendanceOverview.present_records}</h3>
          </div>

          <div className="attendance-summary-card">
            <p>Absent</p>
            <h3>{attendanceOverview.absent_records}</h3>
          </div>

          <div className="attendance-summary-card">
            <p>Attendance Percentage</p>
            <h3>{attendanceOverview.attendance_percentage}%</h3>
          </div>
        </div>
        
<div className="attendance-breakdown-section">
  <h2>Department & Section-wise Attendance</h2>

  {attendanceBreakdown.length === 0 ? (
    <p>No attendance breakdown available.</p>
  ) : (
    <div className="principal-table-wrapper">
      <table className="principal-results-table attendance-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Course</th>
            <th>Year</th>
            <th>Section</th>
            <th>Total Records</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Attendance %</th>
          </tr>
        </thead>

        <tbody>
          {attendanceBreakdown.map((item, index) => (
            <tr key={index}>
              <td>{item.department_name}</td>
              <td>{item.course_name}</td>
              <td>{item.year_of_study || "N/A"}</td>
              <td>{item.section_name}</td>
              <td>{item.total_records}</td>
              <td>{item.present_records}</td>
              <td>{item.absent_records}</td>
              <td>{item.attendance_percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


        <div className="principal-table-wrapper">
          <table className="principal-results-table attendance-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Subject</th>
                <th>Department</th>
                <th>Section</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendanceData.map((item, index) => (
                <tr key={`${item.student_id}-${item.subject_id}-${item.attendance_date}-${index}`}>
                  <td>{item.student_name}</td>
                  <td>{item.roll_number || "Not Assigned"}</td>
                  <td>{item.subject_name}</td>
                  <td>{item.department_name || "Not Assigned"}</td>
                  <td>{item.section_name || "Not Assigned"}</td>
                  <td>{new Date(item.attendance_date).toLocaleDateString("en-IN")}</td>
                  <td>
                    <span className={`faculty-status ${
                      item.attendance_status?.toLowerCase()
                    }`}>
                      {item.attendance_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </section>
)}



          
{activeTab === "Mid Marks" && (
  <section className="principal-card mid-marks-section">
    <div className="mid-marks-heading">
      <h2>Mid Marks Monitoring</h2>
      <p>View student performance in mid examinations.</p>
    </div>

    {midMarksLoading && (
      <p className="principal-loading">Loading mid marks...</p>
    )}

    {midMarksError && (
      <p className="principal-error">{midMarksError}</p>
    )}

    {!midMarksLoading && !midMarksError && midMarksOverview && (
      <>
        <div className="mid-marks-summary-grid">
          <div className="mid-summary-card">
            <p>Total Records</p>
            <h3>{midMarksOverview.total_records}</h3>
          </div>

          <div className="mid-summary-card">
            <p>Average Percentage</p>
            <h3>{midMarksOverview.average_percentage}%</h3>
          </div>
        </div>

        {midMarksData.length === 0 ? (
          <p>No mid marks records available.</p>
        ) : (
          <div className="principal-table-wrapper">
            <table className="principal-results-table mid-marks-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th>Department</th>
                  <th>Section</th>
                </tr>
              </thead>

              <tbody>
                {midMarksData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.student_name}</td>
                    <td>{item.roll_number || "Not Assigned"}</td>
                    <td>{item.subject_name}</td>
                    <td>{item.exam_type}</td>
                    <td>{item.marks_obtained}/{item.max_marks}</td>
                    <td>{item.department_name || "Not Assigned"}</td>
                    <td>{item.section_name || "Not Assigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    )}
  </section>
)}


          {activeTab === "Academic Reports" && (
  <section className="principal-card academic-reports-section">
    <div className="academic-reports-heading">
      <h2>Academic Reports</h2>
      <p>Overall academic performance and institutional reports.</p>
    </div>

    {academicReportsLoading && (
      <p className="principal-loading">Loading academic reports...</p>
    )}

    {academicReportsError && (
      <p className="principal-error">{academicReportsError}</p>
    )}

    {!academicReportsLoading && !academicReportsError && academicReports && (
      <>
        <h3 className="report-category-title">Attendance Report</h3>
        <div className="academic-report-grid">
          <div className="academic-report-card">
            <p>Total Attendance Records</p>
            <h3>{academicReports.attendance?.total_records ?? 0}</h3>
          </div>
          <div className="academic-report-card">
            <p>Present</p>
            <h3>{academicReports.attendance?.present ?? 0}</h3>
          </div>
          <div className="academic-report-card">
            <p>Absent</p>
            <h3>{academicReports.attendance?.absent ?? 0}</h3>
          </div>
          <div className="academic-report-card">
            <p>Attendance Percentage</p>
            <h3>{academicReports.attendance?.attendance_percentage ?? 0}%</h3>
          </div>
        </div>

        <h3 className="report-category-title">Mid Marks Report</h3>
        <div className="academic-report-grid">
          <div className="academic-report-card">
            <p>Total Mid Marks Records</p>
            <h3>{academicReports.mid_marks?.total_records ?? 0}</h3>
          </div>
          <div className="academic-report-card">
            <p>Average Performance</p>
            <h3>{academicReports.mid_marks?.average_percentage ?? 0}%</h3>
          </div>
        </div>

        <h3 className="report-category-title">Semester Results Report</h3>
        <div className="academic-report-grid">
          <div className="academic-report-card">
            <p>Total Results</p>
            <h3>{academicReports.semester_results?.total_records ?? 0}</h3>
          </div>
          <div className="academic-report-card">
            <p>Approved</p>
            <h3>{academicReports.semester_results?.approved ?? 0}</h3>
          </div>
          <div className="academic-report-card">
            <p>Pending</p>
            <h3>{academicReports.semester_results?.pending ?? 0}</h3>
          </div>
          <div className="academic-report-card">
            <p>Rejected</p>
            <h3>{academicReports.semester_results?.rejected ?? 0}</h3>
          </div>
          <div className="academic-report-card">
            <p>Passed</p>
            <h3>{academicReports.semester_results?.passed ?? 0}</h3>
          </div>
          <div className="academic-report-card">
            <p>Failed</p>
            <h3>{academicReports.semester_results?.failed ?? 0}</h3>
          </div>
          <div className="academic-report-card">
            <p>Average Percentage</p>
            <h3>{academicReports.semester_results?.average_percentage ?? 0}%</h3>
          </div>
        </div>
      </>
    )}
  </section>
)}

          {activeTab === "Timetable" && (
  <section className="principal-card timetable-section">
    <div className="timetable-heading">
      <h2>Timetable Overview</h2>
      <p>View college, department, faculty and section timetables.</p>
    </div>

    {timetableLoading && (
      <p className="principal-loading">Loading timetable...</p>
    )}

    {timetableError && (
      <p className="principal-error">{timetableError}</p>
    )}

    {!timetableLoading && !timetableError && (
      timetableData.length === 0 ? (
        <div className="timetable-empty">
          <h3>No Timetable Available</h3>
          <p>
            Timetable entries have not been created yet.
            Please contact Admin or Correspondent.
          </p>
        </div>
      ) : (
        <div className="principal-table-wrapper">
          <table className="principal-results-table timetable-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Department</th>
                <th>Course</th>
                <th>Year</th>
                <th>Section</th>
                <th>Subject</th>
                <th>Faculty</th>
                <th>Room</th>
                <th>Academic Year</th>
              </tr>
            </thead>

            <tbody>
              {timetableData.map((item) => (
                <tr key={item.id}>
                  <td>{item.day_of_week}</td>
                  <td>
                    {item.start_time} - {item.end_time}
                  </td>
                  <td>{item.department_name || "Not Assigned"}</td>
                  <td>{item.course_name}</td>
                  <td>{item.year_of_study}</td>
                  <td>{item.section_name}</td>
                  <td>{item.subject_name}</td>
                  <td>{item.faculty_name}</td>
                  <td>{item.room_number || "Not Assigned"}</td>
                  <td>{item.academic_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    )}
  </section>
)}

          {activeTab === "Notifications" && (
  <section className="principal-card notifications-section">
    <div className="notifications-heading">
      <h2>Notifications</h2>
      <p>View important academic and administrative updates.</p>
    </div>

    {notificationsLoading && (
      <p className="principal-loading">Loading notifications...</p>
    )}

    {notificationsError && (
      <p className="principal-error">{notificationsError}</p>
    )}

    {!notificationsLoading && !notificationsError && (
      notifications.length === 0 ? (
        <div className="notifications-empty">
          <h3>No Notifications</h3>
          <p>You don't have any notifications at the moment.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((item) => (
            <div
              className={`notification-item ${item.is_read ? "read" : "unread"}`}
              key={item.id}
            >
              <div className="notification-item-content">
                <h3>{item.title}</h3>
                <p>{item.message}</p>
                <span>{item.notification_type}</span>
                <small>
                  {new Date(item.created_at).toLocaleString()}
                </small>
              </div>
              <span className={`notification-status ${item.is_read ? "read" : "unread"}`}>
                {item.is_read ? "Read" : "Unread"}
              </span>
            </div>
          ))}
        </div>
      )
    )}
  </section>
)}

          {activeTab === "My Profile" && (
  <section className="principal-card principal-profile-section">
    <div className="profile-heading">
      <h2>My Profile</h2>
      <p>Your account information and profile details.</p>
    </div>

    <div className="principal-profile-card">
      <div className="profile-avatar">
        {(user?.name || "P").charAt(0).toUpperCase()}
      </div>

      <div className="profile-details">
        <h3>{user?.name || "Not available"}</h3>
        <span className="profile-role">College Principal</span>
      </div>

      <div className="profile-info-grid">
        <div className="profile-info-item">
          <label>Full Name</label>
          <p>{user?.name || "Not available"}</p>
        </div>

        <div className="profile-info-item">
          <label>Email Address</label>
          <p>{user?.email || "Not available"}</p>
        </div>

        <div className="profile-info-item">
          <label>Account Role</label>
          <p>Principal</p>
        </div>
      </div>
    </div>
  </section>
)}
        </div>
      </main>
    </div>
  );
}

export default PrincipalDashboard;
