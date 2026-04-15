export const API_BASE = '/api';

export const ENDPOINTS = {
  AUTH: {
    BASE: '/auth',
    REGISTER: '/register',
    VERIFY_OTP: '/verify-otp',
    RESEND_OTP: '/resend-otp',
    LOGIN: '/login',
    REFRESH: '/refresh',
    LOGOUT: '/logout',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  COMPANY: {
    BASE: '/company',
    EMPLOYEES: '/employees',
    ADD_EMPLOYEE: '/employee/add',
    TOGGLE_BLOCK_EMPLOYEE: '/employee/:userId/toggle-block',
    GET_EMPLOYEE_DETAILS: '/employee/:userId',
    UPDATE_EMPLOYEE_DETAILS: '/employee/:userId',
    TEAMS: '/teams',
    UPDATE_TEAM: '/team/:teamId',
    DELETE_TEAM: '/team/:teamId',
  },
  USER: {
    BASE: '/user',
    PROFILE: '/profile',
    CHANGE_PASSWORD: '/change-password',
  },
  PROJECTS: {
    BASE: '/projects',
    ROOT: '/',
    BY_PROJECT_ID: '/:projectId',
  },
  USER_STORIES: {
    BASE: '/user-stories',
    ROOT: '/',
    BY_PROJECT: '/project/:projectId',
    BY_STORY_ID: '/:storyId',
  },
};
