import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Board } from "../models/board.model.js";

import { User } from "../models/user.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { getBoardAccess } from "../utils/checkOwnership.js";

const createBoard = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const owner = req.user._id;
  const board = await Board.create({
    title: title || undefined,
    owner,
  });
  if (!board) {
    throw new ApiError(500, "Error occur while creating board");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, { board }, "Board created succesfully"));
});

const getAllBoards = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const boards = await Board.find({ owner: userId });
  return res
    .status(200)
    .json(new ApiResponse(200, { boards }, "Boards fetched successfully"));
});

const getBoard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Invalid board Id");
  }
  const board = await Board.findById(id);
  if (!board) {
    throw new ApiError(404, "Board with this id not found");
  }
  const access = getBoardAccess(board, req.user._id);
  const hasPendingRequest = board.pendingRequests?.some((req) =>
    req.userId.equals(req.user._id),
  );

  // Agar owner nahi, collaborator nahi, aur pending request nahi - access deny
  if (!access.isOwner && !access.isCollaborator) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          board: {
            _id: board._id,
            title: board.title,
          },
          access: {
            isOwner: false,
            isCollaborator: false,
            hasPendingRequest: hasPendingRequest || false,
          },
        },
        "Board access info",
      ),
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        board,
        access: {
          isOwner: access.isOwner,
          isCollaborator: access.isCollaborator,
          hasPendingRequest: false,
        },
      },
      "Board fetched successfully",
    ),
  );
});

const deleteBoard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Invalid board Id");
  }
  const board = await Board.findById(id);
  if (!board) {
    throw new ApiError(404, "Board Not Found");
  }
  if (!board.owner.equals(req.user._id)) {
    throw new ApiError(400, "You are not the owner of this board");
  }

  const response = await Board.findByIdAndDelete(id);
  if (!response) {
    throw new ApiError(400, "Board not deleted");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Board deleted successfully"));
});

const updateTitle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Invalid board Id");
  }
  const board = await Board.findById(id);
  if (!board.owner.equals(req.user._id)) {
    throw new ApiError(400, "You are not the owner of this board");
  }
  const { title } = req.body;
  const response = await Board.findByIdAndUpdate(
    id,
    {
      title,
    },
    { returnDocument: "after" },
  );
  if (!response) throw new ApiError(404, "Board not found");
  return res
    .status(200)
    .json(new ApiResponse(200, { response }, "Title updated successfully"));
});

const updateCanvas = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { canvasData, arrows } = req.body;
  const board = await Board.findById(id);
  if (!board) throw new ApiError(404, "Board not found");

  const access = getBoardAccess(board, req.user._id);

  if (!access.isOwner && !access.isCollaborator) {
    throw new ApiError(403, "You don't have access");
  }

  board.canvasData = canvasData;
  board.arrows = arrows;
  await board.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { board }, "Canvas saved successfully"));
});

const updateNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { boardNotes } = req.body;
  const board = await Board.findById(id);
  if (!board) throw new ApiError(404, "Board not found");

  const access = getBoardAccess(board, req.user._id);

  if (!access.isOwner && !access.isCollaborator) {
    throw new ApiError(403, "You don't have access");
  }
  board.boardNotes = boardNotes;
  await board.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { board }, "Notes saved successfully"));
});

const requestJoin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  
  const board = await Board.findById(id);
  if (!board) {
    throw new ApiError(404, "Board not found");
  }
  
  // Check if already requested
  const alreadyRequested = board.pendingRequests?.some(
    (req) => req.userId.equals(userId)
  );
  
  if (alreadyRequested) {
    throw new ApiError(400, "Request already sent");
  }
  
  // Check if already collaborator or owner
  const access = getBoardAccess(board, userId);
  if (access.isOwner || access.isCollaborator) {
    throw new ApiError(400, "Already have access");
  }
  
  // Add to pending requests
  board.pendingRequests.push({ userId });
  await board.save();
  
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Join request sent"));
});

export {
  createBoard,
  getAllBoards,
  getBoard,
  deleteBoard,
  updateTitle,
  updateCanvas,
  updateNotes,
  requestJoin,
};
