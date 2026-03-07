import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const AdminDashboard = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Trade Pulse</h2>
        <p className="text-gray-600 mb-6">Welcome to the secure admin area.</p>
        <div className="mb-6 space-y-4">
          <Link
            to="/admin/products"
            className="block text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Products
          </Link>
          <Link
            to="/admin/customers"
            className="block text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Customers
          </Link>
          <Link
            to="/admin/orders"
            className="block text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Orders
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
