import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const statusColors = {
  active: "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

export default function PolicyDetails() {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicy();
  }, [id]);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/policies/${id}`);
      setPolicy(res.data.policy);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this policy?")) return;
    await api.put(`/policies/${id}/cancel`);
    fetchPolicy();
  };

  if (loading) return <p className="p-8 text-gray-500">Loading...</p>;
  if (!policy) return <p className="p-8 text-gray-500">Policy not found.</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{policy.policyNumber}</h1>
          <p className="text-gray-500">{policy.policyType}</p>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[policy.status]}`}>
          {policy.status}
        </span>
      </div>

      <div className="bg-white rounded shadow p-6 grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Customer</p>
          <p className="font-medium">{policy.customer?.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Premium Amount</p>
          <p className="font-medium">₹{policy.premiumAmount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Start Date</p>
          <p className="font-medium">{new Date(policy.startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">End Date</p>
          <p className="font-medium">{new Date(policy.endDate).toLocaleDateString()}</p>
        </div>
      </div>

      {policy.status === "active" && (
        <button onClick={handleCancel} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mb-6">
          Cancel Policy
        </button>
      )}

      <h2 className="text-lg font-semibold mb-2">Claims</h2>
      {policy.claims?.length ? (
        <ul className="bg-white rounded shadow divide-y mb-6">
          {policy.claims.map((c) => (
            <li key={c.id} className="p-3 flex justify-between">
              <span>{c.reason}</span>
              <span className="text-sm text-gray-500">{c.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mb-6">No claims yet.</p>
      )}

      <h2 className="text-lg font-semibold mb-2">Payment History</h2>
      {policy.payments?.length ? (
        <ul className="bg-white rounded shadow divide-y">
          {policy.payments.map((p) => (
            <li key={p.id} className="p-3 flex justify-between">
              <span>₹{p.amount}</span>
              <span className="text-sm text-gray-500">{p.paymentStatus}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No payments recorded yet.</p>
      )}
    </div>
  );
}