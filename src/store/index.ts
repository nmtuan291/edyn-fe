import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./ui";
import userReducer from "./user";
import apiSlice from "./api";

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        user: userReducer,
        [apiSlice.reducerPath] : apiSlice.reducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(apiSlice.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch