import { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import "./authPage.css";

export default function AuthForm() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 !px-4 font-[Montserrat]">
      <div className="relative w-[820px] max-w-full min-h-[540px] overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl shadow-black/40">

        {/* Sign Up Panel */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center !p-8 transition-opacity duration-500 [&>*]:w-full ${
            isRightPanelActive
              ? "translate-x-full opacity-100 z-[5] visible pointer-events-auto animate-[authShow_0.6s]"
              : "opacity-0 z-[1] invisible pointer-events-none"
          }`}
        >
          <SignUp />
        </div>

        {/* Sign In Panel */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center !p-8 transition-transform duration-500 z-[2] [&>*]:w-full ${
            isRightPanelActive ? "translate-x-full invisible pointer-events-none" : "visible pointer-events-auto"
          }`}
        >
          <Login />
        </div>

        {/* Overlay */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-500 ease-in-out z-[100] ${
            isRightPanelActive ? "-translate-x-full" : ""
          }`}
        >
          <div
            className={`relative -left-full h-full w-[200%] bg-gradient-to-r from-primary to-secondary transition-transform duration-500 ease-in-out ${
              isRightPanelActive ? "translate-x-1/2" : "translate-x-0"
            }`}
          >
            <div
              className={`absolute top-0 h-full w-1/2 flex flex-col items-center justify-center !px-10 text-center transition-transform duration-500 ease-in-out ${
                isRightPanelActive ? "translate-x-0" : "-translate-x-[20%]"
              }`}
            >
              <h1 className="text-2xl font-extrabold text-primary-content !mb-2">Welcome back</h1>
              <p className="text-sm text-primary-content/80 leading-5 !mb-6">
                Already have a board? Sign in to pick up where you left off.
              </p>
              <button
                onClick={() => setIsRightPanelActive(false)}
                className="rounded-full border border-primary-content text-primary-content text-xs font-bold uppercase tracking-wider !px-10 !py-3 hover:bg-primary-content/15 active:scale-95 transition"
              >
                Sign In
              </button>
            </div>

            <div
              className={`absolute top-0 right-0 h-full w-1/2 flex flex-col items-center justify-center !px-10 text-center transition-transform duration-500 ease-in-out ${
                isRightPanelActive ? "translate-x-[20%]" : "translate-x-0"
              }`}
            >
              <h1 className="text-2xl font-extrabold text-primary-content !mb-2">Hello, friend!</h1>
              <p className="text-sm text-primary-content/80 leading-5 !mb-6">
                New to VertexCanvas? Create an account and start building.
              </p>
              <button
                onClick={() => setIsRightPanelActive(true)}
                className="rounded-full border border-primary-content text-primary-content text-xs font-bold uppercase tracking-wider !px-10 !py-3 hover:bg-primary-content/15 active:scale-95 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}