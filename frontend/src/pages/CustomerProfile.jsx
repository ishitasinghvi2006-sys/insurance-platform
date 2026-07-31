import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import DocumentUpload from "../components/DocumentUpload";

export default function CustomerProfile() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/customers/${id}`)
      .then((res) => setCustomer(res.data.customer))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-gray-500">Loading...</p>;
  if (!customer) return <p className="p-8 text-gray-500">Customer not found.</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">{customer.name}</h1>
      <p className="text-gray-500 mb-6">{customer.email}</p>

      <div className="bg-white rounded shadow p-6 grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p className="font-medium">{customer.phone}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date of Birth</p>
          <p className="font-medium">{new Date(customer.dob).toLocaleDateString()}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-medium">{customer.address}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">Policies</h2>
      {customer.policies?.length ? (
        <ul className="bg-white rounded shadow divide-y mb-6">
          {customer.policies.map((p) => (
            <li key={p.id} className="p-3 flex justify-between">
              <Link to={`/policies/${p.id}`} className="text-blue-600 hover:underline">
                {p.policyNumber}
              </Link>
              <span className="text-sm text-gray-500">{p.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mb-6">No policies yet.</p>
      )}

      <DocumentUpload customerId={customer.id} />
    </div>
  );
}