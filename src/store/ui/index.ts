import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    sidebarOpen: boolean;
    /** In-flight RTK Query requests (via wrapped baseQuery); >0 shows global loading overlay. */
    apiInFlightCount: number;
    showLoginModal: boolean;
}

const initialState: UIState = {
    sidebarOpen: false,
    apiInFlightCount: 0,
    showLoginModal: false,
}

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openSidebar: (state) => { state.sidebarOpen = true; },
        closeSidebar: (state) => { state.sidebarOpen = false; },
        apiRequestStarted: (state) => {
            state.apiInFlightCount += 1;
        },
        apiRequestFinished: (state) => {
            state.apiInFlightCount = Math.max(0, state.apiInFlightCount - 1);
        },
        /** Safety if a request errors without finishing the wrapper (should not happen). */
        resetApiInFlight: (state, action: PayloadAction<number | undefined>) => {
            state.apiInFlightCount = action.payload ?? 0;
        },
        openLoginModal: (state) => { state.showLoginModal = true; },
        closeLoginModal: (state) => { state.showLoginModal = false; },
    }
})

export const { openSidebar, closeSidebar, apiRequestStarted, apiRequestFinished, resetApiInFlight, openLoginModal, closeLoginModal } = uiSlice.actions;
export default uiSlice.reducer;