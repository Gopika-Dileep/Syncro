export const ENDPOINTS = {
    AUTH: {
        REGISTER: "/auth/register",
        VERIFY_OTP: "/auth/verify-otp",
        RESEND_OTP: "/auth/resend-otp",
        LOGIN: "/auth/login",
        REFRESH: "/auth/refresh",
        LOGOUT: "/auth/logout",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
    },
    COMPANY: {
        EMPLOYEES: "/company/employees",
        ADD_EMPLOYEE: "/company/employee/add",
        TOGGLE_BLOCK_EMPLOYEE: (userId: string) => `/company/employee/${userId}/toggle-block`,
        GET_EMPLOYEE_DETAILS: (userId: string) => `/company/employee/${userId}`,
        UPDATE_EMPLOYEE_DETAILS: (userId: string) => `/company/employee/${userId}`,
        TEAMS: "/company/teams",
        UPDATE_TEAM: (teamId: string) => `/company/team/${teamId}`,
        DELETE_TEAM: (teamId: string) => `/company/team/${teamId}`,
    },
    USER: {
        PROFILE: "/user/profile",
        CHANGE_PASSWORD: "/user/change-password",
    },
    PROJECTS: {
        BASE: "/projects",
        BY_ID: (id: string) => `/projects/${id}`,
    }
};
