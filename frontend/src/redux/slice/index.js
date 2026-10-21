import { combineReducers } from '@reduxjs/toolkit'
import { resetStore } from '../actions'
import auth from "./auth";
import notifications from "./notifications";
import ui from "./ui";
import workspace from "./workspace";
import loader from "./initialLoader";
import team from "./team";

const combinedReducer = combineReducers({
  auth,
  workspace,
  team,
  loader,
  ui,
  notifications,
})

const rootReducer = (state, action) => {
  if (resetStore.match(action)) return combinedReducer(undefined, action)
  return combinedReducer(state, action)
}

export default rootReducer
