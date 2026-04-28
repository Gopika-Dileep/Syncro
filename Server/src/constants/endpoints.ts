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
    GET_UNASSIGNED_EMPLOYEES: '/employees/unassigned',
    ASSIGN_TEAM_TO_EMPLOYEE: '/employee/:employeeId/assign-team',
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
  ISSUES: {
    BASE: '/issues',
    ROOT: '/',
    BY_PROJECT: '/project/:projectId',
    BY_SPRINT: '/sprint/:sprintId',
    BY_ISSUE_ID: '/:issueId',
    ASSIGN: '/:issueId/assign',
  },
  TEAMS: {
    BASE: '/teams',
    DIRECTORY: '/directory',
  },
  SPRINTS: {
    BASE: '/sprints',
    ROOT: '/',
    BY_ID: '/:sprintId',
  },
  SUBTASKS: {
    BASE: '/subtasks',
    ROOT: '/',
    BY_ISSUE: '/issue/:issueId',
    BY_ID: '/:subTaskId',
    ASSIGN: '/:subTaskId/assign',
    ASSIGNED: '/assigned',
  },
};
