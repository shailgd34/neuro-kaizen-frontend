import AppRoutes from "./routes/AppRoutes";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "./store/authSlice";

function App() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const name = sessionStorage.getItem("name");
    const email = sessionStorage.getItem("email");

    if (token && role) {
      dispatch(login({ token, role, name, email }));
    }

    setReady(true);
  }, [dispatch]);

  if (!ready) return null;

  return <AppRoutes />;
}

export default App;
