import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  boards: [],
};

const boardSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setBoards: (state, action) => {
      state.boards = action.payload;
    },
    addBoard: (state, action) => {
      state.boards.unshift(action.payload);
    },
    removeBoard: (state, action) => {
      state.boards = state.boards.filter((b) => b._id != action.payload);
    },
    updateBoard: (state, action) => {
      const board = state.boards.find((b) => b._id === action.payload.id);
      if (board) {
        board.title = action.payload.title;
      }
    },
  },
});

export const { setBoards, addBoard, removeBoard, updateBoard } =
  boardSlice.actions;
export default boardSlice.reducer;
