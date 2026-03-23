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
        setCredentials: (state, action: PayloadAction<{ user: User; token: string; permissions: string[] }>) => {
            state.user = { ...action.payload.user, permissions: action.payload.permissions };
            state.token = action.payload.token;
        },
        restoreSession: (state, action: PayloadAction<{ user: User; token: string; permissions: string[] }>) => {
            state.user = { ...action.payload.user, permissions: action.payload.permissions };
            state.token = action.payload.token;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
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

export const { setCredentials,restoreSession, setToken, setUser, logout, setInitialized } = authSlice.actions
export default authSlice.reducer