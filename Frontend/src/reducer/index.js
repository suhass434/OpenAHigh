import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../Slices/authSlice";
import themeReducer from "../Slices/themeSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
});

export default rootReducer;