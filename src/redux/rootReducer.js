// ** Reducers Imports
import navbar from './navbar'
import user from './user'
import users from './users'
import customer from './customer'
import appointment from './appointment'
import doctor from './doctor'
import layout from './layout'
import auth from './authentication'
import todo from '@src/views/apps/todo/store'
import chat from '@src/views/apps/chat/store'

// import users from '@src/views/apps/user/store'
import email from '@src/views/apps/email/store'
import invoice from '@src/views/apps/invoice/store'
import calendar from '@src/views/apps/calendar/store'
import ecommerce from '@src/views/apps/ecommerce/store'
import dataTables from '@src/views/tables/data-tables/store'
import permissions from '@src/views/apps/roles-permissions/store'
import { combineReducers } from 'redux'

const appReducer = combineReducers({
  auth,
  user,
  users,
  todo,
  chat,
  email,
  customer,
  doctor,
  appointment,
  navbar,
  layout,
  invoice,
  calendar,
  ecommerce,
  dataTables,
  permissions
})

const rootReducer = (state, action) => {
  if (action.type === 'authentication/handleLogout') {
    return appReducer(undefined, action)
  }

  return appReducer(state, action)
}

export default rootReducer
