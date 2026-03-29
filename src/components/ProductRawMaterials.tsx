import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Product {
  id: string;
  name: string;
}

interface RawMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

const ProductRawMaterials = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [formData, setFormData] = useState<Omit<RawMaterial, "id">>({
    name: "",
    quantity: 0,
    unit: "kg",
    cost: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        // Fetch raw materials
        const rmRes = await axios.get(
          `http://localhost:3000/products/${productId}/raw-materials`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRawMaterials(rmRes.data);

        // Fetch product details just to get the name (if backend doesn't support get single product, we can either fetch all and find, or just leave it generic. Let's fetch all and find since API might not have GET /products/:id).
        const prodRes = await axios.get("http://localhost:3000/products", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentProduct = prodRes.data.find((p: any) => p.id === productId);
        if (currentProduct) {
          setProduct(currentProduct);
        } else {
          // If not found, maybe redirect
          navigate("/admin/products");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [productId, token, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "cost" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:3000/raw-materials/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingId(null);
      } else {
        await axios.post(
          `http://localhost:3000/products/${productId}/raw-materials`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setFormData({ name: "", quantity: 0, unit: "kg", cost: 0 }); // Reset form
      // Refresh list
      const rmRes = await axios.get(
        `http://localhost:3000/products/${productId}/raw-materials`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRawMaterials(rmRes.data);
    } catch (error) {
      console.error("Failed to save raw material:", error);
      alert("Failed to save raw material.");
    }
  };

  const handleEdit = (rm: RawMaterial) => {
    setFormData({
      name: rm.name,
      quantity: rm.quantity,
      unit: rm.unit,
      cost: rm.cost,
    });
    setEditingId(rm.id);
  };

  const handleDelete = async (rmId: string) => {
    if (window.confirm("Are you sure you want to delete this raw material?")) {
      try {
        await axios.delete(`http://localhost:3000/raw-materials/${rmId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRawMaterials(rawMaterials.filter(rm => rm.id !== rmId));
      } catch (error) {
        console.error("Failed to delete raw material:", error);
      }
    }
  };

  if (!product) {
    return <div className="p-8 text-center text-gray-500">Loading product data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Raw Materials for: <span className="text-indigo-600">{product.name}</span>
          </h2>
          <Link
            to="/admin/products"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            &larr; Back to Products
          </Link>
        </div>

        {/* Raw Material Form */}
        <div className="bg-gray-50 p-6 rounded-md shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? "Edit Raw Material" : "Add New Raw Material"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Material Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="e.g. Sugar, Cocoa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity Required</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                min="0"
                step="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="kg">kilograms (kg)</option>
                <option value="g">grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="ml">milliliters (ml)</option>
                <option value="pcs">pieces (pcs)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cost (Estimated)</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div className="lg:col-span-4 flex justify-end mt-4">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", quantity: 0, unit: "kg", cost: 0 });
                  }}
                  className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                {editingId ? "Update Material" : "Add Material"}
              </button>
            </div>
          </form>
        </div>

        {/* Materials Table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rawMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No raw materials mapped to this product.
                        </td>
                      </tr>
                    ) : (
                      rawMaterials.map((rm) => (
                        <tr key={rm.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rm.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rm.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rm.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{Number(rm.cost).toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <button onClick={() => handleEdit(rm)} className="text-indigo-600 hover:text-indigo-900 font-semibold">Edit</button>
                            <button onClick={() => handleDelete(rm.id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
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

export default ProductRawMaterials;
