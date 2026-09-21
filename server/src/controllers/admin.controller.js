import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Board } from "../models/board.model.js";

const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalBoards, recentUsers, recentBoards] =
    await Promise.all([
      User.countDocuments(),
      Board.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email createdAt"),
      Board.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title ownerName createdAt"),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalUsers,
          totalBoards,
        },
        recentUsers,
        recentBoards,
      },
      "Stats fetched",
    ),
  );
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { users }, "Users fetched"));
});

// Get all boards
const getAllBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find()
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { boards }, "Boards fetched"));
});

// Get single board details
const getBoardDetails = asyncHandler(async (req, res) => {
  const { boardId } = req.params;

  const board = await Board.findById(boardId)
    .populate("owner", "name email")
    .populate("collaborators", "name email")
    .populate("pendingRequests.userId", "name email");

  if (!board) {
    throw new ApiError(404, "Board not found");
  }

  return res.status(200).json(new ApiResponse(200, { board }, "Board fetched"));
});

// Delete any user
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "Cannot delete yourself");
  }

  await User.findByIdAndDelete(userId);
  await Board.deleteMany({ owner: userId });

  return res.status(200).json(new ApiResponse(200, {}, "User deleted"));
});

// Delete any board
const deleteBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;

  await Board.findByIdAndDelete(boardId);

  return res.status(200).json(new ApiResponse(200, {}, "Board deleted"));
});

// Change user role
const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true },
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, { user }, "Role updated"));
});

export {
  getStats,
  getAllUsers,
  getAllBoards,
  getBoardDetails,
  deleteUser,
  deleteBoard,
  updateUserRole,
};
