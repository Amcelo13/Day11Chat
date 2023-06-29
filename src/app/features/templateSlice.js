import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: {},
  isLoggedIn: false,
  currentNumber: -1,
  currentRoom: "-1",
  CurrentUser: "",
  CurrentUserId: -1,
  online: false,
  currentReciever: {},
};

export const templateSlice = createSlice({
  name: "users",
  initialState,

  reducers: {
    setUser: (state, action) => {
      // console.log(action);
      state.CurrentUser = action.payload;
    },
    setReciever: (state, action) => {
      state.currentReciever = action.payload;
    },
    setUserId: (state, action) => {
      state.CurrentUserId = action.payload;
    },
    setLogin: (state, action) => {
      state.isLoggedIn = true;
      state.users = action.payload;
      //   state.currentNumber = action.payload.currentNumber;
    },
    setLogout: (state, action) => {
      state.isLoggedIn = false;
      state.users = {};
    },
    setRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    // setLogOut: (state, action) => {
    //   state.isLoggedIn = false;
    // //   state.CurrentUserId = "";
    // //   state.currentNumber = -1;
    // },

    // setCurrentNumber: (state, action) => {
    //   state.currentNumber = action.payload;
    // },
  },
});
export const {
  setLogin,
  setUser,
  setReciever,
  setRoom,
  setUserId,
  setOnline,
  setLogout,
} = templateSlice.actions;

//selectors
export const selectUser = (state) => state.users;

export default templateSlice.reducer;
