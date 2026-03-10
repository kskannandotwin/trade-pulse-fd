import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Sale {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  saleDate: string;
}

type SaleFormData = Omit<Sale, "id" | "totalAmount" | "saleDate">;

const Sales = () => {
  const { token } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<SaleFormData>({
    productName: "",
    quantity: 1,
    unitPrice: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "unitPrice" ? Number(value) : value,
    }));
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get("http://localhost:3000/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(response.data);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSales();
      fetchProducts();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/sales/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingId(null);
      } else {
        await axios.post("http://localhost:3000/sales", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormData({ productName: "", quantity: 1, unitPrice: 0 });
      fetchSales();
    } catch (error) {
      console.error("Failed to save sale:", error);
      alert("Failed to save sale. Check console for details.");
    }
  };

  const handleEdit = (sale: Sale) => {
    setFormData({
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
    });
    setEditingId(sale.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await axios.delete(`http://localhost:3000/sales/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchSales();
      } catch (error) {
        console.error("Failed to delete sale:", error);
        alert("Failed to delete sale. Check console for details.");
      }
    }
  };

  const computedTotal = (formData.quantity * formData.unitPrice).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Sales Management</h2>
          <Link
            to="/admin/dashboard"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Sale Form */}
        <div className="bg-gray-50 p-6 rounded-md shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? "Edit Sale" : "Add New Sale"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label
                htmlFor="productId"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name
              </label>
              <select
                name="productName"
                id="productName"
                value={formData.productName}
                onChange={handleInputChange as any}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="">-- Select a Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label
                htmlFor="unitPrice"
                className="block text-sm font-medium text-gray-700"
              >
                Unit Price (₹)
              </label>
              <input
                type="number"
                name="unitPrice"
                id="unitPrice"
                value={formData.unitPrice}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Amount
              </label>
              <div className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 p-2 text-sm text-gray-700">
                ₹{computedTotal}
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-end mt-4">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ productName: "", quantity: 1, unitPrice: 0 });
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
                {editingId ? "Update Sale" : "Add Sale"}
              </button>
            </div>
          </form>
        </div>

        {/* Sales Table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Product Name",
                        "Quantity",
                        "Unit Price",
                        "Total Amount",
                        "Sale Date",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                        >
                          No sales found. Add one above!
                        </td>
                      </tr>
                    ) : (
                      sales.map((sale) => (
                        <tr key={sale.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {products.find((p) => p.name === sale.productName)
                              ?.name ?? sale.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {sale.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{Number(sale.unitPrice).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                            ₹{Number(sale.totalAmount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(sale.saleDate).toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <button
                              onClick={() => handleEdit(sale)}
                              className="text-indigo-600 hover:text-indigo-900 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(sale.id)}
                              className="text-red-600 hover:text-red-900 font-semibold"
                            >
                              Delete
                            </button>
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

export default Sales;
