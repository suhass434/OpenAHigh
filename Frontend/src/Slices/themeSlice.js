import { createSlice } from "@reduxjs/toolkit";


const getInitialDarkMode = () => {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode !== null) {
    return JSON.parse(savedMode);
  }

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const initialState = {
  darkMode: getInitialDarkMode(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
    },
    setDarkMode(state, action) {
      state.darkMode = action.payload;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
    },
  },
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;

export default themeSlice.reducer;