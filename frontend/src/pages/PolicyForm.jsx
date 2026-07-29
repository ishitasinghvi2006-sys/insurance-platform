import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function PolicyForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerId: "",
    policyType: "",
    premiumAmount: "",
    startDate: "",
    termMonths: "12",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/policies", form);
      navigate(`/policies/${res.data.policy.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Policy</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Customer ID</label>
          <input
            type="number"
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Policy Type</label>
          <input
            type="text"
            name="policyType"
            placeholder="e.g. Health Insurance"
            value={form.policyType}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Premium Amount (₹)</label>
          <input
            type="number"
            name="premiumAmount"
            value={form.premiumAmount}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Term (months)</label>
          <input
            type="number"
            name="termMonths"
            value={form.termMonths}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Policy"}
        </button>
      </form>
    </div>
  );
}