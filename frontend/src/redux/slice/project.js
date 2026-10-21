import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  error: "",
  listLoading: false,
  detailLoading: false,
  submitting: false,
  deleting: false,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects(state, action) {
      state.items = action.payload;
      state.error = "";
    },
    setProjectDetails(state, action) {
      const project = action.payload;
      const index = state.items.findIndex((item) => item.id === project.id);

      if (index === -1) state.items.unshift(project);
      else state.items[index] = { ...state.items[index], ...project };

      state.error = "";
    },
    updateProject(state, action) {
      const project = action.payload;
      const index = state.items.findIndex((item) => item.id === project.id);

      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...project };
      }
    },
    deleteProject(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setProjectError(state, action) {
      state.error = action.payload || "";
    },
    setProjectListLoading(state, action) {
      state.listLoading = Boolean(action.payload);
    },
    setProjectDetailLoading(state, action) {
      state.detailLoading = Boolean(action.payload);
    },
    setProjectSubmitting(state, action) {
      state.submitting = Boolean(action.payload);
    },
    setProjectDeleting(state, action) {
      state.deleting = Boolean(action.payload);
    },
  },
});

export const {
  deleteProject,
  setProjectDeleting,
  setProjectDetailLoading,
  setProjectDetails,
  setProjectError,
  setProjectListLoading,
  setProjects,
  setProjectSubmitting,
  updateProject,
} = projectSlice.actions;

export const selectProjectState = (state) => state.project;
export const selectProjects = (state) => state.project.items;

export default projectSlice.reducer;
