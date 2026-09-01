import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../store/themeSlice.js";
import { Palette, ChevronRight } from "lucide-react";
export default function ToggleTheme({text="",style=""}) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const PaletteSize = text==="" ? 18 : 15;
  const handleToggle = (evt) => {
    evt.stopPropagation();
    dispatch(setTheme(evt.target.value));
  };

  return (
    <div className={`dropdown dropdown-left rounded-lg ${text && "px-4! py-2!"}`}>
      <div
        tabIndex={0}
        role="button"
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm"
      >
        <span className={`${style}`}>
          <Palette size={PaletteSize} />
          {text}
        </span>
        {text && <ChevronRight size={15} />}
      </div>
      <ul
        tabIndex="-1"
        className="dropdown-content menu bg-base-100 rounded-xl z-1 w-52 p-2! shadow-sm gap-1"
      >
        <li>
          <input
            type="radio"
            name="theme-dropdown"
            className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start p-2! rounded-2xl "
            aria-label="Light"
            value="light"
            defaultChecked={theme === "light"}
            onClick={handleToggle}
          />
        </li>
        <li>
          <input
            type="radio"
            name="theme-dropdown"
            className="theme-controller w-full btn btn-sm p-2! rounded-2xl btn-block btn-ghost justify-start"
            aria-label="Dark"
            value="dark"
            onClick={handleToggle}
            defaultChecked={theme === "default"}
          />
        </li>

        <li>
          <input
            type="radio"
            name="theme-dropdown"
            className="theme-controller w-full btn btn-sm p-2! rounded-2xl btn-block btn-ghost justify-start"
            aria-label="luxury"
            value="luxury"
            onClick={handleToggle}
            defaultChecked={theme === "luxury"}
          />
        </li>

        <li>
          <input
            type="radio"
            name="theme-dropdown"
            className="theme-controller w-full btn btn-sm p-2! rounded-2xl btn-block btn-ghost justify-start"
            aria-label="autumn"
            value="autumn"
            onClick={handleToggle}
            defaultChecked={theme === "autumn"}
          />
        </li>

        <li>
          <input
            type="radio"
            name="theme-dropdown"
            className="theme-controller w-full btn btn-sm p-2! rounded-2xl btn-block btn-ghost justify-start"
            aria-label="sunset"
            value="sunset"
            onClick={handleToggle}
            defaultChecked={theme === "sunset"}
          />
        </li>
      </ul>
    </div>
  );
}
