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

export const COMPANY_MESSAGES = {
  COMPANY_NOT_FOUND: 'Company not found',
};

export const ISSUE_MESSAGES = {
  CREATE_SUCCESS: 'Issue created successfully',
  CREATE_FAILED: 'Failed to create issue',
  FETCH_SUCCESS: 'Issues fetched successfully',
  FETCH_FAILED: 'Failed to fetch issues',
  UPDATE_SUCCESS: 'Issue updated successfully',
  UPDATE_FAILED: 'Failed to update issue',
  DELETE_SUCCESS: 'Issue deleted successfully',
  DELETE_FAILED: 'Failed to delete issue',
  NOT_FOUND: 'Issue not found',
  ASSIGN_UPDATE_SUCCESS: 'Assignment updated successfully',
  COMMENT_ADD_SUCCESS: 'Comment added successfully',
  ATTACHMENT_ADD_SUCCESS: 'Attachments added successfully',
  AUTO_ASSIGN_SUCCESS: 'Issue auto-assigned successfully',
};

export const COMMON_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  ACCESS_DENIED: (permission: string) => `Access denied. You don't have the permission: ${permission}`,
};

export const SPRINT_MESSAGES = {
  CREATE_SUCCESS: 'Sprint created successfully',
  CREATE_FAILED: 'Failed to create sprint',
  FETCH_SUCCESS: 'sprint fetched successfully',
  FETCH_FAILED: 'Failed to fetch sprint',
  UPDATE_SUCCESS: 'sprint updated successfully',
  UPDATE_FAILED: 'Failed to update sprint',
  DELETE_SUCCESS: 'sprint deleted successfully',
  DELETE_FAILED: 'Failed to delete sprint',
  NOT_FOUND: 'Sprint not found',
  COMPANY_CONTEXT_NOT_FOUND: 'Company context not found',
  VELOCITY_FETCH_SUCCESS: 'Velocity analytics fetched successfully',
};

export const SUBTASK_MESSAGES = {
  CREATE_SUCCESS: 'Sub-task created successfully',
  CREATE_FAILED: 'Failed to create sub-task',
  FETCH_SUCCESS: 'Sub-tasks fetched successfully',
  FETCH_FAILED: 'Failed to fetch sub-tasks',
  UPDATE_SUCCESS: 'Sub-task updated successfully',
  UPDATE_FAILED: 'Failed to update sub-task',
  DELETE_SUCCESS: 'Sub-task deleted successfully',
  DELETE_FAILED: 'Failed to delete sub-task',
  ASSIGN_SUCCESS: 'Sub-task assigned successfully',
  NOT_FOUND: 'Sub-task not found',
  AUTO_ASSIGN_SUCCESS: 'Auto-assigned successfully using AI',
  START_SUCCESS: 'Task started successfully',
  SUBMIT_SUCCESS: 'Task submitted for review',
  REVIEW_SUCCESS: 'Review completed',
  COMMENT_ADD_SUCCESS: 'Comment added successfully',
  ATTACHMENT_ADD_SUCCESS: 'Attachments added successfully',
};

export const TASK_MESSAGES = {
  CREATE_SUCCESS: 'Task created successfully',
  CREATE_FAILED: 'Failed to create task',
  FETCH_SUCCESS: 'Tasks fetched successfully',
  FETCH_FAILED: 'Failed to fetch tasks',
  UPDATE_SUCCESS: 'Task updated successfully',
  UPDATE_FAILED: 'Failed to update task',
  DELETE_SUCCESS: 'Task deleted successfully',
  DELETE_FAILED: 'Failed to delete task',
  ASSIGN_SUCCESS: 'Task assigned successfully',
  NOT_FOUND: 'Task not found',
};

export const UPLOAD_MESSAGES = {
  UPLOAD_SUCCESS: 'File uploaded successfully',
  UPLOAD_FAILED: 'File upload failed',
  NO_FILE_UPLOADED: 'No file uploaded',
  NO_FILES_UPLOADED: 'No files uploaded',
};

export const NOTIFICATION_MESSAGES = {
  FETCH_SUCCESS: 'Notifications fetched successfully',
  MARK_READ_SUCCESS: 'Notification marked as read',
  MARK_ALL_READ_SUCCESS: 'All notifications marked as read',
  NO_EMPLOYEE_FOUND: 'No employee found',
};
