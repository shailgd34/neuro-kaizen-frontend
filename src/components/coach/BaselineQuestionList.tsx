import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getQuestions, deleteQuestion } from "../../api/baselineApi";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Pencil, Trash } from "lucide-react";
import DomainBadge from "../ui/DomainBadge";
import { DOMAIN_OPTIONS } from "../../constants/domains";
import { toast } from "react-toastify";
import StatusDialog from "../ui/StatusDialog";

interface Props {
  onEdit: (question: any) => void;
}

export default function BaselineQuestionList({ onEdit }: Props) {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);

  const [domain, setDomain] = useState("");
  const [week] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["questions", page, debouncedSearch, domain, week],
    queryFn: () =>
      getQuestions({
        page,
        search: debouncedSearch,
        domain,
        week,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      toast.success("Question deleted successfully");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: () => {
      toast.error("Failed to delete question");
    },
  });

  const questions = data?.data || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // wait 500ms after typing stops

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
      <Card className="flex-2">
        <h6 className="text-xl text-white mb-6">Question Management</h6>

        {/* FILTER BAR */}

        <div className="flex justify-between items-start gap-4 mb-0">
          <div className="flex-1">
            <Input
            type="search"
              placeholder="Search question..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              
            />
          </div>
          <div className="flex flex-1 gap-2 justify-end">
            <Select
              options={DOMAIN_OPTIONS}
              placeholder="Select Domain"
              value={domain}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setDomain(e.target.value)
              }
            />

            {/* <Select
              options={DIAGNOSIS_TYPES}
              placeholder="Select Diagnosis"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
            /> */}
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left">
            <thead className="text-gray-400 text-sm border-b border-borderColor py-4 bg-primary mt-3">
              <tr>
                <th className="text-left py-3 px-3">Question with no.</th>
                <th className="text-center py-3">Domain</th>
                <th className="text-center py-3">Subscale</th>

                <th className="text-right py-3 px-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Loading questions...
                  </td>
                </tr>
              ) : (
                questions.map((q: any) => (
                  <tr
                    key={q.id}
                    className="border-b border-borderColor text-sm border-dashed py-4"
                  >
                    <td className="max-w-md py-2 px-3 flex items-start gap-2">
                      <div>
                        {q.question_no}.</div> <div>
                          {q.text}
                        </div>
                    </td>

                    <td className="text-center">
                      <DomainBadge domain={q.domain} />
                    </td>

                    <td className="text-center">
                      {q.subscale || "-"}
                    </td>

                    <td className="text-right space-x-2 py-2">
                      {" "}
                      <button
                        onClick={() => onEdit(q)}
                        className="px-2 py-1 rounded bg-green-500/10 text-green-400"
                      >
                        {" "}
                        <Pencil size={16} />{" "}
                      </button>{" "}
                      <button
                        onClick={() => setDeleteId(q.id)}
                        className="px-2 py-1 rounded bg-red-500/10 text-red-400"
                      >
                        {" "}
                        <Trash width={16} />{" "}
                      </button>{" "}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="flex justify-between items-center mt-6 text-sm">
          <button
            disabled={data?.previousDisabled}
            onClick={() => setPage(data.previousPage)}
            className="px-3 py-1 border border-borderColor rounded"
          >
            Previous
          </button>

          <span className="text-gray-400">
            Page {data?.page} of {data?.totalPages}
          </span>

          <button
            disabled={data?.nextDisabled}
            onClick={() => setPage(data.nextPage)}
            className="px-3 py-1 border border-borderColor rounded"
          >
            Next
          </button>
        </div>
      </Card>

      <StatusDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        icon={
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Trash size={24} />
          </div>
        }
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        buttonText="Delete"
        onAction={() => deleteMutation.mutate(deleteId!)}
        disabled={deleteMutation.isPending}
      />
    </>
  );
}
