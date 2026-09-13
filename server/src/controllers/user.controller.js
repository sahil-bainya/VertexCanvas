import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

const generateAccessAndrefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if ([name, email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }
  let avatarLocalPath;
  if (req.file && req.file.path) {
    avatarLocalPath = req.file?.path;
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const user = await User.create({
    name: name.trim(),
    email: email.trim(),
    password,
    avatar: avatar?.url || "",
  });
  const createdUser = await User.findById(user._id).select(
    "-password --refreshToken",
  ); // to remove fields
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  const { accessToken, refreshToken } = await generateAccessAndrefreshTokens(
    createdUser._id,
  );
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        {
          user: createdUser,
          accessToken,
          refreshToken,
        },
        "User registered successfully",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "email is required");
  }
  if (!password) {
    throw new ApiError(400, "password is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "user with this email is not found");
  }
  const isthis = await user.isPasswordCorrect(password);

  if (!isthis) {
    throw new ApiError(400, "Invalid login credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndrefreshTokens(
    user._id,
  );
  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  const options = {
    httpOnly: true, // now only server can modify the cookies , not the frontend
    secure: true,
    sameSite: "none",
    path: "/",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedinUser,
          accessToken,
          refreshToken,
        },
        "User loggedin successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }
  if (newPassword.length == 0) {
    throw new ApiError(400, "Please enter the new password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentuser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const UpdateUserDetails = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        name,
        email,
      },
    },
    { returnDocument: "after" },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(500, "Error while uploading avatar on cloudinary");
  }
  const oldAvatarUrl = req.user.avatar;
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { returnDocument: "after" },
  ).select("-password");
  await deleteFromCloudinary(oldAvatarUrl);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndrefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
export {
  registerUser,
  updateUserAvatar,
  loginUser,
  logoutUser,
  changeUserPassword,
  getCurrentuser,
  UpdateUserDetails,
  refreshAccessToken,
};
