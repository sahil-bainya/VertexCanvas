import { Outlet, useLocation } from "react-router-dom";
import "./App.css";
import { Header, Footer } from "./components";

function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname.startsWith("/board") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Header />}
      <main className="flex-1 flex flex-col ">
        <Outlet />
      </main>
      {!hideNavbar && <Footer />}
    </div>
  );
}

export default App;