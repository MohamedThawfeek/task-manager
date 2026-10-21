import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import sessionStorage from "redux-persist/lib/storage/session"; // Use sessionStorage instead of localStorage
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import rootReducer from "./slice";
import { saveStoredAuth } from '../service/authStorage'
import { storage } from '../service/storage'

const persistConfig = {
  key: "root",
  storage: sessionStorage, // Use sessionStorage for clearing data when the tab is closed
  stateReconciler: autoMergeLevel2,
};

const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
      // serializableCheck: {
      //   ignoredActions: [FLUSH, REHYDRATE, REGISTER, PAUSE, PURGE, PERSIST],
      // },
    }),
  devTools: import.meta.env.DEV,
});

export const Presistor = persistStore(store);

let previousPersistedState
store.subscribe(() => {
  const state = store.getState()
  const nextPersistedState = {
    auth: state.auth,
    tasks: state.workspace.tasks,
    projects: state.workspace.projects,
    profile: state.workspace.profile,
    team: state.team.rows,
  }

  if (previousPersistedState?.auth !== nextPersistedState.auth) saveStoredAuth(nextPersistedState.auth)
  if (previousPersistedState?.tasks !== nextPersistedState.tasks) storage.save('tasks', nextPersistedState.tasks)
  if (previousPersistedState?.projects !== nextPersistedState.projects) storage.save('projects', nextPersistedState.projects)
  if (previousPersistedState?.profile !== nextPersistedState.profile) storage.save('profile', nextPersistedState.profile)
  if (previousPersistedState?.team !== nextPersistedState.team) storage.save('team', nextPersistedState.team)
  previousPersistedState = nextPersistedState
})

export default store;
// .concat(loggerMiddleware)
