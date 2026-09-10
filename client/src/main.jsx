// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import store from "./store/store.js";
import { AuthLayout } from "./components";
import { AuthPage, BoardPage, DashboardPage, SettingsPage } from "./pages";
import SocketProvider from "./globalSocket/SocketProvider.jsx";

const savedTheme = localStorage.getItem("theme") || "default";
document.documentElement.setAttribute("data-theme", savedTheme);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/login" /> },
      { path: "/login", element: <AuthPage /> },
      { path: "/register", element: <AuthPage /> },
      {
        path: "/dashboard",
        element: (
          <AuthLayout>
            <DashboardPage />
          </AuthLayout>
        ),
      },
      {
        path: "/board/:id",
        element: (
          <AuthLayout>
            <BoardPage />
          </AuthLayout>
        ),
      },
      {
        path: "/settings",
        element: (
          <AuthLayout>
            <SettingsPage />
          </AuthLayout>
        ),
      },
      { path: "*", element: <Navigate to="/login" /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SocketProvider>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </SocketProvider>
  </Provider>,
);
