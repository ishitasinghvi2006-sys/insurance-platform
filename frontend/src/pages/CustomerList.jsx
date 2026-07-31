import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers", { params: { search, limit: 20 } });
      setCustomers(res.data.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-full"
      />

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : customers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <ul className="bg-white rounded shadow divide-y">
          {customers.map((c) => (
            <li key={c.id} className="p-3 flex justify-between items-center">
              <div>
                <Link to={`/customers/${c.id}`} className="font-medium text-blue-600 hover:underline">
                  {c.name}
                </Link>
                <p className="text-sm text-gray-500">{c.email}</p>
              </div>
              <span className="text-sm text-gray-400">{c.phone}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}