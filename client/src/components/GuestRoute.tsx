import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Only for visitors without a session (login/register). Logged-in users are sent into the app.
const GuestRoute = () => {
  const auth = useAuth();

  if (auth?.loading) return null;

  if (auth?.isAuthenticated()) {
    return <Navigate to={auth.isAdmin() ? "/admin-dashboard" : "/homepage"} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
