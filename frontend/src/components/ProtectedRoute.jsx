import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ user, loading, requiredRole, redirectTo = "/", children }) => {
  // Show nothing while loading user data
  if (loading) {
    return null; // or a loading spinner
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  // Support both wrapper usage (<ProtectedRoute>{...}</ProtectedRoute>) and route nesting with <Outlet />
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
