
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./AdminDashboard.css";

function AdminDashboard({ user }) {

  
const [profile, setProfile] = useState(null);
const [profileLoading, setProfileLoading] = useState(true);
const [profileError, setProfileError] = useState("");
const [isEditingProfile, setIsEditingProfile] = useState(false);
const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);

const [profileForm, setProfileForm] = useState({
  name: "",
  email: "",
  phone: "",
});

const [passwordForm, setPasswordForm] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const [profileMessage, setProfileMessage] = useState("");
const [passwordMessage, setPasswordMessage] = useState("");


const fetchProfile = async () => {
  try {
    setProfileLoading(true);
    setProfileError("");

    const response = await fetch(
      "http://localhost:5000/api/admin/profile",
      {
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load profile");
    }

    setProfile(data);
    setProfileForm({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
    });
  } catch (error) {
    setProfileError(error.message);
  } finally {
    setProfileLoading(false);
  }
};

useEffect(() => {
  fetchProfile();
}, []);



  const [activeSection, setActiveSection] = useState("dashboard");

  const [overview, setOverview] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalDepartments: 0,
    activeUsers: 0,
  });

  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  const [sectionAttendance, setSectionAttendance] = useState([]);
  const [attendanceGraphLoading, setAttendanceGraphLoading] = useState(true);

  const [subjectMarks, setSubjectMarks] = useState([]);
  const [subjectMarksLoading, setSubjectMarksLoading] = useState(true);
  
const [students, setStudents] = useState([]);
const [studentsLoading, setStudentsLoading] = useState(false);
const [studentSearch, setStudentSearch] = useState("");

const [faculty, setFaculty] = useState([]);
const [facultyLoading, setFacultyLoading] = useState(false);
const [facultySearch, setFacultySearch] = useState("");


const [departments, setDepartments] = useState([]);
const [departmentsLoading, setDepartmentsLoading] = useState(false);
const [departmentSearch, setDepartmentSearch] = useState("");
const [newDepartment, setNewDepartment] = useState("");


const [sections, setSections] = useState([]);
const [sectionsLoading, setSectionsLoading] = useState(false);
const [sectionSearch, setSectionSearch] = useState("");

const [sectionDepartments, setSectionDepartments] = useState([]);
const [sectionAcademicYears, setSectionAcademicYears] = useState([]);

const [newSection, setNewSection] = useState({
  department_id: "",
  course_name: "",
  year_of_study: "",
  section_name: "",
  academic_year_id: ""
});


const [academicYears, setAcademicYears] = useState([]);
const [academicYearsLoading, setAcademicYearsLoading] = useState(false);
const [academicYearSearch, setAcademicYearSearch] = useState("");

const [newAcademicYear, setNewAcademicYear] = useState({
  year_name: "",
  start_date: "",
  end_date: ""
});


const [facultyAssignments, setFacultyAssignments] = useState([]);
const [facultyAssignmentsLoading, setFacultyAssignmentsLoading] = useState(false);
const [assignmentSearch, setAssignmentSearch] = useState("");

const [assignmentFaculty, setAssignmentFaculty] = useState([]);
const [assignmentSubjects, setAssignmentSubjects] = useState([]);
const [assignmentSections, setAssignmentSections] = useState([]);
const [assignmentAcademicYears, setAssignmentAcademicYears] = useState([]);

const [newAssignment, setNewAssignment] = useState({
  faculty_id: "",
  subject_id: "",
  section_id: "",
  academic_year_id: ""
});

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/overview")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch admin overview");
        }
        return response.json();
      })
      .then((data) => {
        setOverview(data);
        setOverviewError("");
      })
      .catch((error) => {
        console.error("Admin overview error:", error);
        setOverviewError("Unable to load dashboard statistics.");
      })
      .finally(() => {
        setOverviewLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/section-attendance")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch section attendance");
        }
        return response.json();
      })
      .then((data) => {
        setSectionAttendance(data);
      })
      .catch((error) => {
        console.error("Attendance graph error:", error);
      })
      .finally(() => {
        setAttendanceGraphLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/subject-average-marks")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch subject average marks");
        }
        return response.json();
      })
      .then((data) => {
        setSubjectMarks(data);
      })
      .catch((error) => {
        console.error("Subject average marks error:", error);
      })
      .finally(() => {
        setSubjectMarksLoading(false);
      });
  }, []);

  
