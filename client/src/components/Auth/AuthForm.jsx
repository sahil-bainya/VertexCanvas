import { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import Logo from "../logo.jsx";
import "./authPage.css";

const LOGIN_IMG =
  "https://res.cloudinary.com/datjhn3ph/image/upload/v1789222287/login_b9a3fw.png";
const SIGNUP_IMG =
  "https://res.cloudinary.com/datjhn3ph/image/upload/v1789225162/signup_mxr4i2.png";

export default function AuthForm() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4! font-[Montserrat]">
      <div className="relative w-205 max-w-full min-h-135 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl shadow-black/40">
        {/* Sign Up Panel */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center p-8! transition-opacity duration-500 *:w-full ${
            isRightPanelActive
              ? "translate-x-full opacity-100 z-5 visible pointer-events-auto animate-[authShow_0.6s]"
              : "opacity-0 z-1 invisible pointer-events-none"
          }`}
        >
          <SignUp />
        </div>

        {/* Sign In Panel */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center p-8! transition-transform duration-500 z-2 min-h-135 ${
            isRightPanelActive
              ? "translate-x-full invisible pointer-events-none"
              : "visible pointer-events-auto"
          }`}
        >
          <Login />
        </div>

        {/* Overlay */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-500 ease-in-out z-100 ${
            isRightPanelActive ? "-translate-x-full" : ""
          }`}
        >
          <div
            className={`relative -left-full h-full w-[200%] bg-linear-to-br from-primary to-secondary transition-transform duration-500 ease-in-out ${
              isRightPanelActive ? "translate-x-1/2" : "translate-x-0"
            }`}
          >
            {/* Left half — shown when Sign In is active */}
            <div
              className={`absolute top-0 h-full w-1/2 flex flex-col  transition-transform duration-500 ease-in-out ${
                isRightPanelActive ? "translate-x-0" : "translate-x-[-20%]"
              }`}
            >
              <div className="flex items-center gap-0 mt-2!">
                <Logo
                  h={60}
                  w={60}
                  vColor="text-primary-content"
                  cColor="text-primary-content"
                  nodeColor="text-primary-content"
                />
                <span className="font-bold text-primary-content text-lg pt-2!">
                  VertexCanvas
                </span>
              </div>

              <div className="mt-6! ml-8!">
                <h1 className="text-2xl font-extrabold text-primary-content leading-tight mb-2!">
                  Ideas Start
                  <br />
                  Here.
                </h1>
                <p className="text-sm text-primary-content/90 mb-4!">
                  Sketch it. Connect it. Make it real.
                </p>
              </div>

              <button
                onClick={() => setIsRightPanelActive(false)}
                className="self-center rounded-full border border-primary-content text-primary-content text-xs font-bold uppercase tracking-wider px-8! py-2.5! mt-2! mb-4! hover:bg-primary-content/15 active:scale-95 transition "
              >
                Sign In
              </button>
              <div className="flex-1 flex items-end justify-end">
                <img
                  src={LOGIN_IMG}
                  alt=""
                  className="w-full h-full max-h-70 max-w-75  object-cover"
                  // style={{ objectPosition: "left bottom" }}
                />
              </div>
            </div>

            <div
              className={`absolute top-0 right-0 h-full w-1/2 flex flex-col  transition-transform duration-500 ease-in-out ${
                isRightPanelActive ? "translate-x-[20%]" : "translate-x-0"
              }`}
            >
              <div className="flex items-center gap-0 mt-2!">
                <Logo
                  h={60}
                  w={60}
                  vColor="text-primary-content"
                  cColor="text-primary-content"
                  nodeColor="text-primary-content"
                />
                <span className="font-bold text-primary-content text-lg pt-2!">
                  VertexCanvas
                </span>
              </div>

              <div className="mt-6! ml-6!">
                <h1 className="text-2xl font-extrabold text-primary-content leading-tight mb-2!">
                  Back to the
                  <br />
                  Canvas.
                </h1>
                <p className="text-sm text-primary-content/80 mb-4!">
                  Your ideas are still waiting.
                </p>
              </div>
              <button
                onClick={() => setIsRightPanelActive(true)}
                className="self-center rounded-full border border-primary-content text-primary-content text-xs font-bold uppercase tracking-wider px-8! py-2.5! mt-2! mb-4 hover:bg-primary-content/15 active:scale-95 transition"
              >
                Sign Up
              </button>
              <div className="flex-1 flex items-end justify-start">
                <img
                  src={SIGNUP_IMG}
                  alt=""
                  className="w-full h-full max-h-70 max-w-76 object-cover"
                  style={{ objectPosition: "left bottom" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
