import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Seller {
  id: string;
  name: string;
  contactInfo: string;
  parentSeller?: Seller | null;
  subSellers?: Seller[];
}

const Sellers = () => {
  const { token } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [formData, setFormData] = useState<{ name: string; contactInfo: string; parentSellerId: string }>({
    name: "",
    contactInfo: "",
    parentSellerId: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchSellers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/sellers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSellers(response.data);
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
    }
  };

  useEffect(() => {
    if (token) fetchSellers();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Seller> = {
        name: formData.name,
        contactInfo: formData.contactInfo,
        parentSeller: formData.parentSellerId ? { id: formData.parentSellerId } as Seller : null as any,
      };

      if (editingId) {
        if (formData.parentSellerId === editingId) {
          alert("A seller cannot be its own parent.");
          return;
        }
        await axios.put(`http://localhost:3000/sellers/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingId(null);
      } else {
        await axios.post("http://localhost:3000/sellers", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormData({ name: "", contactInfo: "", parentSellerId: "" });
      fetchSellers();
    } catch (error: any) {
      console.error("Failed to save seller:", error);
      alert(error.response?.data?.message || "Failed to save seller. Check console for details.");
    }
  };

  const handleEdit = (seller: Seller) => {
    setFormData({
      name: seller.name,
      contactInfo: seller.contactInfo || "",
      parentSellerId: seller.parentSeller?.id || "",
    });
    setEditingId(seller.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this seller?")) {
      try {
        await axios.delete(`http://localhost:3000/sellers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchSellers();
      } catch (error) {
        console.error("Failed to delete seller:", error);
        alert("Failed to delete seller. Check console for details.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Sellers & Vendors Management</h2>
          <Link to="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
            Back to Dashboard
          </Link>
        </div>

        {/* Form */}
        <div className="bg-gray-50 p-6 rounded-md shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? "Edit Seller" : "Add New Seller"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Seller Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Vendor Name"
              />
            </div>
            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">Contact Info</label>
              <input
                type="text"
                name="contactInfo"
                id="contactInfo"
                value={formData.contactInfo}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Email, Phone, Address"
              />
            </div>
            <div>
              <label htmlFor="parentSellerId" className="block text-sm font-medium text-gray-700">Parent Seller (Optional)</label>
              <select
                name="parentSellerId"
                id="parentSellerId"
                value={formData.parentSellerId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="">None (Main Seller)</option>
                {sellers
                  .filter(s => s.id !== editingId) // Prevent selecting self as parent
                  .map(seller => (
                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                  ))}
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end mt-4">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", contactInfo: "", parentSellerId: "" });
                  }}
                  className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingId ? "Update Seller" : "Add Seller"}
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Seller</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sellers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          No sellers found. Add one above!
                        </td>
                      </tr>
                    ) : (
                      sellers.map((seller) => (
                        <tr key={seller.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{seller.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{seller.contactInfo || "-"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {seller.parentSeller ? seller.parentSeller.name : <span className="text-gray-400 italic">None</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <button onClick={() => handleEdit(seller)} className="text-indigo-600 hover:text-indigo-900 font-semibold">Edit</button>
                            <button onClick={() => handleDelete(seller.id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sellers;
