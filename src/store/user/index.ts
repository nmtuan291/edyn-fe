import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UserState {
    id: string
}

const initialState: UserState = {
    id: ""
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state: UserState, action: PayloadAction<string>) => { 
            state.id = action.payload 
        },

    }
})

export const { setUser } = userSlice.actions;
export default userSlice.reducer;