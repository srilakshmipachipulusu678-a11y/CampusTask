// Centralized API and Backend configuration from environment variables
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const API_URL =
  import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;
