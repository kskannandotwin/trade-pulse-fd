import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Customer {
  id: string;
  customerName: string;
  location: string;
}

interface Product {
  id: string;
  name: string;
}

interface Order {
  id: string;
  customerName: string;
  location: string;
  productName: string;
  quantity: number;
}

type OrderFormData = Omit<Order, "id">;

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    location: "",
    productName: "",
    quantity: 1,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:3000/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
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
      fetchOrders();
      fetchCustomers();
      fetchProducts();
    }
  }, [token]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerName = e.target.value;
    const customer = customers.find((c) => c.customerName === customerName);
    setFormData((prev) => ({
      ...prev,
      customerName,
      location: customer ? customer.location : "",
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/orders/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditingId(null);
      } else {
        await axios.post("http://localhost:3000/orders", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormData({
        customerName: "",
        location: "",
        productName: "",
        quantity: 1,
      });
      fetchOrders();
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save order. Check console for details.");
    }
  };

  const handleEdit = (order: Order) => {
    setFormData({
      customerName: order.customerName,
      location: order.location,
      productName: order.productName,
      quantity: order.quantity,
    });
    setEditingId(order.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`http://localhost:3000/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchOrders();
      } catch (error) {
        console.error("Failed to delete order:", error);
        alert("Failed to delete order. Check console for details.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h2>
          <Link
            to="/admin/dashboard"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Order Form */}
        <div className="bg-gray-50 p-6 rounded-md shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? "Edit Order" : "Add New Order"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700"
              >
                Customer Name
              </label>
              <select
                name="customerName"
                id="customerName"
                value={formData.customerName}
                onChange={handleCustomerChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.customerName}>
                    {c.customerName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Auto-populated"
              />
            </div>
            <div>
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name
              </label>
              <select
                name="productName"
                id="productName"
                value={formData.productName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="">-- Select Product --</option>
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
            <div className="lg:col-span-4 flex justify-end mt-4">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      customerName: "",
                      location: "",
                      productName: "",
                      quantity: 1,
                    });
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
                {editingId ? "Update Order" : "Add Order"}
              </button>
            </div>
          </form>
        </div>

        {/* Orders Table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Customer Name",
                        "Location",
                        "Product Name",
                        "Quantity",
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
                    {orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                        >
                          No orders found. Add one above!
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <button
                              onClick={() => handleEdit(order)}
                              className="text-indigo-600 hover:text-indigo-900 font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
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

export default Orders;
