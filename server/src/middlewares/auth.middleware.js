  import { User } from "../models/user.model.js";
  import ApiError from "../utils/ApiError.js";
  import asyncHandler from "../utils/asyncHandler.js";
  import jwt from "jsonwebtoken";

  export const verifyJWT = asyncHandler(async (req, _ , next) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", ""); //when user sends data using headers , it would be like - Authorization: Bearer <token>
      if (!token) {
        throw new ApiError(401, "Unauthorized request");
      }
      // token does not has _id directly , it has decoded form that is why we will use decodedtoken
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }
      req.user = user;
      next();
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid Access Token");
    }
  });
