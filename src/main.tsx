import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { store } from './store/store';

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      
    <App />
    </Provider>

    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="colored"
    />
  </QueryClientProvider>
);