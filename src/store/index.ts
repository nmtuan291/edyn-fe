import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./ui";
import userReducer from "./user";

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        user: userReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch