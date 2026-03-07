import { Link } from "react-router-dom";

const Customers = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <Link
            to="/admin/dashboard"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
        <p className="text-gray-600">Customers management area.</p>
      </div>
    </div>
  );
};

export default Customers;
