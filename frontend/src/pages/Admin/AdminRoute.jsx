import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
  const { userInfo, loading } = useSelector((state) => state.auth);

  // Si en cours de chargement, retourner null pour éviter un flash de redirection
  if (loading) {
    return null;
  }

  return userInfo && userInfo.isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoute;
