export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex gap-2 mt-4 justify-center flex-wrap">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1 rounded border bg-white disabled:opacity-40"
      >
        Prev
      </button>

      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded ${
            page === i + 1 ? "bg-blue-600 text-white" : "bg-white border"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="px-3 py-1 rounded border bg-white disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}