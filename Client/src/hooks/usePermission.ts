// Client/src/hooks/usePermission.ts
import { useSelector } from 'react-redux';
import { type RootState } from '@/store/store';

/**
 * Interface defining the return value of the usePermission hook.
 * Zero "any" types used for maximum safety.
 */
interface UsePermissionReturn {
    can: (key: string) => boolean;
    hasModuleAccess: (moduleName: string) => boolean;
    permissions: string[];
    isCompany: boolean;
}

/**
 * usePermission Hook
 * Central logic for handling RBAC permission checks across the UI.
 * This hook leverages the unified permissions stored in the Redux User object.
 */
export const usePermission = (): UsePermissionReturn => {
    // 1. Access the unified user object from the Auth state
    const user = useSelector((state: RootState) => state.auth.user);
    
    // 2. Safely extract the permission string array
    const permissions: string[] = user?.permissions || [];
    
    // 3. Simple boolean for checking if the current user represents a Company object
    const isCompany: boolean = user?.role === 'company';

    /**
     * Checks if a user has a specific granular permission key.
     * @param key - The exact permission key (e.g., 'project:create', 'task:view:all')
     */
    const can = (key: string): boolean => {
        // If logged in as a Company, bypass individual checks and return true
        if (isCompany) return true;
        
        // Return true if the user's permission array contains the requested key
        return permissions.includes(key);
    };

    /**
     * Checks if the user has AT LEAST one extra permission for a module
     * (Meaning they can see it in sidebar/navigate to it)
     * @param moduleName - The module (e.g., 'sprint', 'userStory')
     */
    const hasModuleAccess = (moduleName: string): boolean => {
        // Companies bypass checks
        if (isCompany) return true;
        
        // Return true if any one permission starts with the module name
        return permissions.some(p => p.startsWith(`${moduleName}:`));
    };

    return { 
        can, 
        hasModuleAccess, 
        permissions, 
        isCompany 
    };
};
