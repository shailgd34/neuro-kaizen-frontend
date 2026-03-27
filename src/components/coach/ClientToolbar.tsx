import { Search, Plus } from "lucide-react";

export default function ClientToolbar() {
  return (
    <div className="flex items-center gap-3">

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type="text"
          placeholder="Search clients..."
          className="bg-cardBg border border-borderColor rounded-sm pl-9 pr-4 py-2 text-sm text-gray-300 focus:outline-none"
        />
      </div>

      <select
        className="bg-cardBg border border-borderColor rounded-sm px-3 py-2 text-sm text-gray-300"
      >
        <option>All Status</option>
        <option>Active</option>
        <option>Inactive</option>
        <option>Pending</option>
      </select>

      <button
        className="flex items-center gap-2 gold-grediant hover:bg-gold-grediant px-4 py-2 rounded-sm text-sm"
      >
        <Plus size={16} />
        Invite Client
      </button>

    </div>
  );
}