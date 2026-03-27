import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">

      {/* Illustration */}
      <img
        src="../../public/assets/images/error.svg"
        alt="Page not found"
        className="w-120 mb-8"
      />

      {/* Title */}
      <h3 className="text-3xl font-semibold text-white mb-3">
        Page not found
      </h3>

      {/* Description */}
      <p className="text-gray-400 max-w-md mb-8">
        The page you are trying to access doesn't exist or the link may be invalid.
      </p>

      {/* Button */}
      <Button variant="white" onClick={() => navigate("/dashboard")}>
        Back to homepage
      </Button>

    </div>
  );
}