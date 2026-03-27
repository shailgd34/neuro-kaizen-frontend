import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { JoinedClientList } from "../../api/clientApi";
import Card from "../ui/Card";
import Pagination from "../ui/Pagination";
import Select from "../ui/Select";
import Input from "../ui/Input";

type Client = {
  id: string;
  name: string;
  email: string;
  message?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  invite_sent?: boolean;
  questions?: {
    answer: string;
    position: number;
    question: string;
  }[];
};

type ClientsResponse = {
  status?: number;

  data?: Client[];
  bookings?: Client[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;

  message: string;
};

export default function ClientTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const { data, isLoading } = useQuery<ClientsResponse>({
    queryKey: ["clients", page, debouncedSearch, status],
    queryFn: () => JoinedClientList(page, debouncedSearch, status),

    placeholderData: (prev: ClientsResponse | undefined) => prev,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const clients = data?.data ?? [];

  const getTimeAgo = (date?: string | null) => {
    if (!date) return "—";

    const now = new Date().getTime();
    const past = new Date(date).getTime();

    if (isNaN(past)) return "—";

    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <div className="">
          <h5 className="text-3xl font-semibold text-white">
            Client Management
          </h5>
          <p className="text-gray-400 font-light mt-1.5">
            manage your clients and their information.
          </p>
        </div>
        <div className="flex justify-between gap-6">
          <Input
            type="search"
            placeholder="Search clients..."
            className="px-3 py-2 bg-cardBg border border-borderColor rounded"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <Select
            className="px-3 py-2 bg-cardBg border border-borderColor rounded min-w-40"
            placeholder="Select Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { label: "Invited", value: "sent" },
              { label: "Not Invited", value: "not_sent" },
            ]}
          />
        </div>
      </div>

      <Card className="p-0!">
        <div className="overflow-x-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-borderColor text-gray-400 bg-primary">
              <tr>
                <th className="text-left py-5 px-4">Client Name</th>
                <th className="text-center">Status</th>
                <th className="text-center">Baseline</th>
                <th className="text-center">Calibration</th>
                <th className="text-center">Drift Status</th>
                <th className="text-center">Last Activity</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Loading clients...
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No clients found
                  </td>
                </tr>
              ) : (
                clients.map((client: any) => {
                  const baseline = client.is_baseline_completed
                    ? "Completed"
                    : "Not Started";

                  const calibration = `${client.calibration_count || 0} / 6`;

                  const statusColor =
                    client.status === "active"
                      ? "text-emerald-400"
                      : client.status === "invited"
                        ? "text-yellow-400"
                        : "text-gray-400";

                  // drift mapping (your API currently null → handle gracefully)
                  const getDrift = () => {
                    if (!client.drift_status)
                      return { label: "Pending", color: "text-gray-400" };

                    // later when API improves, replace this logic
                    return { label: "Normal", color: "text-emerald-400" };
                  };

                  const drift = getDrift();

                  return (
                    <tr
                      key={client.id}
                      className="
border-b border-dashed border-gray-700 

text-gray-300 
hover:bg-white/4 
hover:scale-[1.01] 
transition-all duration-200
"
                    >
                      {/* Client */}
                      <td className="py-4 flex items-center gap-3 px-4">
                        <div className="w-9 h-9 flex items-center justify-center bg-gray-700 text-xs rounded uppercase">
                          {client.name?.charAt(0)}
                        </div>

                        <span className="text-white capitalize">
                          {client.name}
                        </span>
                      </td>

                      {/* Status */}
                      <td className={`text-center capitalize ${statusColor}`}>
                        {client.status}
                      </td>

                      {/* Baseline */}
                      <td className="text-center">{baseline}</td>

                      {/* Calibration */}
                      <td className="text-center">{calibration}</td>

                      {/* Drift */}
                      <td className={`text-center ${drift.color}`}>
                        {drift.label}
                      </td>

                      {/* Last Activity */}
                      <td className="text-center">
                        {client.last_activity_date
                          ? getTimeAgo(client.last_activity_date)
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="text-center">
                        <button className="px-3 py-1 rounded-md border border-white/10 text-xs text-gray-300 hover:bg-white/5 hover:border-white/20 transition">
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <Pagination
          page={page}
          total={data?.total || 0}
          limit={data?.limit || 10}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Card>
    </div>
  );
}
