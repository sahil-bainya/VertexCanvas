import "./App.css";
import { Header, Footer } from "./components";
import { Outlet, useLocation } from "react-router-dom";
import api from "./services/api";
import { setUser, clearUser } from "./store/authSlice.js";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function App() {
  const location = useLocation(); // gives the current url
  const dispatch = useDispatch();
  useEffect(() => {
    api
      .get("/user/get-user")
      .then((res) => {
        dispatch(setUser(res.data.data));
      })
      .catch(() => {
        dispatch(clearUser());
      });
  }, [dispatch]);

  const hideNavbar =
    location.pathname.startsWith("/board") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");
  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Header />}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!hideNavbar && <Footer />}
    </div>
  );
}

export default App;
