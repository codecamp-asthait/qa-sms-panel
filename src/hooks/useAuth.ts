import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem("authToken");

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    navigate("/signin");
  }, [navigate]);

  return { isAuthenticated, logout };
};
