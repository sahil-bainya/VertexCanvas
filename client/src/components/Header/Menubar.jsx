import { Link } from "react-router-dom";
import LogoutBtn from "./LogoutButton";
import { useSelector } from "react-redux";
import { Settings, LayoutDashboard } from "lucide-react";
import {ToggleTheme} from "../"
export default function Menubar() {
  const user = useSelector((state) => state.auth.user);
  return (
    <ul
      tabIndex={-1}
      className="menu  dropdown-content bg-base-100 rounded-xl z-10 mt-2 w-max shadow-lg border border-base-200 p-2! text-md text-center"
    >
      <li>
        <Link to="/dashboard" className="rounded-lg px-4! py-2! ">
          <LayoutDashboard size={15} />
          Dashboard
        </Link>
      </li>
      <li>
        <Link to="/settings" className="rounded-lg px-4! py-2! ">
          <Settings size={15} /> Settings
        </Link>
      </li>
      <li>
        <ToggleTheme text="Appearance" style="flex items-center gap-1.5"/>
      </li>
      <li className="rounded-lg px-4! py-2! ">
        <LogoutBtn />
      </li>
      <div className="divider my-0.5 mx-2" />
      <li className=" text-md font-medium  tracking-wider text-left px-3!">
        {user?.name}
      </li>
      <li className=" text-xs  text-base-content/50  tracking-wider px-3! ">
        {user?.email}
      </li>
    </ul>
  );
}
