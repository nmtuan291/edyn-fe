import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UserState {
    id: string
    userName: string
    email: string
}

const storedUser = (() => {
    try {
        const raw = localStorage.getItem("edyn_user");
        if (raw) return JSON.parse(raw) as Partial<UserState>;
    } catch { /* ignore */ }
    return {};
})();

const initialState: UserState = {
    id: storedUser.id ?? "",
    userName: storedUser.userName ?? "",
    email: storedUser.email ?? "",
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ id: string; userName: string; email: string }>) => {
            state.id = action.payload.id;
            state.userName = action.payload.userName;
            state.email = action.payload.email;
            localStorage.setItem("edyn_user", JSON.stringify(action.payload));
        },
        clearUser: (state) => {
            state.id = "";
            state.userName = "";
            state.email = "";
            localStorage.removeItem("edyn_user");
        },
    }
})

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
