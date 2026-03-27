import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import StatusDialog from "../../components/ui/StatusDialog";
import Lottie from "lottie-react";
import email from "../../lottie/email.json";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordRequest, resendResetLinkRequest } from "../../api/auth";
import { toast } from "react-toastify";

type FormValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>();


  const RESEND_TIME = 300; // 5 minutes

const [timeLeft, setTimeLeft] = useState(RESEND_TIME);

  const mutation = useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: () => {
      setOpenDialog(true);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendResetLinkRequest,
    onSuccess: () => {
      toast.success("A new reset link has been sent to your email.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to resend link");
    },
  });

  const back = () => {
    navigate("/login");
  };

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
    console.log(data, "aaasdasddasasdasdasdasdas");
  };

  useEffect(() => {
  if (!openDialog) return;

  setTimeLeft(RESEND_TIME);

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [openDialog]);

  const minutes = Math.floor(timeLeft / 60);
const seconds = timeLeft % 60;

const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const ResendAPI = () => {
    const email = getValues("email");

    if (!email) {
      toast.error("Email is required to resend link");
      return;
    }

    resendMutation.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success("A new reset link has been sent.");
          setTimeLeft(RESEND_TIME);
        },
      },
    );
  };

  return (
    <>
      <Card className="w-120 p-10">
        <p
          className="flex gap-2 pb-4 text-sm text-gray-400 items-center cursor-pointer"
          onClick={back}
        >
          <ArrowLeft width={14} /> Back To Login
        </p>
        <h5 className="text-xl mb-2 font-semibold"> Reset Password</h5>

        <p className="mb-6 font-light opacity-65">
          Enter your account email to receive secure reset instructions.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            
            placeholder="executive@company.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Enter a valid email",
              },
            })}
            error={errors.email?.message}
          />

          <div className="mt-4">
            <Button type="submit" className="w-full mt-1">
            {mutation.isPending ? "Sending..." : "Send Reset Link"}
          </Button>
          </div>

          <p className="text-center text-sm opacity-60 mt-2">
            If an account exists, instructions will be sent to the registered
            email address.
          </p>
        </form>
      </Card>

      <StatusDialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  icon={
    <div className="w-24 h-24">
      <Lottie animationData={email} loop={false} />
    </div>
  }
  title="Check Your Email"
  description="We've sent a password reset link to your email address. Please check your inbox and follow the instructions to create a new password."
  buttonText={timeLeft === 0 ? "Resend Link" : undefined}
  onAction={ResendAPI}
>
  {timeLeft > 0 && (
    <p className="text-sm text-gray-400 mt-3">
      You can request a new link in <span className="font-semibold">{formattedTime}</span>
    </p>
  )}

  <p className="text-xs opacity-60 mt-2">
    Reset links expire after 5 minutes.
  </p>
</StatusDialog>
    </>
  );
}