useEffect(() => {
  if (activeSection === "students") {
    setStudentsLoading(true);

    fetch("http://localhost:5000/api/admin/students")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        return response.json();
      })
      .then((data) => {
        setStudents(data);
      })
      .catch((error) => {
        console.error("Students fetch error:", error);
      })
      .finally(() => {
        setStudentsLoading(false);
      });
  }
}, [activeSection]);


useEffect(() => {
  if (activeSection === "faculty") {
    setFacultyLoading(true);

    fetch("http://localhost:5000/api/admin/faculty")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch faculty");
        }
        return response.json();
      })
      .then((data) => {
        setFaculty(data);
      })
      .catch((error) => {
        console.error("Faculty fetch error:", error);
      })
      .finally(() => {
        setFacultyLoading(false);
      });
  }
}, [activeSection]);


useEffect(() => {
  if (activeSection === "departments") {
    setDepartmentsLoading(true);

    fetch("http://localhost:5000/api/admin/departments")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch departments");
        }
        return response.json();
      })
      .then((data) => {
        setDepartments(data);
      })
      .catch((error) => {
        console.error("Departments fetch error:", error);
      })
      .finally(() => {
        setDepartmentsLoading(false);
      });
  }
}, [activeSection]);


useEffect(() => {
  if (activeSection === "sections") {
    setSectionsLoading(true);

    fetch("http://localhost:5000/api/admin/sections")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch sections");
        }
        return response.json();
      })
      .then((data) => setSections(data))
      .catch((error) => {
        console.error("Sections fetch error:", error);
      })
      .finally(() => setSectionsLoading(false));

    fetch("http://localhost:5000/api/admin/section-form-data")
      .then((response) => response.json())
      .then((data) => {
        setSectionDepartments(data.departments);
        setSectionAcademicYears(data.academicYears);
      })
      .catch((error) => {
        console.error("Section form data error:", error);
      });
  }
}, [activeSection]);


useEffect(() => {
  if (activeSection === "academic-years") {
    setAcademicYearsLoading(true);

    fetch("http://localhost:5000/api/admin/academic-years")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch academic years");
        }
        return response.json();
      })
      .then((data) => setAcademicYears(data))
      .catch((error) => {
        console.error("Academic years fetch error:", error);
      })
      .finally(() => setAcademicYearsLoading(false));
  }
}, [activeSection]);


useEffect(() => {
  if (activeSection === "faculty-assignments") {
    setFacultyAssignmentsLoading(true);

    fetch("http://localhost:5000/api/admin/faculty-assignments")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }
        return response.json();
      })
      .then((data) => setFacultyAssignments(data))
      .catch((error) => {
        console.error("Faculty assignments fetch error:", error);
      })
      .finally(() => setFacultyAssignmentsLoading(false));

    fetch("http://localhost:5000/api/admin/faculty-assignment-form-data")
      .then((response) => response.json())
      .then((data) => {
        setAssignmentFaculty(data.faculty);
        setAssignmentSubjects(data.subjects);
        setAssignmentSections(data.sections);
        setAssignmentAcademicYears(data.academicYears);
      })
      .catch((error) => {
        console.error("Assignment form data error:", error);
      });
  }
}, [activeSection]);



const toggleStudentStatus = (student) => {
  const newStatus = student.is_active ? 0 : 1;

  fetch(`http://localhost:5000/api/admin/students/${student.id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      is_active: newStatus
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update student status");
      }
      return response.json();
    })
    .then(() => {
      setStudents((prevStudents) =>
        prevStudents.map((item) =>
          item.id === student.id
            ? { ...item, is_active: newStatus }
            : item
        )
      );
    })
    .catch((error) => {
      console.error("Student status update error:", error);
      alert("Unable to update student status");
    });
};


const toggleFacultyStatus = (member) => {
  const newStatus = member.is_active ? 0 : 1;

  fetch(`http://localhost:5000/api/admin/faculty/${member.id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      is_active: newStatus
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update faculty status");
      }
      return response.json();
    })
    .then(() => {
      setFaculty((prevFaculty) =>
        prevFaculty.map((item) =>
          item.id === member.id
            ? { ...item, is_active: newStatus }
            : item
        )
      );
    })
    .catch((error) => {
      console.error("Faculty status update error:", error);
      alert("Unable to update faculty status");
    });
};


