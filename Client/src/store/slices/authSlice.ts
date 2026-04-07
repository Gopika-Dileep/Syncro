import { createSlice, type PayloadAction } from "@reduxjs/toolkit"


export interface User {
    id: string;
    name: string;
    role: string;
    designation: string | null;
    companyName: string | null;
    permissions: string[]
}
interface AuthState {
    user: User | null
    token: string | null
    isInitialized: boolean
}

const initialState: AuthState = {
    user: null,
    token: null,
    isInitialized: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<{ user: User; token: string; permissions: string[] }>) => {
            state.user = { ...action.payload.user, permissions: action.payload.permissions };
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
        },
        setInitialized: (state) => {
            state.isInitialized = true
        }
    },
})

export const { setAuth, logout, setInitialized } = authSlice.actions
export default authSlice.reducer