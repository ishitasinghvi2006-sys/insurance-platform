import { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../api/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [policiesSummary, setPoliciesSummary] = useState(null);
  const [claimsStats, setClaimsStats] = useState(null);
  const [premiumCollection, setPremiumCollection] = useState(null);
  const [totalCustomers, setTotalCustomers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [policiesRes, claimsRes, premiumRes, customersRes] = await Promise.all([
        api.get("/reports/policies-summary"),
        api.get("/reports/claims-stats"),
        api.get("/reports/premium-collection"),
        api.get("/reports/customer-growth"),
      ]);
      setPoliciesSummary(policiesRes.data.summary);
      setClaimsStats(claimsRes.data.stats);
      setPremiumCollection(premiumRes.data);
      setTotalCustomers(customersRes.data.totalCustomers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-8 text-gray-500">Loading dashboard...</p>;

  const policiesChartData = {
    labels: ["Active", "Expired", "Cancelled"],
    datasets: [
      {
        label: "Policies",
        data: [policiesSummary.active, policiesSummary.expired, policiesSummary.cancelled],
        backgroundColor: ["#22c55e", "#9ca3af", "#ef4444"],
      },
    ],
  };

  const claimsChartData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        data: [claimsStats.pending, claimsStats.approved, claimsStats.rejected],
        backgroundColor: ["#eab308", "#22c55e", "#ef4444"],
      },
    ],
  };

  const premiumChartData = {
    labels: premiumCollection.labels.length ? premiumCollection.labels : ["No data yet"],
    datasets: [
      {
        label: "Premium Collected (₹)",
        data: premiumCollection.data.length ? premiumCollection.data : [0],
        borderColor: "#2563eb",
        backgroundColor: "#93c5fd",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reports Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded shadow p-4 text-center">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-3xl font-bold">{totalCustomers}</p>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <p className="text-sm text-gray-500">Active Policies</p>
          <p className="text-3xl font-bold text-green-600">{policiesSummary.active}</p>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <p className="text-sm text-gray-500">Pending Claims</p>
          <p className="text-3xl font-bold text-yellow-600">{claimsStats.pending}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Policies Overview</h2>
          <Bar data={policiesChartData} />
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Claims Breakdown</h2>
          <Pie data={claimsChartData} />
        </div>

        <div className="bg-white rounded shadow p-4 md:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Premium Collection Over Time</h2>
          <Line data={premiumChartData} />
        </div>
      </div>
    </div>
  );
}