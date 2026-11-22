import { useState } from "react";
import "./App.css";
import { BACKEND_URL } from "./config";

import StudentDashboard from "./components/StudentTemp.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import FacultyDashboard from "./components/FacultyDashboard.jsx";
import PrincipalDashboard from "./components/PrincipalDashboard.jsx";

function App() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "error" | "success"
  const [loading, setLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userData, setUserData] = useState(null);

  const [forgotPassword, setForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = `${BACKEND_URL}/api/auth`;

  // ================= LOGIN =================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Authentication failed. Please verify credentials.");
        setMessageType("error");
        return;
      }

      setUserData(data.user);

      const loggedRole = String(
        data.role || data.user?.role || role
      ).toLowerCase();

      setUserRole(loggedRole);
      setLoggedIn(true);
      setMessage("");
      setMessageType("");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to authentication server. Please ensure backend is running.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ================= SEND OTP =================

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to process recovery request for this email.");
        setMessageType("error");
        return;
      }

      setOtpSent(true);
      setMessage(data.message || "Verification code dispatched to your registered email address.");
      setMessageType("success");
    } catch (error) {
      console.error("Send OTP error:", error);
      setMessage("Unable to connect to authentication server. Please check your network connection.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY OTP =================

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid or expired verification code.");
        setMessageType("error");
        return;
      }

      setOtpVerified(true);
      setMessage("Verification successful. You may now set a new password.");
      setMessageType("success");
    } catch (error) {
      console.error("Verify OTP error:", error);
      setMessage("Unable to connect to authentication server. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET PASSWORD =================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match. Please re-enter.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Password update failed. Please retry.");
        setMessageType("error");
        return;
      }

      setMessage("Password updated successfully! Redirecting to login...");
      setMessageType("success");

      setTimeout(() => {
        handleBackToLogin();
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("Unable to connect to authentication server. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ================= BACK TO LOGIN =================

  const handleBackToLogin = () => {
    setForgotPassword(false);
    setOtpSent(false);
    setOtpVerified(false);

    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setPassword("");
    setMessage("");
    setMessageType("");
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    setLoggedIn(false);
    setUserRole("");
    setUserData(null);
    setEmail("");
    setPassword("");
    setMessage("");
    setMessageType("");
    setRole("student");
    handleBackToLogin();
  };

  // ================= DASHBOARDS =================

  if (loggedIn && userRole === "student") {
    return (
      <StudentDashboard
        user={userData}
        onLogout={handleLogout}
      />
    );
  }

  if (loggedIn && userRole === "faculty") {
    return (
      <FacultyDashboard
        user={userData}
        onLogout={handleLogout}
      />
    );
  }

  if (loggedIn && userRole === "admin") {
    return (
      <AdminDashboard
        user={userData}
        onLogout={handleLogout}
      />
    );
  }

  if (loggedIn && userRole === "principal") {
    return (
      <PrincipalDashboard
        user={userData}
        onLogout={handleLogout}
      />
    );
  }

  // ================= LOGIN / FORGOT PASSWORD UI =================

  return (
    <div className="portal-page">
      {/* ================= INSTITUTIONAL MASTHEAD ================= */}
      <header className="inst-masthead">
        <div className="masthead-gold-bar" />
        <div className="masthead-inner">
          <div className="masthead-brand">
            <img
              src="/images/nbkr-logo.png"
              alt="NBKRIST Crest"
              className="masthead-logo"
            />
            <div className="masthead-titles">
              <div className="masthead-primary-line">
                <h1 className="masthead-inst-name">
                  N.B.K.R. INSTITUTE OF SCIENCE &amp; TECHNOLOGY
                </h1>
                <div className="masthead-badges">
                  <span className="badge-tag badge-autonomous">AUTONOMOUS</span>
                  <span className="badge-tag badge-estd">ESTD. 1979</span>
                </div>
              </div>
              <p className="masthead-sub">
                Affiliated to JNTUA, Ananthapuramu &bull; Approved by AICTE, New Delhi &bull; Accredited by NAAC with &lsquo;A&rsquo; Grade
              </p>
            </div>
          </div>

          <div className="masthead-meta">
            <div className="meta-status">
              <span className="meta-status-dot" />
              <span>Official Academic Portal</span>
            </div>
            <div className="meta-session">Academic Session: 2026&ndash;2027</div>
            <div className="meta-contact">Helpdesk: ict@nbkrist.org</div>
          </div>
        </div>
      </header>

      {/* ================= MAIN PORTAL WORKSPACE ================= */}
      <main className="portal-main">
        <div className="portal-container">
          <div className="portal-frame">
            {/* Left Institutional Overview Panel */}
            <section className="portal-showcase">
              <div className="showcase-content">
                <div className="showcase-header-tag">
                  CAMPUSTASK MANAGEMENT SYSTEM
                </div>
                <h2 className="showcase-title">
                  Academic Governance &amp; Task Coordination Portal
                </h2>
                <p className="showcase-desc">
                  A centralized, enterprise-grade academic platform designed to
                  facilitate task allocation, milestone submissions, faculty
                  appraisals, and institutional performance monitoring.
                </p>

                <div className="showcase-pillars">
                  <div className="pillar-item">
                    <div className="pillar-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    </div>
                    <div className="pillar-text">
                      <strong>Student Task Workstation</strong>
                      <span>Access coursework, monitor task deadlines &amp; view submissions</span>
                    </div>
                  </div>

                  <div className="pillar-item">
                    <div className="pillar-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                    <div className="pillar-text">
                      <strong>Faculty Evaluation Desk</strong>
                      <span>Assign academic deliverables, review progress &amp; score student work</span>
                    </div>
                  </div>

                  <div className="pillar-item">
                    <div className="pillar-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="0" ry="0"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                        <line x1="9" y1="21" x2="9" y2="9"/>
                      </svg>
                    </div>
                    <div className="pillar-text">
                      <strong>Principal Executive Console</strong>
                      <span>Institution-wide compliance, departmental metrics &amp; audits</span>
                    </div>
                  </div>

                  <div className="pillar-item">
                    <div className="pillar-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div className="pillar-text">
                      <strong>Administrative Control</strong>
                      <span>Role provisioning, database auditing &amp; system security</span>
                    </div>
                  </div>
                </div>

                <div className="showcase-security">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>
                    Authorized NBKRIST personnel only. Sessions are logged and monitored under institutional security standards.
                  </span>
                </div>
              </div>
            </section>

            {/* Right Authentication Desk */}
            <section className="portal-auth-panel">
              <div className="auth-panel-inner">
                {!forgotPassword ? (
                  <>
                    <div className="auth-header">
                      <h2 className="auth-title">Account Authentication</h2>
                      <p className="auth-subtitle">
                        Select your access role and provide your authorized institutional credentials.
                      </p>
                    </div>

                    {message && (
                      <div className={`auth-alert ${messageType === "success" ? "alert-success" : "alert-error"}`} role="alert">
                        {messageType === "success" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        )}
                        <span>{message}</span>
                      </div>
                    )}

                    {/* Role Segmented Selector */}
                    <div className="role-selector-wrap">
                      <label className="field-label" id="role-select-label">
                        ACCESS ROLE <span className="req">*</span>
                      </label>
                      <div className="role-tab-group" role="tablist" aria-labelledby="role-select-label">
                        {[
                          { id: "student", label: "Student" },
                          { id: "faculty", label: "Faculty" },
                          { id: "principal", label: "Principal" },
                          { id: "admin", label: "Admin" },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            role="tab"
                            aria-selected={role === r.id}
                            className={`role-tab-item ${role === r.id ? "active" : ""}`}
                            onClick={() => {
                              setRole(r.id);
                              setMessage("");
                              setMessageType("");
                            }}
                            disabled={loading}
                          >
                            <span className="role-tab-indicator" />
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="auth-form" noValidate>
                      <div className="form-field">
                        <label className="field-label" htmlFor="user-email">
                          REGISTERED EMAIL ADDRESS <span className="req">*</span>
                        </label>
                        <div className="input-field-wrap">
                          <span className="input-field-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                              <polyline points="22,6 12,13 2,6"/>
                            </svg>
                          </span>
                          <input
                            id="user-email"
                            type="email"
                            placeholder="e.g. yourname@nbkrist.org"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="username"
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <div className="field-label-row">
                          <label className="field-label" htmlFor="user-password">
                            PASSWORD <span className="req">*</span>
                          </label>
                          <button
                            type="button"
                            className="text-action-link"
                            onClick={() => {
                              setForgotPassword(true);
                              setMessage("");
                              setMessageType("");
                            }}
                            disabled={loading}
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="input-field-wrap">
                          <span className="input-field-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="0" ry="0"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          </span>
                          <input
                            id="user-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your account password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="input-eye-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="portal-submit-btn" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="btn-spinner" />
                            <span>Authenticating...</span>
                          </>
                        ) : (
                          <span>Sign In to Portal</span>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  /* ================= PASSWORD RECOVERY ================= */
                  <>
                    <div className="auth-header">
                      <h2 className="auth-title">Credential Recovery</h2>
                      <p className="auth-subtitle">
                        Authenticate your registered email to reset your NBKRIST portal credentials.
                      </p>
                    </div>

                    {/* Step Breadcrumbs */}
                    <div className="recovery-steps-bar">
                      <div className={`recovery-step-item ${!otpSent ? "active" : "completed"}`}>
                        <span className="step-num">1</span>
                        <span className="step-label">Identify</span>
                      </div>
                      <div className="step-divider" />
                      <div className={`recovery-step-item ${otpSent && !otpVerified ? "active" : otpVerified ? "completed" : ""}`}>
                        <span className="step-num">2</span>
                        <span className="step-label">Verify OTP</span>
                      </div>
                      <div className="step-divider" />
                      <div className={`recovery-step-item ${otpVerified ? "active" : ""}`}>
                        <span className="step-num">3</span>
                        <span className="step-label">New Password</span>
                      </div>
                    </div>

                    {message && (
                      <div className={`auth-alert ${messageType === "success" ? "alert-success" : "alert-error"}`} role="alert">
                        {messageType === "success" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        )}
                        <span>{message}</span>
                      </div>
                    )}

                    {/* Step 1: Send OTP */}
                    {!otpSent && (
                      <form onSubmit={handleSendOTP} className="auth-form" noValidate>
                        <div className="form-field">
                          <label className="field-label" htmlFor="recovery-email">
                            REGISTERED EMAIL ADDRESS <span className="req">*</span>
                          </label>
                          <div className="input-field-wrap">
                            <span className="input-field-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                              </svg>
                            </span>
                            <input
                              id="recovery-email"
                              type="email"
                              placeholder="Enter your registered email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              disabled={loading}
                              autoComplete="email"
                            />
                          </div>
                        </div>

                        <button type="submit" className="portal-submit-btn" disabled={loading}>
                          {loading ? (
                            <>
                              <span className="btn-spinner" />
                              <span>Dispatching OTP...</span>
                            </>
                          ) : (
                            <span>Send Verification Code</span>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {otpSent && !otpVerified && (
                      <form onSubmit={handleVerifyOTP} className="auth-form" noValidate>
                        <div className="form-field">
                          <label className="field-label" htmlFor="recovery-otp">
                            ENTER 6-DIGIT VERIFICATION CODE <span className="req">*</span>
                          </label>
                          <div className="input-field-wrap">
                            <span className="input-field-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="0" ry="0"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                            </span>
                            <input
                              id="recovery-otp"
                              type="text"
                              className="otp-input-field"
                              placeholder="0 0 0 0 0 0"
                              value={otp}
                              onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                              }
                              maxLength={6}
                              inputMode="numeric"
                              required
                              disabled={loading}
                            />
                          </div>
                          <span className="field-hint">Check your email inbox or spam folder for the 6-digit code.</span>
                        </div>

                        <button type="submit" className="portal-submit-btn" disabled={loading}>
                          {loading ? (
                            <>
                              <span className="btn-spinner" />
                              <span>Verifying Code...</span>
                            </>
                          ) : (
                            <span>Verify Code</span>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Step 3: Set New Password */}
                    {otpVerified && (
                      <form onSubmit={handleResetPassword} className="auth-form" noValidate>
                        <div className="form-field">
                          <label className="field-label" htmlFor="new-password">
                            NEW PASSWORD <span className="req">*</span>
                          </label>
                          <div className="input-field-wrap">
                            <span className="input-field-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="0" ry="0"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                            </span>
                            <input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter at least 8 characters"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              minLength={8}
                              maxLength={72}
                              required
                              disabled={loading}
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="input-eye-toggle"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              tabIndex={-1}
                            >
                              {showNewPassword ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                  <line x1="1" y1="1" x2="23" y2="23"/>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="form-field">
                          <label className="field-label" htmlFor="confirm-password">
                            CONFIRM NEW PASSWORD <span className="req">*</span>
                          </label>
                          <div className="input-field-wrap">
                            <span className="input-field-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="0" ry="0"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                            </span>
                            <input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              minLength={8}
                              maxLength={72}
                              required
                              disabled={loading}
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="input-eye-toggle"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                  <line x1="1" y1="1" x2="23" y2="23"/>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                  <circle cx="12" cy="12" r="3"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <button type="submit" className="portal-submit-btn" disabled={loading}>
                          {loading ? (
                            <>
                              <span className="btn-spinner" />
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <span>Set New Password</span>
                          )}
                        </button>
                      </form>
                    )}

                    <div className="back-to-login-row">
                      <button
                        type="button"
                        className="portal-back-btn"
                        onClick={handleBackToLogin}
                        disabled={loading}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="19" y1="12" x2="5" y2="12"/>
                          <polyline points="12 19 5 12 12 5"/>
                        </svg>
                        <span>Return to Sign In</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Authentication Trust Footer */}
                <div className="auth-trust-footer">
                  <div className="trust-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="0" ry="0"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>256-Bit SSL Encrypted Connection</span>
                  </div>
                  <div className="trust-separator">&bull;</div>
                  <div className="trust-item">
                    <span>Identity Managed by NBKRIST ICT</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ================= INSTITUTIONAL FOOTER ================= */}
      <footer className="inst-footer">
        <div className="inst-footer-inner">
          <p className="footer-copy">
            &copy; 2026 N.B.K.R. Institute of Science &amp; Technology (Autonomous). All Rights Reserved.
          </p>
          <p className="footer-meta">
            Vidyanagar, Kota Mandal, Tirupati District, Andhra Pradesh &ndash; 524413 | Approved by AICTE &bull; Affiliated to JNTUA
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
