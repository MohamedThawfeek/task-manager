import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    mobileOpen: false,
    openDropdown: "",
  },
  reducers: {
    openSidebar(state) {
      state.mobileOpen = true;
    },
    closeSidebar(state) {
      state.mobileOpen = false;
    },
    toggleSidebarDropdown(state, action) {
      state.openDropdown = state.openDropdown === action.payload ? "" : action.payload;
    },
  },
});

export const { closeSidebar, openSidebar, toggleSidebarDropdown } = sidebarSlice.actions;
export default sidebarSlice.reducer;
