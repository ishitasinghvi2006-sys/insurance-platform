import { useEffect, useState } from "react";
import api from "../api/axios";

export default function DocumentUpload({ customerId }) {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [customerId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers/${customerId}/documents`);
      setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/customers/${customerId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await api.get(`/documents/${doc.id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download file");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document?")) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Documents</h2>

      <form onSubmit={handleUpload} className="flex gap-2 mb-3 items-center">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm flex-1"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : documents.length === 0 ? (
        <p className="text-gray-500">No documents uploaded yet.</p>
      ) : (
        <ul className="bg-white rounded shadow divide-y">
          {documents.map((doc) => (
            <li key={doc.id} className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{doc.fileName}</p>
                <p className="text-xs text-gray-400">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => handleDownload(doc)} className="text-blue-600 hover:underline">
                  Download
                </button>
                <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}