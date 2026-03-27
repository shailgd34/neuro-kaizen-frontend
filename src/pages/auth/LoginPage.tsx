import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginRequest, type LoginPayload } from "../../api/auth";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "../../store/authSlice";

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginPayload>();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (user) => {
      sessionStorage.setItem("token", user.token);
      sessionStorage.setItem("role", user.role);
      sessionStorage.setItem("name", user.name);
      sessionStorage.setItem("email", user.email);

      dispatch(
        login({
          token: user.token,
          role: user.role,
          name: user.name,
          email: user.email,
        }),
      );

      toast.success("Success! Redirecting to Dashboard");
      navigate("/dashboard", { replace: true });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Invalid email or password",
      );
    },
  });

  const onSubmit = (data: LoginPayload) => {
    mutation.mutate(data);
  };

  return (
    <Card className="w-120 p-10">
      <h5 className="text-xl mb-2 text-textPrimary font-semibold">
        Secure Portal Access
      </h5>

      <p className="mb-6 font-light opacity-65">
        Enter your credentials to access your performance dashboard.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@email.com"
          {...register("email", { required: true })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter password"
          {...register("password", { required: true })}
        />

        <div className="flex justify-between text-sm mb-6 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 border border-white bg-transparent "
              {...register("remember")}
            />
            Remember device
          </label>

          <Link
            to="/forgot-password"
            className="text-red-500 relative before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[1px] before:w-0 before:bg-red-500 before:transition-all before:duration-300 before:ease-in-out hover:before:w-full"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full">
          {mutation.isPending ? "Signing In..." : "Sign In"}
        </Button>

        <p className="text-center mt-2 text-sm opacity-70">
          Sessions are encrypted and monitored.
        </p>
      </form>
    </Card>
  );
}
