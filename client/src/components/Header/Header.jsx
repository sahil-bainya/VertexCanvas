import { useSelector } from "react-redux";
import { UserRound } from "lucide-react";
import { AppName } from "../";
import Menubar from "./Menubar.jsx";
import { useLocation } from "react-router-dom";

export default function Header() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const hideSearchBox = location.pathname.startsWith("/settings");
  return (
    <nav>
      <div className="navbar bg-base-100 shadow-sm h-16 px-4!">
        <div className="flex-1 pl-2!">
          <a >
            <AppName />
          </a>
        </div>
        
        <div className="flex items-center pr-2!">
          {!hideSearchBox && (
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered w-24 md:w-auto px-4! mx-5!"
            />
          )}

          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar hover:bg-base-200 transition-colors"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-base-200">
                {user?.avatar ? (
                  <img
                    src={`${user?.avatar}`}
                    alt="user photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserRound className="w-5 h-5 text-base-content/60" />
                )}
              </div>
            </div>

            <Menubar />
          </div>
        </div>
      </div>
    </nav>
  );
}
