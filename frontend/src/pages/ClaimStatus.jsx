import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ClaimStatus() {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/claims/${id}`)
      .then((res) => setClaim(res.data.claim))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-gray-500">Loading...</p>;
  if (!claim) return <p className="p-8 text-gray-500">Claim not found.</p>;

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Claim Status</h1>
      <div className="bg-white rounded shadow p-6 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Status</p>
          <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[claim.status]}`}>
            {claim.status}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Reason</p>
          <p className="font-medium">{claim.reason}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Claim Amount</p>
          <p className="font-medium">₹{claim.claimAmount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Policy Number</p>
          <p className="font-medium">{claim.policy?.policyNumber}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Submitted On</p>
          <p className="font-medium">{new Date(claim.submissionDate).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}