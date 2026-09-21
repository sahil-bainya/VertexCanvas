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
import {
  AuthPage,
  BoardPage,
  DashboardPage,
  SettingsPage,
  LandingPage,
} from "./pages";
import SocketProvider from "./globalSocket/SocketProvider.jsx";
import AdminPage from "./components/Admin/AdminPage.jsx";
const savedTheme = localStorage.getItem("theme") || "default";
document.documentElement.setAttribute("data-theme", savedTheme);

const router = createBrowserRouter([
  // Public
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <AuthPage /> },
  { path: "/register", element: <AuthPage /> },

  // Protected (App layout wrapper)
  {
    element: <App />,
    children: [
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
      {
        path: "/admin",
        element: (
          <AuthLayout>
            <AdminPage />
          </AuthLayout>
        ),
      },
    ],
  },

  // Catch-all
  { path: "*", element: <Navigate to="/" /> },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SocketProvider>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </SocketProvider>
  </Provider>,
);
