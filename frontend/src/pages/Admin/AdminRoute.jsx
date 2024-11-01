import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader";

const AdminRoute = () => {
  const { userInfo, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <Loader />; // Vous pouvez remplacer cela par un loader ou un spinner
  }

  return userInfo && userInfo.user.isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoute;
