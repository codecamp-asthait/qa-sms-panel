import axios from "axios";

// Uses Vite proxy in dev to avoid mixed-content issues
const API_BASE_URL = "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login-page")) {
        window.history.pushState({}, "", "/login-page");
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (username: string, password: string) =>
  api.post("/login", { username, password });

// Students
export const getStudents = (params?: Record<string, string>) =>
  api.get("/api/student", { params });

export const getStudentById = (registrationId: number) =>
  api.get(`/api/student/${registrationId}`);

export const createStudent = (data: Record<string, unknown>) =>
  api.post("/api/student", data);

export const updateStudent = (registrationId: number, data: Record<string, unknown>) =>
  api.put(`/api/student/${registrationId}`, data);

export const deleteStudent = (registrationId: number) =>
  api.delete(`/api/student/${registrationId}`);

// Teachers
export const getTeachers = (params?: Record<string, string>) =>
  api.get("/api/teacher", { params });

export const getTeacherById = (teacherId: number) =>
  api.get(`/api/teacher/${teacherId}`);

export const createTeacher = (data: Record<string, unknown>) =>
  api.post("/api/teacher", data);

export const updateTeacher = (teacherId: number, data: Record<string, unknown>) =>
  api.put(`/api/teacher/${teacherId}`, data);

export const deleteTeacher = (teacherId: number) =>
  api.delete(`/api/teacher/${teacherId}`);

export default api;
