import { combineReducers } from '@reduxjs/toolkit'
import auth from './auth'
import notifications from './notifications'
import profile from './profile'
import project from './project'
import task from './task'
import team from './team'
import ui from './ui'
import sidebar from './sidebar'
import dashboard from './dashboard'
import report from './report'

const rootReducer = combineReducers({
  auth,
  project,
  task,
  profile,
  team,
  ui,
  notifications,
  sidebar,
  dashboard,
  report,
})

export default rootReducer
