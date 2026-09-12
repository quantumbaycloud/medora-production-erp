import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";

export default function ProtectedRoute() {
  const location = useLocation();
  const [state, setState] = useState("checking");

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("accessToken");
    if (!token) { setState("unauthenticated"); return () => {}; }

    const api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || window.location.origin,
      timeout: 10000,
      headers: { Authorization: `Bearer ${token}` },
    });

    Promise.all([api.get("/auth/me"), api.get("/api/licensing/status")])
      .then(([me]) => {
        if (!active) return;
        if (me.data?.user) localStorage.setItem("user", JSON.stringify(me.data.user));
        setState("authenticated");
      })
      .catch((error) => {
        if (!active) return;
        if (error?.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setState("unauthenticated");
        } else if (error?.response?.status === 403) {
          setState("license");
        } else {
          setState("authenticated");
        }
      });

    return () => { active = false; };
  }, [location.pathname]);

  if (state === "checking") return <div className="min-h-screen flex items-center justify-center">Checking ERP access…</div>;
  if (state === "unauthenticated") return <Navigate to="/login" replace />;
  if (state === "license") return <Navigate to="/license" replace />;
  return <Outlet />;
}
