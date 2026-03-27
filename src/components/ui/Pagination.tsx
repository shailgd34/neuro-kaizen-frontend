interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex justify-between mt-6 text-sm text-gray-400 px-6 pb-4">
      <span>
        Showing {(page - 1) * limit + 1}–
        {Math.min(page * limit, total)} of {total} clients
      </span>

      <div className="flex gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 border border-borderColor rounded disabled:opacity-40"
        >
          Previous
        </button>

        <span className="px-3 py-1 border border-borderColor rounded bg-cardBg">
          {page}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 border border-borderColor rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}