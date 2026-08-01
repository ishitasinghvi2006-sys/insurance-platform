import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers", { params: { search, page, limit: 10 } });
      setCustomers(res.data.customers);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name or email..."
        />
      </div>

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

      <Pagination page={page} pages={pagination.pages} onPageChange={setPage} />
    </div>
  );
}