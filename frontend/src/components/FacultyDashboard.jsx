
import { useState, useEffect } from "react";
import "./FacultyDashboard.css";

function FacultyDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

const [semesterResultsSubject, setSemesterResultsSubject] = useState("");
const [semesterResultsStudents, setSemesterResultsStudents] = useState([]);
const [semesterNumber, setSemesterNumber] = useState("1");
const [semesterResultsLoading, setSemesterResultsLoading] = useState(false);
const [semesterResultsMessage, setSemesterResultsMessage] = useState("");

  const initialForm = {
    title: "",
    description: "",
    subject_id: "",
    section_id: "",
    academic_year_id: "",
    due_date: "",
    max_marks: 100,
  };

  const [formData, setFormData] = useState(initialForm);

  
const menuItems = [
  { id: "overview", label: "Dashboard", icon: "⌂" },
  { id: "subjects", label: "My Subjects", icon: "▤" },
  { id: "attendance", label: "Attendance", icon: "◷" },
  { id: "assignments", label: "Assignments", icon: "✎" },
  { id: "marks", label: "Mid Marks", icon: "▥" },
  { id: "semesterResults", label: "Semester Results", icon: "▣" },
  { id: "submissions", label: "Submissions", icon: "⇧" },
  { id: "timetable", label: "Timetable", icon: "▦" },
];


  const currentPage = menuItems.find(
    (item) => item.id === activeTab
  );

  const facultyName = user?.name || "Faculty Member";

  
const [selectedAssignment, setSelectedAssignment] = useState("");
const [submissions, setSubmissions] = useState([]);
const [loadingSubmissions, setLoadingSubmissions] = useState(false);
const [submissionsError, setSubmissionsError] = useState("");
const [evaluatingSubmission, setEvaluatingSubmission] = useState(null);
const [evaluationForm, setEvaluationForm] = useState({
  marks_obtained: "",
  feedback: "",
});
const [savingEvaluation, setSavingEvaluation] = useState(false);
const [evaluationMessage, setEvaluationMessage] = useState("");

// MID MARKS
const [marksSubject, setMarksSubject] = useState("");
const [examType, setExamType] = useState("Mid-1");
const [marksStudents, setMarksStudents] = useState([]);
const [marksLoading, setMarksLoading] = useState(false);
const [marksSaving, setMarksSaving] = useState(false);
const [marksError, setMarksError] = useState("");
const [marksMessage, setMarksMessage] = useState("");

// TIMETABLE
const [timetable, setTimetable] = useState([]);
const [timetableLoading, setTimetableLoading] = useState(false);
const [timetableError, setTimetableError] = useState("");

const [attendanceSubject, setAttendanceSubject] = useState("");
const [attendanceDate, setAttendanceDate] = useState(
  new Date().toISOString().split("T")[0]
);
const [attendanceStudents, setAttendanceStudents] = useState([]);
const [attendanceLoading, setAttendanceLoading] = useState(false);
const [attendanceSaving, setAttendanceSaving] = useState(false);
const [attendanceError, setAttendanceError] = useState("");
const [attendanceMessage, setAttendanceMessage] = useState("");

