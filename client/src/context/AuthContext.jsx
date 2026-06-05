import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        try {
          const { data } = await api.get("/users/profile");
          setUser(data);
        } catch (error) {
          localStorage.removeItem("userInfo");
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Check credentials.";
      return { success: false, message };
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        confirmPassword,
      });
      // Successful registration, but do not auto-login
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed.";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed on server:", error);
    }
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, theme, toggleTheme }}
    >
      {children}
    </AuthContext.Provider>
  );
};
