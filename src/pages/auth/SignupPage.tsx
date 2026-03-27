import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import success from "../../lottie/success.json";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import StatusDialog from "../../components/ui/StatusDialog";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";
import { getClientByToken, signupClient } from "../../api/clientApi";

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
};

export default function SignupPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch("password");


  const { data: clientData, isLoading: isFetchingClient } = useQuery({
    queryKey: ["client-by-token", inviteToken],
    queryFn: () => getClientByToken(inviteToken),
    enabled: !!inviteToken,
    retry: false,
  });

  
  useEffect(() => {
    if (clientData) {
      const client = clientData?.data ?? clientData;
      if (client?.name) setValue("name", client.name);
      if (client?.email) setValue("email", client.email);
    }
  }, [clientData, setValue]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      const clientId = clientData?.data?.id ?? clientData?.id;
      if (!clientId) throw new Error("Client ID not found");
      return signupClient({
        id: clientId,
        name: data.name,
        password: data.password,
        confirmPassword: data.confirmPassword,
        
      });
    },
    onSuccess: (res: any) => {
  const client = res?.data?.client;

  if (!client) {
    toast.error("Invalid server response");
    return;
  }

  const { token, role, name, email, id } = client;

  // Save in sessionStorage
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("role", role);
  sessionStorage.setItem("name", name);
  sessionStorage.setItem("email", email);
  sessionStorage.setItem("clientId", id);

  
  dispatch(
    login({
      token,
      role,
      name,
      email,
    })
  );

  setOpenDialog(true);

  setTimeout(() => {
    navigate("/dashboard", { replace: true });
  }, 3000);
},
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create account. Please try again."
      );
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!inviteToken) {
      toast.error("Invalid or missing invite token.");
      return;
    }
    mutation.mutate(data);
  };

  return (
    <>
      <Card className="w-120 p-10">
        <h5 className="text-xl mb-2 font-semibold">Create Secure Account</h5>

        <p className="mb-6 font-light opacity-65">
          Complete your account setup to access the Neuro Kaizen Performance
          Portal.
        </p>

        {isFetchingClient ? (
          <p className="text-center text-sm opacity-60 mb-4">Loading your details...</p>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            readOnly
            {...register("name", { required: "Full name is required" })}
            error={errors.name?.message}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="executive@company.com"
            readOnly
            {...register("email", { required: "Email is required" })}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message:
                  "Minimum 8 characters. Include uppercase, lowercase, and numeric characters.",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message:
                  "Minimum 12 characters. Include uppercase, lowercase, and numeric characters.",
              },
            })}
            error={errors.password?.message}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            {...register("confirmPassword", {
              required: "Confirm password is required",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
          />

          <Button
            className="w-full"
            type="submit"
            disabled={mutation.isPending || isFetchingClient}
          >
            {mutation.isPending ? "Creating Account..." : "Create Secure Account"}
          </Button>

          <p className="text-center text-sm opacity-60 mt-2">
            Account access is restricted to authorized clients.
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
        title="Account Created Successfully"
        description="Your account has been created successfully. It will auto redirect to dashboard."
        buttonText="Redirecting to dashboard..."
      />
    </>
  );
}
