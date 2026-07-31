import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import PaymentHistory from "../components/PaymentHistory";

const statusColors = {
  active: "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

const claimStatusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function PolicyDetails() {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicy();
    fetchClaims();
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

  const fetchClaims = async () => {
    try {
      const res = await api.get(`/policies/${id}/claims`);
      setClaims(res.data.claims);
    } catch (err) {
      console.error(err);
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

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Claims</h2>
        {policy.status === "active" && (
          <Link to={`/policies/${id}/claims/new`} className="text-blue-600 hover:underline text-sm">
            + File a Claim
          </Link>
        )}
      </div>
      {claims.length ? (
        <ul className="bg-white rounded shadow divide-y mb-6">
          {claims.map((c) => (
            <li key={c.id} className="p-3 flex justify-between items-center">
              <Link to={`/claims/${c.id}`} className="text-blue-600 hover:underline">
                {c.reason}
              </Link>
              <span className={`px-2 py-1 rounded text-xs font-medium ${claimStatusColors[c.status]}`}>
                {c.status}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mb-6">No claims yet.</p>
      )}

      <PaymentHistory policyId={policy.id} />
    </div>
  );
}