import { useState } from "react";
import { useSelector } from "react-redux";
import { UpdateAvatar, UpdateProfile, ChangePassword } from "./";
import { ArrowRight, Mail, Lock, User, SquarePen } from "lucide-react";
export default function Settings() {
  const user = useSelector((state) => state.auth.user);
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div className="flex-1 bg-base-200 flex items-center justify-center ">
      <div className="card card-side bg-base-100 shadow-sm w-2/5 p-5!">
        <figure
          className="relative group cursor-pointer rounded-xl p-2!"
          onClick={() => setActiveModal("avatar")}
        >
          <div className="avatar ">
            <div className="w-40">
              <img src={user?.avatar} alt="Avatar" className="rounded-xl"/>
              <div className="absolute inset-0 backdrop-brightness-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <SquarePen color="#ffffff" />
              </div>
            </div>
          </div>
        </figure>

        <div className="card-body p-2!">
          <button
            className="btn px-1! w-auto justify-between"
            onClick={() => setActiveModal("name")}
          >
            <div className="flex items-center gap-1">
              <User size={18} />
              {user?.name}
            </div>
            <ArrowRight size={18} />
          </button>

          <button
            className="btn px-1! w-auto justify-between"
            onClick={() => setActiveModal("email")}
          >
            <div className="flex items-center gap-1">
              <Mail size={18} />
              {user?.email}
            </div>
            <ArrowRight size={18} />
          </button>

          <button
            className="btn px-1! w-auto justify-between"
            onClick={() => setActiveModal("password")}
          >
            <div className="flex items-center gap-1">
              <Lock size={18} />
              Change Password
            </div>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {activeModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-4"></div>

            {activeModal === "avatar" && (
              <UpdateAvatar onClose={() => setActiveModal(null)} />
            )}
            {activeModal === "name" && (
              <UpdateProfile
                field="name"
                onClose={() => setActiveModal(null)}
              />
            )}
            {activeModal === "email" && (
              <UpdateProfile
                field="email"
                onClose={() => setActiveModal(null)}
              />
            )}
            {activeModal === "password" && (
              <ChangePassword
                field="password"
                onClose={() => setActiveModal(null)}
              />
            )}
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setActiveModal(null)}
          ></div>
        </div>
      )}
    </div>
  );
}
