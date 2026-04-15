export const AUTH_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful',
  REGISTRATION_FAILED: 'Registration failed',
  OTP_VERIFICATION_FAILED: 'Otp verification failed',
  OTP_RESEND_SUCCESS: 'New OTP sent to email successfully',
  OTP_RESEND_FAILED: 'Failed to resend OTP',
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAILED: 'Login failed',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_VERIFIED: 'User is not verified',
  ACCOUNT_BLOCKED: 'Your account has been blocked. Please contact support.',
  INVALID_PASSWORD: 'Password is wrong',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  INVALID_OR_EXPIRED_OTP: 'Invalid or expired OTP',
  USER_ALREADY_VERIFIED: 'User is already verified',
  INVALID_RESET_TOKEN: 'Invalid or expired reset token',
  REFRESH_FAILED: 'Token refresh failed',
  LOGGED_OUT: 'Logged out',
  FORGOT_PASSWORD_SUCCESS: 'A reset link has been sent to this mail',
  RESET_SUCCESS: 'Password reset successful',
  RESET_FAILED: 'Reset failed',
  PASSWORD_UPDATED: 'Password updated successfully',
  INVALID_TOKEN: 'Invalid or expired token',
  NO_TOKEN: 'No token provided',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
  PASSWORD_CHANGE_FAILED: 'Failed to change password',
};

export const EMPLOYEE_MESSAGES = {
  ADD_SUCCESS: 'Employee added and invitation sent',
  ADD_FAILED: 'Failed to add employee',
  FETCH_SUCCESS: 'Employees fetched successfully',
  FETCH_FAILED: 'Failed to fetch employees',
  UPDATE_SUCCESS: 'Employee Profile updated successfully',
  UPDATE_FAILED: 'Failed to update employee details',
  TOGGLE_BLOCK_SUCCESS: (isBlocked: boolean) => (isBlocked ? 'Employee blocked' : 'Employee unblocked'),
  NOT_FOUND: 'Employee not found',
  COMPANY_NOT_FOUND: 'Company not found',
  EMPLOYEE_ALREADY_EXISTS: 'Employee with this email already exists',
  USER_ID_REQUIRED: 'userId is required',
  FETCH_DATA_FAILED: 'Failed to get data',
};

export const TEAM_MESSAGES = {
  CREATE_SUCCESS: 'Team created successfully',
  CREATE_FAILED: 'Failed to create team',
  FETCH_SUCCESS: 'Teams fetched successfully',
  FETCH_FAILED: 'Failed to fetch teams',
  UPDATE_SUCCESS: 'Team updated successfully',
  UPDATE_FAILED: 'Failed to update team',
  DELETE_SUCCESS: 'Team deleted successfully',
  DELETE_FAILED: 'Failed to delete team',
  COMPANY_NOT_FOUND: 'Company not found',
  TEAM_NOT_FOUND: 'Team not found',
  TEAM_ALREADY_EXISTS: 'This team already exists',
};

export const USER_MESSAGES = {
  PROFILE_FETCH_SUCCESS: 'Profile fetched successfully',
  PROFILE_FETCH_FAILED: 'Failed to fetch profile',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  PROFILE_UPDATE_FAILED: 'Failed to update profile',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
  PASSWORD_CHANGE_FAILED: 'Failed to change password',
  USER_NOT_FOUND: 'User not found',
  CURRENT_PASSWORD_MISMATCH: "Current password doesn't match",
  ALL_FIELDS_REQUIRED: 'All fields are required',
};

export const PROJECT_MESSAGES = {
  CREATE_SUCCESS: 'Project created successfully',
  CREATE_FAILED: 'Failed to create project',
  FETCH_SUCCESS: 'Projects fetched successfully',
  FETCH_FAILED: 'Failed to fetch projects',
  UPDATE_SUCCESS: 'Project updated successfully',
  UPDATE_FAILED: 'Failed to update project',
  DELETE_SUCCESS: 'Project deleted successfully',
  DELETE_FAILED: 'Failed to delete project',
  NOT_FOUND: 'Project not found',
  COMPANY_CONTEXT_NOT_FOUND: 'Company context not found',
};

export const USER_STORY_MESSAGES = {
  CREATE_SUCCESS: 'User story created successfully',
  CREATE_FAILED: 'Failed to create user story',
  FETCH_SUCCESS: 'User stories fetched successfully',
  FETCH_FAILED: 'Failed to fetch user stories',
  UPDATE_SUCCESS: 'User story updated successfully',
  UPDATE_FAILED: 'Failed to update user story',
  DELETE_SUCCESS: 'User story deleted successfully',
  DELETE_FAILED: 'Failed to delete user story',
  NOT_FOUND: 'User story not found',
};

export const COMMON_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  ACCESS_DENIED: (permission: string) => `Access denied. You don't have the permission: ${permission}`,
};
