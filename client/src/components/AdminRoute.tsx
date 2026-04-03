import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";


const AdminRoute = () => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth?.token || !auth?.isAdmin()) {
    return <Navigate to="/login" state={{from: location}}  replace />
  }

  return <Outlet />
}

export default AdminRoute;