const addDepartment = () => {
  if (!newDepartment.trim()) {
    alert("Please enter a department name");
    return;
  }

  fetch("http://localhost:5000/api/admin/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      department_name: newDepartment.trim()
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to add department");
      }
      return response.json();
    })
    .then((data) => {
      setDepartments((prev) => [...prev, data]);
      setNewDepartment("");
    })
    .catch((error) => {
      console.error("Department creation error:", error);
      alert("Unable to add department");
    });
};

const deleteDepartment = (departmentId) => {
  if (!window.confirm("Are you sure you want to delete this department?")) {
    return;
  }

  fetch(`http://localhost:5000/api/admin/departments/${departmentId}`, {
    method: "DELETE"
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete department");
      }
      return response.json();
    })
    .then(() => {
      setDepartments((prev) =>
        prev.filter((department) => department.id !== departmentId)
      );
    })
    .catch((error) => {
      console.error("Department deletion error:", error);
      alert("Unable to delete department. It may be assigned to existing records.");
    });
};


const addSection = () => {
  const {
    department_id,
    course_name,
    year_of_study,
    section_name,
    academic_year_id
  } = newSection;

  if (
    !department_id ||
    !course_name.trim() ||
    !year_of_study ||
    !section_name.trim() ||
    !academic_year_id
  ) {
    alert("Please fill in all section details");
    return;
  }

  fetch("http://localhost:5000/api/admin/sections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newSection)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to create section");
      }
      return response.json();
    })
    .then(() => {
      setNewSection({
        department_id: "",
        course_name: "",
        year_of_study: "",
        section_name: "",
        academic_year_id: ""
      });

      fetch("http://localhost:5000/api/admin/sections")
        .then((response) => response.json())
        .then((data) => setSections(data));

      alert("Section created successfully");
    })
    .catch((error) => {
      console.error("Section creation error:", error);
      alert("Unable to create section. Check for duplicate entries.");
    });
};

const deleteSection = (sectionId) => {
  if (!window.confirm("Are you sure you want to delete this section?")) {
    return;
  }

  fetch(`http://localhost:5000/api/admin/sections/${sectionId}`, {
    method: "DELETE"
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete section");
      }
      return response.json();
    })
    .then(() => {
      setSections((prev) =>
        prev.filter((section) => section.id !== sectionId)
      );
    })
    .catch((error) => {
      console.error("Section deletion error:", error);
      alert("Unable to delete section. It may have enrolled students.");
    });
};


const addAcademicYear = () => {
  const { year_name, start_date, end_date } = newAcademicYear;

  if (!year_name.trim() || !start_date || !end_date) {
    alert("Please fill in all academic year details");
    return;
  }

  if (start_date >= end_date) {
    alert("End date must be after start date");
    return;
  }

  fetch("http://localhost:5000/api/admin/academic-years", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newAcademicYear)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to add academic year");
      }
      return response.json();
    })
    .then((data) => {
      setAcademicYears((prev) => [...prev, data]);
      setNewAcademicYear({
        year_name: "",
        start_date: "",
        end_date: ""
      });
      alert("Academic year added successfully");
    })
    .catch((error) => {
      console.error("Academic year creation error:", error);
      alert("Unable to add academic year");
    });
};

const setCurrentAcademicYear = (yearId) => {
  fetch(
    `http://localhost:5000/api/admin/academic-years/${yearId}/current`,
    {
      method: "PUT"
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update current academic year");
      }
      return response.json();
    })
    .then(() => {
      setAcademicYears((prev) =>
        prev.map((year) => ({
          ...year,
          is_current: year.id === yearId ? 1 : 0
        }))
      );
      alert("Current academic year updated");
    })
    .catch((error) => {
      console.error("Current academic year update error:", error);
      alert("Unable to update current academic year");
    });
};


const addFacultyAssignment = () => {
  const {
    faculty_id,
    subject_id,
    section_id,
    academic_year_id
  } = newAssignment;

  if (!faculty_id || !subject_id || !section_id || !academic_year_id) {
    alert("Please select all assignment details");
    return;
  }

  fetch("http://localhost:5000/api/admin/faculty-assignments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newAssignment)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to assign faculty");
      }
      return response.json();
    })
    .then(() => {
      setNewAssignment({
        faculty_id: "",
        subject_id: "",
        section_id: "",
        academic_year_id: ""
      });

      fetch("http://localhost:5000/api/admin/faculty-assignments")
        .then((response) => response.json())
        .then((data) => setFacultyAssignments(data));

      alert("Faculty assigned successfully");
    })
    .catch((error) => {
      console.error("Faculty assignment error:", error);
      alert("Unable to assign faculty. Check if this assignment already exists.");
    });
};

