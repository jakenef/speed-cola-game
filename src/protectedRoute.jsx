import React from "react";
import { Navigate } from "react-router-dom";
import {useState, useEffect} from "react";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/scores", { credentials: "include" });
        if (response.ok) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
