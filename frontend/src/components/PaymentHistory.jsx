import { useEffect, useState } from "react";
import api from "../api/axios";

const statusColors = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  overdue: "bg-red-100 text-red-700",
};

export default function PaymentHistory({ policyId }) {
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [policyId]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/policies/${policyId}/payments`);
      setPayments(res.data.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!amount) return;
    setSubmitting(true);
    try {
      await api.post(`/policies/${policyId}/payments`, { amount, paymentStatus: "paid" });
      setAmount("");
      fetchPayments();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Payment History</h2>

      <form onSubmit={handleAddPayment} className="flex gap-2 mb-3">
        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Recording..." : "Record Payment"}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-500">No payments recorded yet.</p>
      ) : (
        <ul className="bg-white rounded shadow divide-y">
          {payments.map((p) => (
            <li key={p.id} className="p-3 flex justify-between items-center">
              <div>
                <span className="font-medium">₹{p.amount}</span>
                <span className="text-sm text-gray-400 ml-2">
                  {new Date(p.paymentDate).toLocaleDateString()}
                </span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[p.paymentStatus]}`}>
                {p.paymentStatus}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}