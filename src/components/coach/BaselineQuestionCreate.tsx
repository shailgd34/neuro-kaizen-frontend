import { useForm, Controller } from "react-hook-form";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { insertQuestion, updateQuestion } from "../../api/baselineApi";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { DIAGNOSIS_TYPES, DOMAIN_OPTIONS } from "../../constants/domains";

interface FormValues {
  question_no: number;
  text: string;
  domain: string;
  week: number;
}

const emptyForm: FormValues = {
  question_no: 0,
  text: "",
  domain: "",
  week: undefined as any,
};

interface Props {
  editingQuestion?: any;
  clearEdit?: () => void;
}

export default function BaselineQuestionCreate({
  editingQuestion,
  clearEdit,
}: Props) {
  const { register, handleSubmit, reset, control } = useForm<FormValues>({
    defaultValues: emptyForm,
  });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: insertQuestion,
    onSuccess: () => {
      toast.success("Question added successfully");
      reset(emptyForm);
    },
    onError: () => {
      toast.error("Failed to add question");
    },
  });

  useEffect(() => {
    if (editingQuestion) {
      reset({
        text: editingQuestion.text,
        domain: editingQuestion.domain,
        week: editingQuestion.week,
        question_no: editingQuestion.question_no,
      });
    }
  }, [editingQuestion, reset]);

  const updateMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      toast.success("Question updated successfully");
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      reset(emptyForm);
      clearEdit?.();
    },
  });

  const onSubmit = (data: FormValues) => {
    const payload = {
      question_no: Number(data.question_no),
      text: data.text,
      domain: data.domain,
      week: Number(data.week),
    };

    if (editingQuestion) {
      updateMutation.mutate({
        id: editingQuestion.id,
        ...payload,
      });
    } else {
      mutation.mutate(payload);
    }
  };

  return (
    <Card className="flex-1">
      <h6 className="text-xl font-semibold text-white mb-6">
        {editingQuestion ? "Edit Baseline Question" : "Add Baseline Question"}
      </h6>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Question Text"
          showIcon={false}
          placeholder="Enter question text"
          {...register("text", { required: true })}
        />

        <Controller
          name="domain"
          control={control}
          render={({ field }) => (
            <Select
              label="Domain"
              placeholder="Select Domain"
              options={DOMAIN_OPTIONS}
              value={field.value || ""}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
  name="week"
  control={control}
  render={({ field }) => (
    <Select
      label="Diagnosis Type"
      placeholder="Select Diagnosis"
      options={DIAGNOSIS_TYPES}
      value={field.value !== undefined ? String(field.value) : ""}
      onChange={(e) => field.onChange(Number(e.target.value))}
    />
  )}
/>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={mutation.isPending || updateMutation.isPending}
            className="bg-white text-black px-6 py-2 rounded font-medium"
          >
            {editingQuestion
              ? updateMutation.isPending
                ? "Updating..."
                : "Update Question"
              : mutation.isPending
                ? "Saving..."
                : "Save Question"}
          </button>
          {editingQuestion && (
            <button
              type="button"
              onClick={() => {
                clearEdit?.();
                reset(emptyForm);
              }}
              className="text-sm text-gray-400 mt-2"
            >
              Cancel Editing
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
