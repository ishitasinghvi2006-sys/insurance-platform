import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-3 flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <span className="font-bold text-blue-600">Insurance Platform</span>

        {user.role === "admin" && (
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">
            Dashboard
          </Link>
        )}

        {(user.role === "admin" || user.role === "agent") && (
          <>
            <Link to="/customers" className="text-sm text-gray-600 hover:text-blue-600">
              Customers
            </Link>
            <Link to="/policies" className="text-sm text-gray-600 hover:text-blue-600">
              Policies
            </Link>
            <Link to="/claims" className="text-sm text-gray-600 hover:text-blue-600">
              Claims
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {user.name} <span className="text-gray-400">({user.role})</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}