import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import StatusDialog from "../../components/ui/StatusDialog";
import { resetPasswordRequest } from "../../api/auth";
import { useSearchParams, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import success from "../../lottie/success.json";
import { ArrowLeft } from "lucide-react";

type FormValues = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
const token = searchParams.get("token");
const error = searchParams.get("error");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch("password");

  const mutation = useMutation({
  mutationFn: async (data: FormValues) => {
    return resetPasswordRequest(token as string, {
      newPassword: data.password,
      confirmPassword: data.confirmPassword,
    });
  },
  onSuccess: () => {
    setOpenDialog(true);
  },
});

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const back = () => {
    navigate("/login");
  };
  useEffect(() => {
  if (!token) {
    navigate("/forgot-password");
  }
}, [token, navigate]);

  if (error === "invalid-token") {
  return (
    <Card className="w-120 p-10 text-center">
      <p
          className="flex gap-2 pb-4 text-sm text-gray-400 items-center cursor-pointer"
          onClick={back}
        >
          <ArrowLeft width={14} /> Back To Login
        </p>
      <h5 className="text-xl font-semibold mb-2">Invalid or Expired Link</h5>

      <p className="text-sm opacity-70 mb-6">
        This password reset link is no longer valid. Please request a new
        password reset email.
      </p>

      <Button onClick={() => navigate("/forgot-password")}>
        Request New Reset Link
      </Button>
    </Card>
  );
}

  return (
    <>

    
      <Card className="w-120 p-10">
        <p
          className="flex gap-2 pb-4 text-sm text-gray-400 items-center cursor-pointer"
          onClick={back}
        >
          <ArrowLeft width={14} /> Back To Login
        </p>
        <h5 className="text-xl mb-2 font-semibold">Create New Password</h5>

        <p className="mb-6 font-light opacity-65">
          Enter a new password to restore secure access to your account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Minimum 8 characters",
              },
            })}
            error={errors.password?.message}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Enter confirm password"
            {...register("confirmPassword", {
              required: "Confirm password is required",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
          />

          <Button className="w-full" type="submit">
            {mutation.isPending ? "Updating..." : "Update Password"}
          </Button>

          <p className="text-center text-sm opacity-60 mt-2">
            For security, this reset link may only be used once.
          </p>
        </form>
      </Card>

      <StatusDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        icon={
          <div className="w-24 h-24">
            <Lottie animationData={success} loop={false} />
          </div>
        }
        title="Password successfully updated"
        description="Your password has been successfully reset. Click below to login again."
        buttonText="Return to Login"
        onAction={() => {
          setOpenDialog(false);
          navigate("/login");
        }}
        
      />
    </>
  );
}
