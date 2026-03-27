import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

export default function InvitePage() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const mutation = useMutation({
    mutationFn: async () => {
      // simulate API validation
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      return true;
    },
    onSuccess: () => {
      navigate(`/signup?token=${token}`);
    },
  });

  return (
    <Card className="w-120 p-10 text-center">

      <img
        src="/public/assets/images/logo.png"
        alt="Neuro Kaizen"
        className="mx-auto mb-6 w-72"
      />

      <h5 className="text-xl mb-2 font-semibold">
        You've Been Invited
      </h5>

      <p className="mb-6 font-light opacity-65">
        You have been granted secure access to the Neuro Kaizen
        Performance Portal.
      </p>

      <Button
        className="w-full"
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending
          ? "Loading..."
          : "Continue Setup"}
      </Button>

      <p className="text-center text-sm opacity-60 mt-6">
        This invitation link expires in 72 hours.
      </p>

    </Card>
  );
}