const removeFacultyAssignment = (assignmentId) => {
  if (!window.confirm("Are you sure you want to remove this assignment?")) {
    return;
  }

  fetch(
    `http://localhost:5000/api/admin/faculty-assignments/${assignmentId}`,
    {
      method: "DELETE"
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to remove assignment");
      }
      return response.json();
    })
    .then(() => {
      setFacultyAssignments((prev) =>
        prev.filter((item) => item.id !== assignmentId)
      );
    })
    .catch((error) => {
      console.error("Remove assignment error:", error);
      alert("Unable to remove assignment");
    });
};



  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "students", label: "Student Management", icon: "🎓" },
    { id: "faculty", label: "Faculty Management", icon: "👨‍🏫" },
    { id: "departments", label: "Departments", icon: "🏢" },
    { id: "sections", label: "Sections", icon: "📚" },
    { id: "academic-years", label: "Academic Years", icon: "📅" },
    { id: "profile", label: "My Profile", icon: "👤" },
    
{
  id: "faculty-assignments",
  label: "Faculty Assignments"
},

  ];

  const renderContent = () => {
    switch (activeSection) {
      
case "students":
  return (
    <section className="dashboard-section">
      <h2>Student Management</h2>
      <p>View and manage all registered students.</p>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={studentSearch}
        onChange={(e) => setStudentSearch(e.target.value)}
        className="student-search"
      />

      {studentsLoading ? (
        <p>Loading students...</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {students
                .filter((student) =>
                  student.name
                    .toLowerCase()
                    .includes(studentSearch.toLowerCase()) ||
                  student.email
                    .toLowerCase()
                    .includes(studentSearch.toLowerCase())
                )
                .map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      <span
                        className={
                          student.is_active
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {student.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    
<td>
  <button
    className={
      student.is_active
        ? "deactivate-btn"
        : "activate-btn"
    }
    onClick={() => toggleStudentStatus(student)}
  >
    {student.is_active ? "Deactivate" : "Activate"}
  </button>
</td>

                  

                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );


      
case "faculty":
  return (
    <section className="dashboard-section">
      <h2>Faculty Management</h2>
      <p>View and manage registered faculty accounts.</p>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={facultySearch}
        onChange={(e) => setFacultySearch(e.target.value)}
        className="student-search"
      />

      {facultyLoading ? (
        <p>Loading faculty...</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Faculty Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {faculty
                .filter((member) =>
                  member.name
                    .toLowerCase()
                    .includes(facultySearch.toLowerCase()) ||
                  member.email
                    .toLowerCase()
                    .includes(facultySearch.toLowerCase())
                )
                .map((member) => (
                  <tr key={member.id}>
                    <td>{member.id}</td>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <span
                        className={
                          member.is_active
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={
                          member.is_active
                            ? "deactivate-btn"
                            : "activate-btn"
                        }
                        onClick={() => toggleFacultyStatus(member)}
                      >
                        {member.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );


      
case "departments":
  return (
    <section className="dashboard-section">
      <h2>Department Management</h2>
      <p>Add and manage college departments.</p>

      <div className="department-form">
        <input
          type="text"
          placeholder="Enter department name"
          value={newDepartment}
          onChange={(e) => setNewDepartment(e.target.value)}
          className="student-search"
        />

        <button className="add-btn" onClick={addDepartment}>
          Add Department
        </button>
      </div>

      <input
        type="text"
        placeholder="Search departments..."
        value={departmentSearch}
        onChange={(e) => setDepartmentSearch(e.target.value)}
        className="student-search"
      />

      {departmentsLoading ? (
        <p>Loading departments...</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Department Name</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {departments
                .filter((department) =>
                  department.department_name
                    .toLowerCase()
                    .includes(departmentSearch.toLowerCase())
                )
                .map((department) => (
                  <tr key={department.id}>
                    <td>{department.id}</td>
                    <td>{department.department_name}</td>
                    <td>
                      <button
                        className="deactivate-btn"
                        onClick={() => deleteDepartment(department.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );


      
case "sections":
  return (
    <section className="dashboard-section">
      <h2>Section Management</h2>
      <p>Create and manage academic sections.</p>

      <div className="section-form">
        <select
          value={newSection.department_id}
          onChange={(e) =>
            setNewSection({
              ...newSection,
              department_id: e.target.value
            })
          }
        >
          <option value="">Select Department</option>
          {sectionDepartments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.department_name}
            </option>
          ))}
        </select>

        <input
          placeholder="Course name (e.g. B.Tech)"
          value={newSection.course_name}
          onChange={(e) =>
            setNewSection({
              ...newSection,
              course_name: e.target.value
            })
          }
        />

        <select
          value={newSection.year_of_study}
          onChange={(e) =>
            setNewSection({
              ...newSection,
              year_of_study: e.target.value
            })
          }
        >
          <option value="">Select Year</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>

        <input
          placeholder="Section (e.g. A)"
          value={newSection.section_name}
          onChange={(e) =>
            setNewSection({
              ...newSection,
              section_name: e.target.value
            })
          }
        />

        <select
          value={newSection.academic_year_id}
          onChange={(e) =>
            setNewSection({
              ...newSection,
              academic_year_id: e.target.value
            })
          }
        >
          <option value="">Select Academic Year</option>
          {sectionAcademicYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.year_name}
            </option>
          ))}
        </select>

        <button className="add-btn" onClick={addSection}>
          Add Section
        </button>
      </div>

      <input
        className="student-search"
        placeholder="Search sections..."
        value={sectionSearch}
        onChange={(e) => setSectionSearch(e.target.value)}
      />

      {sectionsLoading ? (
        <p>Loading sections...</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Department</th>
                <th>Course</th>
                <th>Year</th>
                <th>Section</th>
                <th>Academic Year</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {sections
                .filter((section) =>
                  `${section.department_name} ${section.course_name} ${section.year_of_study} ${section.section_name} ${section.year_name}`
                    .toLowerCase()
                    .includes(sectionSearch.toLowerCase())
                )
                .map((section) => (
                  <tr key={section.id}>
                    <td>{section.id}</td>
                    <td>{section.department_name}</td>
                    <td>{section.course_name}</td>
                    <td>{section.year_of_study}</td>
                    <td>{section.section_name}</td>
                    <td>{section.year_name}</td>
                    <td>
                      <button
                        className="deactivate-btn"
                        onClick={() => deleteSection(section.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );


      
case "academic-years":
  return (
    <section className="dashboard-section">
      <h2>Academic Year Management</h2>
      <p>Create academic years and set the current academic year.</p>

      <div className="section-form">
        <input
          placeholder="Academic year (e.g. 2026-2027)"
          value={newAcademicYear.year_name}
          onChange={(e) =>
            setNewAcademicYear({
              ...newAcademicYear,
              year_name: e.target.value
            })
          }
        />

        <label>Start Date</label>
        <input
          type="date"
          value={newAcademicYear.start_date}
          onChange={(e) =>
            setNewAcademicYear({
              ...newAcademicYear,
              start_date: e.target.value
            })
          }
        />

        <label>End Date</label>
        <input
          type="date"
          value={newAcademicYear.end_date}
          onChange={(e) =>
            setNewAcademicYear({
              ...newAcademicYear,
              end_date: e.target.value
            })
          }
        />

        <button className="add-btn" onClick={addAcademicYear}>
          Add Academic Year
        </button>
      </div>

      <input
        className="student-search"
        placeholder="Search academic years..."
        value={academicYearSearch}
        onChange={(e) => setAcademicYearSearch(e.target.value)}
      />

      {academicYearsLoading ? (
        <p>Loading academic years...</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Academic Year</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {academicYears
                .filter((year) =>
                  year.year_name
                    .toLowerCase()
                    .includes(academicYearSearch.toLowerCase())
                )
                .map((year) => (
                  <tr key={year.id}>
                    <td>{year.id}</td>
                    <td>{year.year_name}</td>
                    <td>{year.start_date?.split("T")[0]}</td>
                    <td>{year.end_date?.split("T")[0]}</td>
                    <td>
                      <span
                        className={
                          year.is_current
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {year.is_current ? "Current" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {!year.is_current && (
                        <button
                          className="activate-btn"
                          onClick={() => setCurrentAcademicYear(year.id)}
                        >
                          Set Current
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  
case "faculty-assignments":
  return (
    <section className="dashboard-section">
      <h2>Faculty Subject & Section Assignment</h2>
      <p>Assign faculty members to subjects and sections.</p>

      <div className="section-form">
        <select
          value={newAssignment.faculty_id}
          onChange={(e) =>
            setNewAssignment({
              ...newAssignment,
              faculty_id: e.target.value
            })
          }
        >
          <option value="">Select Faculty</option>
          {assignmentFaculty.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>

        <select
          value={newAssignment.subject_id}
          onChange={(e) =>
            setNewAssignment({
              ...newAssignment,
              subject_id: e.target.value
            })
          }
        >
          <option value="">Select Subject</option>
          {assignmentSubjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subject_name} ({subject.subject_code})
            </option>
          ))}
        </select>

        <select
          value={newAssignment.section_id}
          onChange={(e) =>
            setNewAssignment({
              ...newAssignment,
              section_id: e.target.value
            })
          }
        >
          <option value="">Select Section</option>
          {assignmentSections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.course_name} - Year {section.year_of_study} - Section {section.section_name}
            </option>
          ))}
        </select>

        <select
          value={newAssignment.academic_year_id}
          onChange={(e) =>
            setNewAssignment({
              ...newAssignment,
              academic_year_id: e.target.value
            })
          }
        >
          <option value="">Select Academic Year</option>
          {assignmentAcademicYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.year_name}
            </option>
          ))}
        </select>

        <button className="add-btn" onClick={addFacultyAssignment}>
          Assign Faculty
        </button>
      </div>

      <input
        className="student-search"
        placeholder="Search faculty, subject or section..."
        value={assignmentSearch}
        onChange={(e) => setAssignmentSearch(e.target.value)}
      />

      {facultyAssignmentsLoading ? (
        <p>Loading assignments...</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Subject</th>
                <th>Course</th>
                <th>Year</th>
                <th>Section</th>
                <th>Academic Year</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {facultyAssignments
                .filter((item) =>
                  `${item.faculty_name} ${item.faculty_email} ${item.subject_name} ${item.course_name} ${item.section_name} ${item.year_name}`
                    .toLowerCase()
                    .includes(assignmentSearch.toLowerCase())
                )
                .map((item) => (
                  <tr key={item.id}>
                    <td>{item.faculty_name}</td>
                    <td>{item.subject_name}</td>
                    <td>{item.course_name}</td>
                    <td>{item.year_of_study}</td>
                    <td>{item.section_name}</td>
                    <td>{item.year_name}</td>
                    <td>
                      <button
                        className="deactivate-btn"
                        onClick={() => removeFacultyAssignment(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

      
case "profile":
  return (
    <section className="dashboard-section">
      <h2>My Profile</h2>

      {profileLoading ? (
        <p>Loading profile...</p>
      ) : profileError ? (
        <p style={{ color: "red" }}>{profileError}</p>
      ) : (
        <div className="admin-profile-container">
          <div className="admin-profile-header">
            <div className="admin-profile-photo-section">
              <img
                src={
                  profile?.profile_photo
                    ? `http://localhost:5000${profile.profile_photo}`
                    : "https://via.placeholder.com/120"
                }
                alt="Admin Profile"
                className="admin-profile-photo"
              />

              <label className="profile-photo-upload-btn">
                Change Photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files[0];

                    if (!file) return;

                    if (file.size > 2 * 1024 * 1024) {
                      alert("Photo must be less than 2MB");
                      e.target.value = "";
                      return;
                    }

                    const formData = new FormData();
                    formData.append("photo", file);

                    try {
                      setProfilePhotoUploading(true);

                      const response = await fetch(
                        "http://localhost:5000/api/admin/profile/photo",
                        {
                          method: "POST",
                          credentials: "include",
                          body: formData,
                        }
                      );

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(data.message || "Photo upload failed");
                      }

                      setProfile(data.profile || data);
                      setProfileMessage("Profile photo updated successfully!");
                    } catch (error) {
                      alert(error.message);
                    } finally {
                      setProfilePhotoUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>

              {profilePhotoUploading && <p>Uploading photo...</p>}
            </div>

            <div className="admin-profile-details">
              <h3>{profile?.name}</h3>
              <p>{profile?.role === "principal" ? "Principal" : "Correspondent"}</p>
            </div>
          </div>

          {profileMessage && (
            <p className="profile-success-message">{profileMessage}</p>
          )}

          <div className="admin-profile-form">
            <div className="profile-form-field">
              <label>Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                disabled={!isEditingProfile}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className="profile-form-field">
              <label>Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                disabled={!isEditingProfile}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="profile-form-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                disabled={!isEditingProfile}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    phone: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {!isEditingProfile ? (
            <button
              className="profile-edit-btn"
              onClick={() => setIsEditingProfile(true)}
            >
              Edit Profile
            </button>
          ) : (
            <div className="profile-action-buttons">
              <button
                className="profile-save-btn"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      "http://localhost:5000/api/admin/profile",
                      {
                        method: "PUT",
                        credentials: "include",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(profileForm),
                      }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.message || "Profile update failed");
                    }

                    setProfile(data.profile || data);
                    setProfileForm({
                      name: data.profile?.name || data.name || profileForm.name,
                      email: data.profile?.email || data.email || profileForm.email,
                      phone: data.profile?.phone || data.phone || profileForm.phone,
                    });

                    setIsEditingProfile(false);
                    setProfileMessage("Profile updated successfully!");
                  } catch (error) {
                    alert(error.message);
                  }
                }}
              >
                Save Changes
              </button>

              <button
                className="profile-cancel-btn"
                onClick={() => {
                  setProfileForm({
                    name: profile?.name || "",
                    email: profile?.email || "",
                    phone: profile?.phone || "",
                  });
                  setIsEditingProfile(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );


      default:
        return (
          <section className="dashboard-section">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Students 🎓</h3>
                <h2>{overviewLoading ? "..." : overview.totalStudents}</h2>
              </div>

              <div className="summary-card">
                <h3>Total Faculty 👨‍🏫</h3>
                <h2>{overviewLoading ? "..." : overview.totalFaculty}</h2>
              </div>

              <div className="summary-card">
                <h3>Total Departments 🏢</h3>
                <h2>{overviewLoading ? "..." : overview.totalDepartments}</h2>
              </div>

              <div className="summary-card">
                <h3>Active Users 🟢</h3>
                <h2>{overviewLoading ? "..." : overview.activeUsers}</h2>
              </div>
            </div>

            {overviewError && <p>{overviewError}</p>}

            <div className="dashboard-section">
              <h2>Section-wise Attendance</h2>

              {attendanceGraphLoading ? (
                <p>Loading attendance data...</p>
              ) : sectionAttendance.length === 0 ? (
                <p>No attendance data available.</p>
              ) : (
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sectionAttendance}
                      layout="vertical"
                      margin={{ top: 10, right: 45, left: 10, bottom: 10 }}
                      barSize={25}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        horizontal={true}
                        vertical={false}
                      />

                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        type="category"
                        dataKey="section_name"
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />

                      <Tooltip
                        formatter={(value) => [`${value}%`, "Attendance"]}
                        contentStyle={{
                          borderRadius: "10px",
                          border: "1px solid #e5e7eb",
                        }}
                      />

                      <Bar
                        dataKey="attendance_percentage"
                        name="Attendance"
                        fill="#6366f1"
                        radius={[0, 8, 8, 0]}
                        label={{
                          position: "right",
                          formatter: (value) => `${value}%`,
                          fill: "#374151",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Subject-wise Average Marks</h2>

              {subjectMarksLoading ? (
                <p>Loading subject marks...</p>
              ) : subjectMarks.length === 0 ? (
                <p>No subject marks available.</p>
              ) : (
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjectMarks}
                      margin={{ top: 20, right: 20, left: 10, bottom: 50 }}
                      barSize={40}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                      />

                      <XAxis
                        dataKey="subject_name"
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        height={70}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        formatter={(value) => [`${value}%`, "Average Marks"]}
                        contentStyle={{
                          borderRadius: "10px",
                          border: "1px solid #e5e7eb",
                        }}
                      />

                      <Bar
                        dataKey="average_percentage"
                        name="Average Marks"
                        fill="#0ea5e9"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>
        );
    }
  };

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-dashboard-sidebar">
        <div className="sidebar-header">
          <h2>NBKRIST</h2>
          <p>Academic Management System</p>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Welcome, Admin! 👋</h1>
            <p>NBKR Institute of Science and Technology</p>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

export default AdminDashboard;