const [previewSubmission, setPreviewSubmission] = useState(null);



  const getAttendanceSubjectKey = (subject) =>
    `${subject.subject_id}|${subject.section_id}|${subject.academic_year_id}`;

  const selectedAttendanceSubject = subjects.find(
    (subject) => getAttendanceSubjectKey(subject) === attendanceSubject
  );

  const fetchAttendance = async () => {
if (!attendanceSubject || !attendanceDate) {
      setAttendanceStudents([]);
      return;
    }

    setAttendanceLoading(true);
    setAttendanceError("");
    setAttendanceMessage("");

    const { subject_id, section_id, academic_year_id } =
      selectedAttendanceSubject;

    try {
      const response = await fetch(
        `http://localhost:5000/api/faculty/attendance/${user.id}/${subject_id}/${section_id}/${academic_year_id}/${attendanceDate}`
      );
      const data = await response.json();
      setAttendanceMessage(data.hasClass ? "" : "No classes today");

      if (!response.ok) {
        throw new Error(data.message || "Unable to load attendance.");
      }

      setAttendanceStudents(
        (data.students || []).map((student) => ({
          ...student,
          attendance_status: student.attendance_status || "present",
        }))
      );
    } catch (error) {
      console.error("Attendance fetch error:", error);
      setAttendanceError(error.message || "Unable to load attendance.");
      setAttendanceStudents([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleAttendanceStatusChange = (studentId, status) => {
    setAttendanceStudents((previous) =>
      previous.map((student) =>
        Number(student.student_id) === Number(studentId)
          ? { ...student, attendance_status: status }
          : student
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedAttendanceSubject || !attendanceDate) {
      setAttendanceError("Select subject and date first.");
      return;
    }
    if (attendanceStudents.length === 0) {
      setAttendanceError("No students available to save.");
      return;
    }

    setAttendanceSaving(true);
    setAttendanceError("");
    setAttendanceMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/faculty/attendance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              faculty_id: user.id,
              subject_id: selectedAttendanceSubject.subject_id,
              section_id: selectedAttendanceSubject.section_id,
              academic_year_id: selectedAttendanceSubject.academic_year_id,
              attendance_date: attendanceDate,
              attendance: attendanceStudents.map((student) => ({
                student_id: student.student_id,
                attendance_status: student.attendance_status,
              })),
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save attendance.");
      }
      setAttendanceMessage(data.message || "Attendance saved successfully!");
    } catch (error) {
      console.error("Attendance save error:", error);
      setAttendanceError(error.message || "Unable to save attendance.");
    } finally {
      setAttendanceSaving(false);
    }
  };

  const getMarksSubjectKey = (subject) =>
  `${subject.subject_id}|${subject.section_id}|${subject.academic_year_id}`;

const selectedMarksSubject = subjects.find(
  (subject) => getMarksSubjectKey(subject) === marksSubject
);


const fetchMidMarks = async () => {
  console.log("Load Students button clicked!");

  if (!selectedMarksSubject) {
    setMarksStudents([]);
    setMarksError("Please select a subject first.");
    return;
  }

  setMarksLoading(true);
  setMarksError("");
  setMarksMessage("");

  const { subject_id, section_id, academic_year_id } =
    selectedMarksSubject;

  try {
    const response = await fetch(
      `http://localhost:5000/api/faculty/midmarks/${user.id}/${subject_id}/${section_id}/${academic_year_id}/${examType}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load students.");
    }

    setMarksStudents(
      (data.students || []).map((student) => ({
        ...student,
        marks_obtained: student.marks_obtained ?? "",
      }))
    );
  } catch (error) {
    setMarksError(error.message || "Unable to load marks.");
  } finally {
    setMarksLoading(false);
  }
};

const handleMarksChange = (studentId, value) => {
  setMarksStudents((previous) =>
    previous.map((student) =>
      Number(student.student_id) === Number(studentId)
        ? { ...student, marks_obtained: value }
        : student
    )
  );
};

const handleSaveMidMarks = async () => {
  if (!selectedMarksSubject || marksStudents.length === 0) {
    setMarksError("Please load students first.");
    return;
  }

  const invalidMarks = marksStudents.some(
    (student) =>
      student.marks_obtained === "" ||
      !Number.isFinite(Number(student.marks_obtained)) ||
      Number(student.marks_obtained) < 0 ||
      Number(student.marks_obtained) > 30
  );

  if (invalidMarks) {
    setMarksError("Enter valid marks between 0 and 30 for all students.");
    return;
  }

  setMarksSaving(true);
  setMarksError("");
  setMarksMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/faculty/midmarks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faculty_id: user.id,
          subject_id: selectedMarksSubject.subject_id,
          section_id: selectedMarksSubject.section_id,
          academic_year_id: selectedMarksSubject.academic_year_id,
          exam_type: examType,
          marks: marksStudents.map((student) => ({
            student_id: student.student_id,
            marks_obtained: Number(student.marks_obtained),
          })),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save marks.");
    }

    setMarksMessage(data.message || "Mid marks saved successfully!");
  } catch (error) {
    setMarksError(error.message || "Unable to save marks.");
  } finally {
    setMarksSaving(false);
  }
};

const fetchSemesterResultsStudents = async () => {
  if (!semesterResultsSubject) {
    setSemesterResultsMessage("Please select a subject first.");
    return;
  }

  setSemesterResultsLoading(true);
  setSemesterResultsMessage("");

  try {
    const selectedSubject = subjects.find(
      (subject) =>
        getMarksSubjectKey(subject) === semesterResultsSubject
    );

    if (!selectedSubject) {
      throw new Error("Selected subject not found.");
    }

    const response = await fetch(
      `http://localhost:5000/api/faculty/semester-results/${user.id}?subjectId=${selectedSubject.subject_id}&sectionId=${selectedSubject.section_id}&academicYearId=${selectedSubject.academic_year_id}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load students.");
    }

    setSemesterResultsStudents(
      (data.students || []).map((student) => ({
        ...student,
        marksObtained: "",
        maxMarks: 100,
      }))
    );

    setSemesterResultsMessage(
      data.students?.length
        ? "Students loaded successfully."
        : "No students found."
    );
  } catch (error) {
    setSemesterResultsMessage(error.message);
  } finally {
    setSemesterResultsLoading(false);
  }
};


const handleSubmitSemesterResults = async () => {
  if (!semesterResultsSubject || semesterResultsStudents.length === 0) {
    setSemesterResultsMessage("Please load students first.");
    return;
  }

  const selectedSubject = subjects.find(
    (subject) =>
      getMarksSubjectKey(subject) === semesterResultsSubject
  );

  if (!selectedSubject) {
    setSemesterResultsMessage("Selected subject not found.");
    return;
  }

  const invalidMarks = semesterResultsStudents.some((student) => {
    const marks = Number(student.marksObtained);
    const maxMarks = Number(student.maxMarks);

    return (
      student.marksObtained === "" ||
      student.maxMarks === "" ||
      !Number.isFinite(marks) ||
      !Number.isFinite(maxMarks) ||
      maxMarks <= 0 ||
      marks < 0 ||
      marks > maxMarks
    );
  });

  if (invalidMarks) {
    setSemesterResultsMessage(
      "Enter valid marks. Marks obtained cannot exceed maximum marks."
    );
    return;
  }

  setSemesterResultsLoading(true);
  setSemesterResultsMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/faculty/semester-results/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facultyId: user.id,
          subjectId: selectedSubject.subject_id,
          sectionId: selectedSubject.section_id,
          academicYearId: selectedSubject.academic_year_id,
          semesterNumber: Number(semesterNumber),
          results: semesterResultsStudents.map((student) => ({
            studentId: student.student_id,
            marksObtained: Number(student.marksObtained),
            maxMarks: Number(student.maxMarks),
          })),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save semester results.");
    }

    setSemesterResultsMessage(
      data.message || "Semester results submitted successfully!"
    );
    setSemesterResultsStudents([]);
  } catch (error) {
    setSemesterResultsMessage(error.message);
  } finally {
    setSemesterResultsLoading(false);
  }
};

 // FETCH FACULTY TIMETABLE
const fetchTimetable = async () => {
  if (!user?.id) return;

  setTimetableLoading(true);
  setTimetableError("");

  try {
    const response = await fetch(
      `http://localhost:5000/api/faculty/timetable/${user.id}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load timetable.");
    }

    setTimetable(data.timetable || []);
  } catch (error) {
    setTimetableError(error.message || "Unable to load timetable.");
  } finally {
    setTimetableLoading(false);
  }
};


useEffect(() => {
    if (activeTab === "attendance" && attendanceSubject && attendanceDate) {
      fetchAttendance();
    }
  }, [activeTab, attendanceSubject, attendanceDate, subjects.length]);

  useEffect(() => {
  if (activeTab === "timetable") {
    fetchTimetable();
  }
}, [activeTab, user?.id]);
useEffect(() => {
    if (!user?.id) return;

    setLoadingSubjects(true);
    setSubjectsError("");

    fetch(`http://localhost:5000/api/faculty/subjects/${user.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch subjects");
        }
        return response.json();
      })
      .then((data) => {
        setSubjects(data.subjects || []);
      })
      .catch((error) => {
        console.error("Subjects fetch error:", error);
        setSubjectsError("Unable to load subjects. Please try again.");
      })
      .finally(() => {
        setLoadingSubjects(false);
      });
  }, [user?.id]);

  useEffect(() => {
  if (
    activeTab === "assignments" ||
    activeTab === "submissions"
  ) {
    fetchAssignments();
  }
}, [activeTab, user?.id]);

  const fetchAssignments = async () => {
    if (!user?.id) return;

    setLoadingAssignments(true);
    setAssignmentsError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/faculty/assignments/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch assignments");
      }

      setAssignments(data.assignments || []);
    } catch (error) {
      console.error("Assignments fetch error:", error);
      setAssignmentsError(
        error.message || "Unable to load assignments."
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  
const fetchSubmissions = async (assignmentId) => {
  if (!assignmentId) {
    setSubmissions([]);
    return;
  }

  setLoadingSubmissions(true);
  setSubmissionsError("");

  try {
    const response = await fetch(
      `http://localhost:5000/api/faculty/submissions/${assignmentId}?faculty_id=${user.id}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch submissions");
    }

    setSubmissions(data.submissions || []);
  } catch (error) {
    console.error("Submissions fetch error:", error);
    setSubmissionsError(error.message || "Unable to load submissions.");
  } finally {
    setLoadingSubmissions(false);
  }
};

const openEvaluationForm = (submission) => {
  setEvaluatingSubmission(submission);

  setEvaluationForm({
    marks_obtained: submission.marks_obtained ?? "",
    feedback: submission.feedback || "",
  });

  setEvaluationMessage("");
};

const handleEvaluationChange = (event) => {
  const { name, value } = event.target;

  setEvaluationForm((previous) => ({
    ...previous,
    [name]: value,
  }));
};

const handleEvaluateSubmission = async (event) => {
  event.preventDefault();

  if (evaluationForm.marks_obtained === "") {
    setEvaluationMessage("Please enter marks.");
    return;
  }

  const marks = Number(evaluationForm.marks_obtained);

  if (
    !Number.isFinite(marks) ||
    marks < 0 ||
    marks > Number(evaluatingSubmission.max_marks)
  ) {
    setEvaluationMessage(
      `Marks must be between 0 and ${evaluatingSubmission.max_marks}.`
    );
    return;
  }

  setSavingEvaluation(true);
  setEvaluationMessage("");

  try {
    const response = await fetch(
      `http://localhost:5000/api/faculty/submissions/${evaluatingSubmission.submission_id}/evaluate`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faculty_id: user.id,
          marks_obtained: marks,
          feedback: evaluationForm.feedback,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to evaluate submission.");
    }

    setEvaluatingSubmission(null);
    setEvaluationMessage("Evaluation saved successfully!");

    await fetchSubmissions(selectedAssignment);
  } catch (error) {
    console.error("Evaluation error:", error);
    setEvaluationMessage(error.message || "Unable to save evaluation.");
  } finally {
    setSavingEvaluation(false);
  }
};


  const openCreateForm = () => {
    setEditingAssignment(null);
    setFormData(initialForm);
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (assignment) => {
    setEditingAssignment(assignment);

    setFormData({
      title: assignment.title || "",
      description: assignment.description || "",
      subject_id: String(assignment.subject_id || ""),
      section_id: String(assignment.section_id || ""),
      academic_year_id: String(assignment.academic_year_id || ""),
      due_date: assignment.due_date
        ? assignment.due_date.replace(" ", "T").slice(0, 16)
        : "",
      max_marks: assignment.max_marks || 100,
    });

    setMessage("");
    setShowForm(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmitAssignment = async (event) => {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.subject_id ||
      !formData.section_id ||
      !formData.academic_year_id ||
      !formData.due_date ||
      !formData.max_marks
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      ...formData,
      faculty_id: user.id,
      subject_id: Number(formData.subject_id),
      section_id: Number(formData.section_id),
      academic_year_id: Number(formData.academic_year_id),
      max_marks: Number(formData.max_marks),
    };

    try {
      const url = editingAssignment
        ? `http://localhost:5000/api/faculty/assignments/${editingAssignment.id}`
        : "http://localhost:5000/api/faculty/assignments";

      const response = await fetch(url, {
        method: editingAssignment ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save assignment.");
      }

      setShowForm(false);
      setEditingAssignment(null);
      setFormData(initialForm);

      await fetchAssignments();

      setMessage(
        editingAssignment
          ? "Assignment updated successfully!"
          : "Assignment created successfully!"
      );
    } catch (error) {
      console.error("Assignment save error:", error);
      setMessage(error.message || "Unable to save assignment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/faculty/assignments/${assignmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            faculty_id: user.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete assignment.");
      }

      setMessage("Assignment deleted successfully!");
      await fetchAssignments();
    } catch (error) {
      console.error("Assignment delete error:", error);
      setMessage(error.message || "Unable to delete assignment.");
    }
  };

  const getSubjectName = (assignment) => {
    return (
      assignment.subject_name ||
      subjects.find(
        (subject) =>
          Number(subject.subject_id) === Number(assignment.subject_id)
      )?.subject_name ||
      "Subject"
    );
  };

  const getSectionName = (assignment) => {
    return (
      assignment.section_name ||
      subjects.find(
        (subject) =>
          Number(subject.subject_id) === Number(assignment.subject_id) &&
          Number(subject.section_id) === Number(assignment.section_id)
      )?.section_name ||
      "Section"
    );
  };

  return (
    <div className="faculty-layout">
      <aside className="faculty-sidebar">
        <div className="faculty-brand">
          <img
  src="/images/nbkr-logo.png"
  alt="NBKR College Logo"
  className="college-logo"
/>
          <div>
            <h2>NBKRIST</h2>
            <span>ACADEMIC PORTAL</span>
          </div>
        </div>

        <div className="sidebar-section-label">MAIN MENU</div>

        <nav className="faculty-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`faculty-nav-item ${
                activeTab === item.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activeTab === item.id && (
                <span className="nav-active-dot"></span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="faculty-logout-btn" onClick={onLogout}>
            <span>↪</span>
            <span>Logout</span>
          </button>

          <div className="sidebar-help-card">
            <div className="help-icon">♡</div>
            <h4>Need assistance?</h4>
            <p>Contact your college administrator for support.</p>
          </div>

          <div className="sidebar-footer">
            <div className="footer-avatar">
              {facultyName.charAt(0).toUpperCase()}
            </div>
            <div className="footer-user-info">
              <strong>{facultyName}</strong>
              <span>Faculty Account</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="faculty-main">
        <header className="faculty-topbar">
          <div>
            <span className="breadcrumb">Faculty Portal /</span>
            <span className="breadcrumb-current">
              {currentPage?.label}
            </span>
          </div>

          <div className="topbar-right">
            <div className="status-indicator">
              <span className="status-dot"></span>
              Academic Portal
            </div>
            <div className="topbar-avatar">
              {facultyName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="faculty-content">
          {activeTab === "overview" && (
            <>
              <section className="welcome-banner">
                <div className="welcome-text">
                  <span className="welcome-tag">YOUR ACADEMIC SPACE</span>
                  <h1>
                    Hello, {facultyName.split(" ")[0]}! <span>✦</span>
                  </h1>
                  <p>
                    Welcome back! Let's make today a productive
                    and wonderful day.
                  </p>
                </div>

                <div className="welcome-decoration">
                  <div className="decoration-circle circle-one"></div>
                  <div className="decoration-circle circle-two"></div>
                  <div className="decoration-star">✦</div>
                  <div className="decoration-flower">✿</div>
                </div>
              </section>

              <section className="section-heading">
                <div>
                  <h2>Your Overview</h2>
                  <p>Here's a little summary of your academic workspace.</p>
                </div>
                <span className="today-badge">✧ Faculty Dashboard</span>
              </section>

              <section className="dashboard-bottom-grid">
                <div className="quick-access-card">
                  <div className="section-heading compact">
                    <div>
                      <h2>Quick Access</h2>
                      <p>Your frequently used modules</p>
                    </div>
                  </div>

                  <div className="quick-access-grid">
                    <button onClick={() => setActiveTab("attendance")}>
                      <span className="quick-icon quick-purple">◷</span>
                      <span>Mark Attendance</span>
                      <span className="quick-arrow">↗</span>
                    </button>

                    <button onClick={() => setActiveTab("assignments")}>
                      <span className="quick-icon quick-pink">✎</span>
                      <span>Create Assignment</span>
                      <span className="quick-arrow">↗</span>
                    </button>

                    <button onClick={() => setActiveTab("marks")}>
                      <span className="quick-icon quick-blue">▥</span>
                      <span>Enter Mid Marks</span>
                      <span className="quick-arrow">↗</span>
                    </button>

                    


                  </div>
                </div>

                <div className="faculty-note-card">
                  <span className="note-decoration">✿</span>
                  <span className="note-label">A LITTLE REMINDER</span>
                  <h2>Every lesson<br />makes a difference.</h2>
                  <p>
                    Thank you for inspiring students and helping them grow every day.
                  </p>
                  <div className="note-bottom">Made with care ♡</div>
                </div>
              </section>
            </>
          )}

          {activeTab === "subjects" && (
            <section className="faculty-subjects-section">
              <div className="section-heading">
                <div>
                  <h2>My Subjects</h2>
                  <p>Subjects and sections assigned to you.</p>
                </div>
                <span className="today-badge">
                  ✧ {subjects.length}{" "}
                  {subjects.length === 1 ? "Subject" : "Subjects"}
                </span>
              </div>

              {loadingSubjects && (
                <div className="module-placeholder">
                  <div className="module-icon">⌛</div>
                  <h2>Loading your subjects...</h2>
                  <p>Please wait a moment.</p>
                </div>
              )}

              {subjectsError && (
                <div className="module-placeholder">
                  <div className="module-icon">⚠</div>
                  <h2>Something went wrong</h2>
                  <p>{subjectsError}</p>
                </div>
              )}

              {!loadingSubjects &&
                !subjectsError &&
                subjects.length === 0 && (
                  <div className="module-placeholder">
                    <div className="module-icon">▤</div>
                    <h2>No subjects assigned yet</h2>
                    <p>
                      Your subjects will appear here once the administrator
                      assigns them to your faculty account.
                    </p>
                  </div>
                )}

              {!loadingSubjects &&
                !subjectsError &&
                subjects.length > 0 && (
                  <div className="faculty-subjects-grid">
                    {subjects.map((subject, index) => (
                      <div
                        className="faculty-subject-card"
                        key={`${subject.subject_id}-${subject.section_name}-${index}`}
                      >
                        <div className="subject-card-top">
                          <div className="subject-card-icon">▤</div>
                          <span className="subject-card-label">
                            ASSIGNED SUBJECT
                          </span>
                        </div>

                        <h3>{subject.subject_name}</h3>

                        <div className="subject-code">
                          {subject.subject_code || "Subject code unavailable"}
                        </div>

                        <div className="subject-card-divider"></div>

                        <div className="subject-card-details">
                          <div>
                            <span>Section</span>
                            <strong>
                              {subject.section_name || "Not specified"}
                            </strong>
                          </div>
                          <div>
                            <span>Academic Year</span>
                            <strong>
                              {subject.academic_year_id || "Not specified"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </section>
          )}

          {/* ASSIGNMENTS MODULE */}
          {activeTab === "assignments" && (
            <section className="faculty-assignments-section">
              <div className="section-heading">
                <div>
                  <h2>Assignments Management</h2>
                  <p>Create and manage assignments for your students.</p>
                </div>

                {!showForm && (
                  <button
                    className="create-assignment-btn"
                    onClick={openCreateForm}
                  >
                    + Create Assignment
                  </button>
                )}
              </div>

              {message && (
                <div className="assignment-message">
                  {message}
                </div>
              )}

              {showForm && (
                <div className="assignment-form-card">
                  <div className="assignment-form-header">
                    <h2>
                      {editingAssignment
                        ? "Edit Assignment"
                        : "Create New Assignment"}
                    </h2>
                    <button
                      type="button"
                      className="close-form-btn"
                      onClick={() => setShowForm(false)}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSubmitAssignment}>
                    <div className="assignment-form-grid">
                      <div className="assignment-form-field full-width">
                        <label>Assignment Title *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleFormChange}
                          placeholder="Enter assignment title"
                          required
                        />
                      </div>

                      <div className="assignment-form-field full-width">
                        <label>Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleFormChange}
                          placeholder="Enter assignment instructions"
                          rows="4"
                        />
                      </div>

                      <div className="assignment-form-field">
                        <label>Subject *</label>
                        <select
                          name="subject_id"
                          value={formData.subject_id}
                          onChange={(event) => {
                            const selectedSubject = subjects.find(
                              (subject) =>
                                String(subject.subject_id) === event.target.value
                            );

                            setFormData((previous) => ({
                              ...previous,
                              subject_id: event.target.value,
                              section_id: selectedSubject
                                ? String(selectedSubject.section_id || "")
                                : "",
                              academic_year_id: selectedSubject
                                ? String(selectedSubject.academic_year_id || "")
                                : "",
                            }));
                          }}
                          required
                        >
                          <option value="">Select Subject</option>
                          {subjects.map((subject, index) => (
                            <option
                              key={`${subject.subject_id}-${subject.section_id}-${index}`}
                              value={subject.subject_id}
                            >
                              {subject.subject_name} - {subject.section_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="assignment-form-field">
                        <label>Section *</label>
                        <input
                          type="text"
                          value={
                            subjects.find(
                              (subject) =>
                                String(subject.subject_id) ===
                                formData.subject_id
                            )?.section_name || ""
                          }
                          readOnly
                          placeholder="Select subject first"
                        />
                      </div>

                      <div className="assignment-form-field">
                        <label>Due Date & Time *</label>
                        <input
                          type="datetime-local"
                          name="due_date"
                          value={formData.due_date}
                          onChange={handleFormChange}
                          required
                        />
                      </div>

                      <div className="assignment-form-field">
                        <label>Maximum Marks *</label>
                        <input
                          type="number"
                          name="max_marks"
                          value={formData.max_marks}
                          onChange={handleFormChange}
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    {message && (
                      <p className="assignment-form-error">{message}</p>
                    )}

                    <div className="assignment-form-actions">
                      <button
                        type="button"
                        className="cancel-assignment-btn"
                        onClick={() => {
                          setShowForm(false);
                          setMessage("");
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="save-assignment-btn"
                        disabled={saving}
                      >
                        {saving
                          ? "Saving..."
                          : editingAssignment
                          ? "Update Assignment"
                          : "Create Assignment"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loadingAssignments && (
                <div className="module-placeholder">
                  <div className="module-icon">⌛</div>
                  <h2>Loading assignments...</h2>
                  <p>Please wait a moment.</p>
                </div>
              )}

              {assignmentsError && (
                <div className="module-placeholder">
                  <div className="module-icon">⚠</div>
                  <h2>Unable to load assignments</h2>
                  <p>{assignmentsError}</p>
                  <button
                    className="back-dashboard-btn"
                    onClick={fetchAssignments}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loadingAssignments &&
                !assignmentsError &&
                assignments.length === 0 &&
                !showForm && (
                  <div className="module-placeholder">
                    <div className="module-icon">✎</div>
                    <h2>No assignments created yet</h2>
                    <p>Create your first assignment using the button above.</p>
                  </div>
                )}

              {!loadingAssignments &&
                !assignmentsError &&
                assignments.length > 0 && (
                  <div className="faculty-assignments-grid">
                    {assignments.map((assignment) => (
                      <div
                        className="faculty-assignment-card"
                        key={assignment.id}
                      >
                        <div className="assignment-card-top">
                          <span className="assignment-card-icon">✎</span>
                          <span className="assignment-card-label">
                            ASSIGNMENT
                          </span>
                        </div>

                        <h3>{assignment.title}</h3>

                        <p className="assignment-card-description">
                          {assignment.description ||
                            "No description provided."}
                        </p>

                        <div className="assignment-card-details">
                          <div>
                            <span>Subject</span>
                            <strong>{getSubjectName(assignment)}</strong>
                          </div>
                          <div>
                            <span>Section</span>
                            <strong>{getSectionName(assignment)}</strong>
                          </div>
                          <div>
                            <span>Max Marks</span>
                            <strong>{assignment.max_marks}</strong>
                          </div>
                          <div>
                            <span>Due Date</span>
                            <strong>
                              {assignment.due_date
                                ? new Date(
                                    assignment.due_date
                                  ).toLocaleString()
                                : "Not specified"}
                            </strong>
                          </div>
                        </div>

                        <div className="assignment-submission-count">
                          <span>⇧</span>
                          <strong>
                            {assignment.submission_count || 0}
                          </strong>
                          <span>Submissions received</span>
                        </div>

                        
<button
  className="view-submissions-btn"
  onClick={() => {
    setSelectedAssignment(String(assignment.id));
    setEvaluationMessage("");
    setEvaluatingSubmission(null);
    fetchSubmissions(String(assignment.id));
    setActiveTab("submissions");
  }}
>
  View Submissions →
</button>


                        <div className="assignment-card-actions">
                          <button
                            className="edit-assignment-btn"
                            onClick={() => openEditForm(assignment)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-assignment-btn"
                            onClick={() =>
                              handleDeleteAssignment(assignment.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </section>
          )}

        
{/* SUBMISSIONS MODULE */}
{activeTab === "submissions" && (
  <section className="faculty-assignments-section">
    <div className="section-heading">
      <div>
        <h2>Student Submissions</h2>
        <p>View uploaded files and evaluate student work.</p>
      </div>
    </div>

    <div className="assignment-form-field">
      <label>Select Assignment</label>
      <select
        value={selectedAssignment}
        onChange={(e) => {
          const assignmentId = e.target.value;

          setSelectedAssignment(assignmentId);
          setEvaluatingSubmission(null);
          setPreviewSubmission(null);
          setEvaluationMessage("");

          if (assignmentId) {
            fetchSubmissions(assignmentId);
          }
        }}
      >
        <option value="">Select Assignment</option>

        {assignments.map((assignment) => (
          <option key={assignment.id} value={assignment.id}>
            {assignment.title}
          </option>
        ))}
      </select>
    </div>

    {loadingSubmissions && (
      <div className="module-placeholder">
        <h2>Loading submissions...</h2>
        <p>Please wait.</p>
      </div>
    )}

    {submissionsError && (
      <div className="module-placeholder">
        <h2>Unable to load submissions</h2>
        <p>{submissionsError}</p>
      </div>
    )}

    {!loadingSubmissions &&
      !submissionsError &&
      selectedAssignment &&
      submissions.length === 0 && (
        <div className="module-placeholder">
          <h2>No submissions yet</h2>
          <p>Students have not submitted this assignment.</p>
        </div>
      )}

    {!loadingSubmissions &&
      !submissionsError &&
      submissions.length > 0 && (
        <>
          {/* PENDING SUBMISSIONS */}
          <div className="section-heading">
            <div>
              <h2>
                Pending Evaluation (
                {submissions.filter(
                  (item) =>
                    String(item.status || "submitted").toLowerCase() !==
                    "evaluated"
                ).length}
                )
              </h2>
              <p>Select a student to view their uploaded assignment.</p>
            </div>
          </div>

          <div className="faculty-assignments-grid">
            {submissions
              .filter(
                (item) =>
                  String(item.status || "submitted").toLowerCase() !==
                  "evaluated"
              )
              .map((submission) => (
                <div
                  className="faculty-assignment-card"
                  key={submission.submission_id}
                >
                  <div className="assignment-card-top">
                    <span className="assignment-card-icon">⇧</span>
                    <span className="assignment-card-label">
                      STUDENT SUBMISSION
                    </span>
                  </div>

                  <h3>{submission.student_name}</h3>

                  <p className="assignment-card-description">
                    {submission.student_email}
                  </p>

                  <div className="assignment-card-details">
                    <div>
                      <span>Submitted On</span>
                      <strong>
                        {submission.submitted_at
                          ? new Date(
                              submission.submitted_at
                            ).toLocaleString()
                          : "Not available"}
                      </strong>
                    </div>

                    <div>
                      <span>Maximum Marks</span>
                      <strong>{submission.max_marks}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="view-submissions-btn"
                    onClick={() => {
                      setPreviewSubmission(submission);
                      openEvaluationForm(submission);
                      setEvaluationMessage("");
                    }}
                  >
                    View Submission & Evaluate
                  </button>
                </div>
              ))}
          </div>

          {/* SELECTED STUDENT FILE + EVALUATION */}
          {previewSubmission && (
            <div className="submission-review-panel">
              <div className="section-heading">
                <div>
                  <h2>
                    Review: {previewSubmission.student_name}
                  </h2>
                  <p>
                    View the submitted document and enter evaluation.
                  </p>
                </div>

                <button
                  type="button"
                  className="cancel-assignment-btn"
                  onClick={() => {
                    setPreviewSubmission(null);
                    setEvaluatingSubmission(null);
                    setEvaluationMessage("");
                  }}
                >
                  Close Review
                </button>
              </div>

              <div className="submission-review-grid">
                {/* FILE PREVIEW */}
                <div className="submission-preview-box">
                  <h3>Uploaded Assignment</h3>

                  {previewSubmission.file_path?.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      title="Student Assignment PDF"
                      src={`http://localhost:5000/api/faculty/submission-file/${previewSubmission.submission_id}?faculty_id=${user.id}`}
                      className="submission-pdf-preview"
                    />
                  ) : (
                    <div className="module-placeholder">
                      <h3>Document Preview</h3>
                      <p>
                        Browser PDF preview is available for PDF files.
                        DOCX files need a document viewer or conversion.
                      </p>

                      <a
                        href={`http://localhost:5000/api/faculty/submission-file/${previewSubmission.submission_id}?faculty_id=${user.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="view-submissions-btn"
                      >
                        Open / Download Document
                      </a>
                    </div>
                  )}
                </div>

                {/* EVALUATION FORM */}
                <div className="submission-evaluation-box">
                  <h3>Evaluate Submission</h3>

                  <p className="assignment-card-description">
                    Maximum marks: {previewSubmission.max_marks}
                  </p>

                  <form onSubmit={handleEvaluateSubmission}>
                    <div className="assignment-form-field">
                      <label>Marks Obtained *</label>
                      <input
                        type="number"
                        name="marks_obtained"
                        value={evaluationForm.marks_obtained}
                        onChange={handleEvaluationChange}
                        min="0"
                        max={previewSubmission.max_marks}
                        step="0.5"
                        required
                      />
                    </div>

                    <div className="assignment-form-field">
                      <label>Feedback</label>
                      <textarea
                        name="feedback"
                        value={evaluationForm.feedback}
                        onChange={handleEvaluationChange}
                        rows="5"
                        placeholder="Write feedback for the student..."
                      />
                    </div>

                    {evaluationMessage && (
                      <p className="assignment-form-error">
                        {evaluationMessage}
                      </p>
                    )}

                    <div className="assignment-form-actions">
                      <button
                        type="button"
                        className="cancel-assignment-btn"
                        onClick={() => {
                          setPreviewSubmission(null);
                          setEvaluatingSubmission(null);
                          setEvaluationMessage("");
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="save-assignment-btn"
                        disabled={savingEvaluation}
                      >
                        {savingEvaluation
                          ? "Saving..."
                          : "Save Evaluation"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ALREADY EVALUATED */}
          <div className="section-heading">
            <div>
              <h2>
                Evaluated (
                {submissions.filter(
                  (item) =>
                    String(item.status || "").toLowerCase() ===
                    "evaluated"
                ).length}
                )
              </h2>
              <p>Previously reviewed submissions.</p>
            </div>
          </div>

          <div className="faculty-assignments-grid">
            {submissions
              .filter(
                (item) =>
                  String(item.status || "").toLowerCase() ===
                  "evaluated"
              )
              .map((submission) => (
                <div
                  className="faculty-assignment-card"
                  key={`evaluated-${submission.submission_id}`}
                >
                  <div className="assignment-card-top">
                    <span className="assignment-card-icon">✓</span>
                    <span className="assignment-card-label">
                      EVALUATED
                    </span>
                  </div>

                  <h3>{submission.student_name}</h3>

                  <p className="assignment-card-description">
                    {submission.student_email}
                  </p>

                  <div className="assignment-card-details">
                    <div>
                      <span>Marks Obtained</span>
                      <strong>
                        {submission.marks_obtained ?? "—"} /{" "}
                        {submission.max_marks}
                      </strong>
                    </div>

                    <div>
                      <span>Feedback</span>
                      <strong>
                        {submission.feedback || "No feedback"}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="view-submissions-btn"
                    onClick={() => {
                      setPreviewSubmission(submission);
                      openEvaluationForm(submission);
                      setEvaluationMessage("");
                    }}
                  >
                    View Submission & Edit Evaluation
                  </button>
                </div>
              ))}
          </div>
        </>
      )}
  </section>
)}




          {activeTab === "attendance" && (
            <section className="faculty-assignments-section">
              <div className="section-heading">
                <div>
                  <h2>Attendance Management</h2>
                  <p>Mark and update attendance for your assigned subjects.</p>
                </div>
                <span className="today-badge">✧ {attendanceStudents.length} Students</span>
              </div>

              <div className="assignment-form-card">
                <div className="assignment-form-grid">
                  <div className="assignment-form-field">
                    <label>Subject / Section *</label>
                    <select
                      value={attendanceSubject}
                      onChange={(event) => {
                        setAttendanceSubject(event.target.value);
                        setAttendanceStudents([]);
                        setAttendanceError("");
                        setAttendanceMessage("");
                      }}
                      required
                    >
                      <option value="">{loadingSubjects ? "Loading assigned subjects..." : "Select assigned subject"}</option>
                      {subjects.map((subject, index) => (
                        <option
                          key={`${subject.subject_id}-${subject.section_id}-${subject.academic_year_id}-${index}`}
                          value={getMarksSubjectKey(subject)}
                        >
                          {subject.subject_name} — {subject.section_name} ({subject.year_name || subject.academic_year_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="assignment-form-field">
                    <label>Attendance Date *</label>
                    <input
                      type="date"
                      value={attendanceDate}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(event) => setAttendanceDate(event.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="assignment-form-actions">
                  <button
                    type="button"
                    className="save-assignment-btn"
                    onClick={fetchAttendance}
                    disabled={!attendanceSubject || !attendanceDate || attendanceLoading}
                  >
                    {attendanceLoading ? "Loading..." : "Load Students"}
                  </button>
                </div>
              </div>

              {attendanceError && <p className="assignment-form-error">{attendanceError}</p>}
              {attendanceMessage && <div className="assignment-message">{attendanceMessage}</div>}

              {attendanceLoading && (
                <div className="module-placeholder">
                  <h2>Loading students...</h2>
                  <p>Please wait.</p>
                </div>
              )}

              {!attendanceLoading &&
  attendanceSubject &&
  !attendanceError &&
  attendanceStudents.length === 0 && (
    <div className="module-placeholder">
      <h2>
        {attendanceMessage === "No classes today"
          ? "No classes today"
          : "No students found"}
      </h2>

      <p>
        {attendanceMessage === "No classes today"
          ? "There is no class scheduled for this subject and section on the selected date."
          : "Select the subject and date, then load students."}
      </p>
    </div>
  )}

              {!attendanceLoading && attendanceStudents.length > 0 && (
                <div className="faculty-assignments-grid">
                  {attendanceStudents.map((student) => (
                    <div className="faculty-assignment-card" key={student.student_id}>
                      <div className="assignment-card-top">
                        <span className="assignment-card-icon">◷</span>
                        <span className="assignment-card-label">ATTENDANCE</span>
                      </div>
                      <h3>{student.student_name || student.name || "Student"}</h3>
                      <p className="assignment-card-description">
                        {student.roll_number || student.student_roll_number || student.student_id}
                      </p>
                      <div className="assignment-form-field">
                        <label>Status</label>
                        <select
                          value={student.attendance_status}
                          onChange={(event) =>
                            handleAttendanceStatusChange(student.student_id, event.target.value)
                          }
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="od">On Duty (OD)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {attendanceStudents.length > 0 && (
                <div className="assignment-form-actions">
                  <button
                    type="button"
                    className="save-assignment-btn"
                    onClick={handleSaveAttendance}
                    disabled={attendanceSaving || attendanceLoading}
                  >
                    {attendanceSaving ? "Saving Attendance..." : "Save Attendance"}
                  </button>
                </div>
              )}
            </section>
          )}

          {activeTab === "marks" && (
            <section className="faculty-assignments-section">
              <div className="section-heading">
                <div><h2>Mid Marks</h2><p>Enter and save internal marks for your assigned students.</p></div>
                <span className="today-badge">✧ Maximum: 30</span>
              </div>
              <div className="assignment-form-card">
                <div className="assignment-form-grid">
                  <div className="assignment-form-field">
                    <label>Subject / Section *</label>
                    <select value={marksSubject} onChange={(e) => {setMarksSubject(e.target.value);setMarksStudents([]);setMarksError("");setMarksMessage("");}}>
                      <option value="">{loadingSubjects ? "Loading assigned subjects..." : "Select assigned subject"}</option>
                      {subjects.map((subject, index) => <option key={`${getMarksSubjectKey(subject)}-${index}`} value={getMarksSubjectKey(subject)}>{subject.subject_name || `Subject ${subject.subject_id}`} — {subject.section_name || `Section ${subject.section_id}`} ({subject.year_name || subject.academic_year_id})</option>)}
                    </select>
                  </div>
                  <div className="assignment-form-field">
                    <label>Exam *</label>
                    <select value={examType} onChange={(e)=>{setExamType(e.target.value);setMarksStudents([]);setMarksError("");setMarksMessage("");}}>
                      <option value="Mid-1">Mid-1</option><option value="Mid-2">Mid-2</option>
                    </select>
                  </div>
                </div>
                <div className="assignment-form-actions">
                  <button className="save-assignment-btn" type="button" onClick={fetchMidMarks} disabled={!marksSubject || marksLoading}>{marksLoading ? "Loading..." : "Load Students"}</button>
                  <button className="view-submissions-btn" type="button" onClick={fetchMidMarks} disabled={!marksSubject || marksLoading}>View Saved Marks</button>
                </div>
              </div>
              {subjectsError && <p className="assignment-form-error">{subjectsError}</p>}
              {marksError && <p className="assignment-form-error">{marksError}</p>}
              {marksMessage && <div className="assignment-message">{marksMessage}</div>}
              {marksLoading && <div className="module-placeholder"><h2>Loading students...</h2><p>Please wait.</p></div>}
              {!marksLoading && marksSubject && marksStudents.length===0 && !marksError && <div className="module-placeholder"><h2>No students loaded</h2><p>Select subject and exam, then click Load Students.</p></div>}
              {!marksLoading && marksStudents.length>0 && (
                <div className="faculty-assignments-grid">
                  {marksStudents.map((student)=>(
                    <div className="faculty-assignment-card" key={student.student_id}>
                      <div className="assignment-card-top"><span className="assignment-card-icon">▥</span><span className="assignment-card-label">MID MARKS</span></div>
                      <h3>{student.student_name || student.name || "Student"}</h3>
                      <p className="assignment-card-description">{student.roll_number || student.student_roll_number || student.student_id}</p>
                      <div className="assignment-form-field"><label>Marks (0–30) *</label><input type="number" min="0" max="30" step="0.5" value={student.marks_obtained} onChange={(e)=>handleMarksChange(student.student_id,e.target.value)} /></div>
                    </div>
                  ))}
                  <div className="assignment-form-actions"><button type="button" className="save-assignment-btn" onClick={handleSaveMidMarks} disabled={marksSaving}>{marksSaving ? "Saving..." : "Save Mid Marks"}</button></div>
                </div>
              )}
            </section>
          )}

          {activeTab === "semesterResults" && (
  <section className="faculty-assignments-section">
    <div className="section-heading">
      <div>
        <h2>Semester Results</h2>
        <p>Enter semester marks for your assigned students.</p>
      </div>
      <span className="today-badge">✧ Result Upload</span>
    </div>

    <div className="assignment-form-card">
      <div className="assignment-form-grid">
        <div className="assignment-form-field">
          <label>Subject / Section *</label>
          <select
            value={semesterResultsSubject}
            onChange={(e) => {
              setSemesterResultsSubject(e.target.value);
              setSemesterResultsStudents([]);
              setSemesterResultsMessage("");
            }}
          >
            <option value="">Select assigned subject</option>
            {subjects.map((subject, index) => (
              <option
                key={`${getMarksSubjectKey(subject)}-${index}`}
                value={getMarksSubjectKey(subject)}
              >
                {subject.subject_name} — {subject.section_name}
              </option>
            ))}
          </select>
        </div>

        <div className="assignment-form-field">
          <label>Semester *</label>
          <select
            value={semesterNumber}
            onChange={(e) => {
              setSemesterNumber(e.target.value);
              setSemesterResultsStudents([]);
              setSemesterResultsMessage("");
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
              <option key={number} value={number}>
                Semester {number}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="assignment-form-actions">
        <button
          type="button"
          className="save-assignment-btn"
          onClick={fetchSemesterResultsStudents}
          disabled={!semesterResultsSubject || semesterResultsLoading}
        >
          {semesterResultsLoading ? "Loading..." : "Load Students"}
        </button>
      </div>
    </div>

    {semesterResultsMessage && (
      <div className="assignment-message">{semesterResultsMessage}</div>
    )}

    {semesterResultsLoading && (
      <div className="module-placeholder">
        <h2>Loading students...</h2>
        <p>Please wait.</p>
      </div>
    )}

    {!semesterResultsLoading && semesterResultsStudents.length > 0 && (
      <div className="faculty-assignments-grid">
        {semesterResultsStudents.map((student) => (
          <div className="faculty-assignment-card" key={student.student_id}>
            <div className="assignment-card-top">
              <span className="assignment-card-icon">▣</span>
              <span className="assignment-card-label">SEMESTER RESULT</span>
            </div>

            <h3>{student.student_name || student.name || "Student"}</h3>

            <p className="assignment-card-description">
              {student.roll_number || student.student_id}
            </p>

            <div className="assignment-form-field">
              <label>Maximum Marks</label>
              <input
                type="number"
                min="1"
                value={student.maxMarks}
                onChange={(e) =>
                  setSemesterResultsStudents((previous) =>
                    previous.map((item) =>
                      Number(item.student_id) === Number(student.student_id)
                        ? { ...item, maxMarks: e.target.value }
                        : item
                    )
                  )
                }
              />
            </div>

            <div className="assignment-form-field">
              <label>Marks Obtained</label>
              <input
                type="number"
                min="0"
                max={student.maxMarks}
                value={student.marksObtained}
                onChange={(e) =>
                  setSemesterResultsStudents((previous) =>
                    previous.map((item) =>
                      Number(item.student_id) === Number(student.student_id)
                        ? { ...item, marksObtained: e.target.value }
                        : item
                    )
                  )
                }
              />
            </div>
          </div>
        ))}
           </div>
    )}

    {semesterResultsStudents.length > 0 && (
      <div className="assignment-form-actions">
        <button
          type="button"
          className="save-assignment-btn"
          onClick={handleSubmitSemesterResults}
          disabled={semesterResultsLoading}
        >
          {semesterResultsLoading ? "Saving Results..." : "Save Semester Results"}
        </button>
      </div>
    )}
  </section>
)}

          {activeTab === "timetable" && (
            <section className="faculty-assignments-section">
              <div className="section-heading"><div><h2>My Weekly Timetable</h2><p>Your classes assigned by the administration.</p></div></div>
              {timetableLoading && <div className="module-placeholder"><h2>Loading timetable...</h2><p>Please wait.</p></div>}
              {timetableError && <p className="assignment-form-error">{timetableError}</p>}
              {!timetableLoading && timetable.length===0 && !timetableError && <div className="module-placeholder"><h2>No timetable published</h2><p>Your weekly timetable will appear here once it is assigned.</p></div>}
              {!timetableLoading && timetable.length>0 && <div className="faculty-assignments-grid">
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(day=>{
                  const classes=timetable.filter(item=>String(item.day_of_week).toLowerCase()===day.toLowerCase());
                  if(!classes.length)return null;
                  return <div className="faculty-assignment-card" key={day}><div className="assignment-card-top"><span className="assignment-card-icon">▦</span><span className="assignment-card-label">{day.toUpperCase()}</span></div>
                  {classes.map(item=><div key={item.id} className="timetable-card"><h3>{item.subject_name || item.subject_code || "Class"}</h3><p>🕒 {String(item.start_time || "").slice(0,5)} – {String(item.end_time || "").slice(0,5)}</p><p>Section: {item.section_name || item.section || "—"}</p><p>Room: {item.room_number || item.room || "Not specified"}</p></div>)}</div>;
                })}
              </div>}
            </section>
          )}

          

          {activeTab !== "overview" &&
  activeTab !== "subjects" &&
  activeTab !== "assignments" &&
  activeTab !== "submissions" &&
  activeTab !== "attendance" &&
  activeTab !== "marks" &&
  activeTab !== "timetable" &&
  (
              <section className="module-placeholder">
                <div className="module-icon">{currentPage?.icon}</div>
                <span className="welcome-tag">FACULTY WORKSPACE</span>
                <h1>{currentPage?.label}</h1>
                <p>
                  Welcome to your {currentPage?.label.toLowerCase()} module.
                  We will connect this section to your academic database
                  and implement its functionality step by step.
                </p>
                <div className="module-info">
                  <span>✦</span> Module selected successfully
                </div>
                <button
                  className="back-dashboard-btn"
                  onClick={() => setActiveTab("overview")}
                >
                  ← Back to Dashboard
                </button>
              </section>
            )}

          <footer className="faculty-page-footer">
            <span>NBKR Institute of Science & Technology © 2026</span>
          </footer>
        </div>
      </main>
    </div>
  );
}



export default FacultyDashboard;
