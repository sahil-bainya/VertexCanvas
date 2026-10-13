import { setUser,clearUser } from "../store/authSlice.js";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "../services/api.js";


export default function AuthInit({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    api
      .get("/user/get-user")
      .then((res) => dispatch(setUser(res.data.data)))
      .catch(() => dispatch(clearUser()));
  }, [dispatch]);

  return children;
}