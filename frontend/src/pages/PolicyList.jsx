import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const statusColors = {
  active: "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

export default function PolicyList() {
  const [policies, setPolicies] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, [search, status, page]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/policies", {
        params: { search, status, page, limit: 10 },
      });
      setPolicies(res.data.policies);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Policies</h1>
        <Link to="/policies/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + New Policy
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by policy number..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border rounded px-3 py-2 flex-1"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border rounded px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : policies.length === 0 ? (
        <p className="text-gray-500">No policies found.</p>
      ) : (
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th className="p-3">Policy Number</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Type</th>
              <th className="p-3">Premium</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <Link to={`/policies/${p.id}`} className="text-blue-600 hover:underline">
                    {p.policyNumber}
                  </Link>
                </td>
                <td className="p-3">{p.customer?.name}</td>
                <td className="p-3">{p.policyType}</td>
                <td className="p-3">₹{p.premiumAmount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[p.status]}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination.pages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white border"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}