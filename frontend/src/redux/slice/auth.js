import { createSlice } from "@reduxjs/toolkit";
import { loadStoredAuth } from "../../service/authStorage";

const savedAuth = loadStoredAuth();
const initialState = {
  user: savedAuth?.user || null,
  token: savedAuth?.token || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setUserDetails(state, action) {
      state.user = action.payload.user || action.payload;
    },
    setToken(state, action) {
      state.token = action.payload.token || action.payload;
    },
    syncUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    logout() {
      return { user: null, token: null };
    },
  },
});

export const { logout, setAuth, setToken, setUserDetails, syncUser } =
  authSlice.actions;
export default authSlice.reducer;
