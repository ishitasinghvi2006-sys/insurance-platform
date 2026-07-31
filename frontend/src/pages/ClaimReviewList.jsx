import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ClaimReviewList() {
  const [claims, setClaims] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, [status]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get("/claims", { params: { status } });
      setClaims(res.data.claims);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, newStatus) => {
    setActioningId(id);
    try {
      await api.put(`/claims/${id}/status`, { status: newStatus });
      fetchClaims();
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Claims Review</h1>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border rounded px-3 py-2 mb-4"
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : claims.length === 0 ? (
        <p className="text-gray-500">No claims found.</p>
      ) : (
        <ul className="space-y-3">
          {claims.map((c) => (
            <li key={c.id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{c.reason}</p>
                  <p className="text-sm text-gray-500">
                    Policy:{" "}
                    <Link to={`/policies/${c.policyId}`} className="text-blue-600 hover:underline">
                      {c.policy?.policyNumber}
                    </Link>{" "}
                    · Customer: {c.policy?.customer?.name}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[c.status]}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm mb-3">Claim Amount: ₹{c.claimAmount}</p>

              {c.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(c.id, "approved")}
                    disabled={actioningId === c.id}
                    className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(c.id, "rejected")}
                    disabled={actioningId === c.id}
                    className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}