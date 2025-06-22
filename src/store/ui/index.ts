import { createSlice } from "@reduxjs/toolkit";

interface UIState {
    sidebarOpen: boolean;
}

const initialState: UIState = {
    sidebarOpen: false
}

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openSidebar: (state) => { state.sidebarOpen = true; },
        closeSidebar: (state) => { state.sidebarOpen = false; }
    }
})

export const { openSidebar, closeSidebar } = uiSlice.actions;
export default uiSlice.reducer;