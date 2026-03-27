import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getClients, sendInvite } from "../../api/clientApi";
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

export default function InviteManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ClientsResponse>({
    queryKey: ["clients", page, debouncedSearch, status],
    queryFn: () => getClients(page, debouncedSearch, status),

    placeholderData: (prev: ClientsResponse | undefined) => prev,
  });

  const { mutate: inviteClient } = useMutation({
    mutationFn: (clientId: string) => sendInvite(clientId),

    onMutate: (clientId) => {
      setLoadingIds((prev) => new Set(prev).add(clientId));
    },

    onSuccess: (_, clientId) => {
      toast.success("Invite sent successfully!");

      queryClient.setQueryData(
        ["clients", page, debouncedSearch, status],
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            bookings: oldData.bookings.map((client: any) =>
              client.id === clientId
                ? { ...client, invite_sent: true }
                : client,
            ),
          };
        },
      );
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to send invite. Please try again.",
      );
    },

    onSettled: (_, __, clientId) => {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(clientId);
        return next;
      });

      queryClient.invalidateQueries({
        queryKey: ["clients", page, debouncedSearch, status],
      });
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const clients = data?.bookings ?? [];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h5 className="text-3xl font-semibold text-white">Invitation Management</h5>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-borderColor text-gray-400 bg-primary py-2 px-3">
              <tr>
                <th className="text-left py-5 px-4">Client Information</th>

                <th className="text-center">Email</th>
                <th className="text-center">Message</th>
                <th className="text-center">Joined Date</th>
                <th className="text-center">Invite Status</th>
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
                clients.map((client: Client) => (
                  <tr
                    key={client.id}
                    className="border-b border-dashed border-gray-700 text-gray-300 hover:bg-white/5 px-4"
                  >
                    <td className="py-4 flex items-center gap-3 px-4">
                      <div className="w-9 h-9 flex items-center justify-center bg-gray-700 text-xs rounded uppercase">
                        {client.name?.charAt(0) || "U"}
                      </div>

                      <div>
                        <p className="font-medium text-gray-100 capitalize">
                          {client.name}
                        </p>
                        {/* <p className="text-xs text-gray-400">{client.email}</p> */}
                      </div>
                    </td>

                    <td className="text-center">
                      <span className="">{client.email}</span>
                    </td>

                    <td className="text-center">
                      <span className="truncate max-w-37.5 inline-block">
                        {client.message || client.questions?.[0]?.answer || "—"}
                      </span>
                    </td>

                    <td className="text-center">
                      {client.created_at ? (
                        <div className="flex flex-col items-center">
                          <span>
                            {new Date(client.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>

                          <span className="text-xs text-gray-400 mt-1">
                            {new Date(client.created_at).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="text-center">
                      {client.invite_sent === true ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] capitalize bg-green-500/10 text-green-400 border border-green-500/20">
                          Sent
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] capitalize bg-red-500/10 text-red-400 border border-red-500/20">
                          Not Sent
                        </span>
                      )}
                    </td>

                    <td className="text-center">
                      {client.invite_sent === true ? (
                        <button className="text-blue-400 text-[12px] px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded">
                          View Details
                        </button>
                      ) : (
                        <button
                          disabled={loadingIds.has(client.id)}
                          onClick={() => inviteClient(client.id)}
                          className="text-secondary text-[12px] px-2 py-1 bg-secondary/10 border border-amber-600/30 rounded disabled:opacity-50"
                        >
                          {loadingIds.has(client.id)
                            ? "Sending..."
                            : "Send Invite"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
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
