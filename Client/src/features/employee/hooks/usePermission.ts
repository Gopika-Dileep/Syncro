import { useSelector } from 'react-redux';
import { type RootState } from '@/store/store';

interface UsePermissionReturn {
    can: (key: string) => boolean;
    hasModuleAccess: (moduleName: string) => boolean;
    permissions: string[];
}

export const usePermission = (): UsePermissionReturn => {

    const user = useSelector((state: RootState) => state.auth.user);

    const permissions: string[] = user?.permissions || [];

    const can = (key: string): boolean => {
        if (user?.role === 'company') return true;
        return permissions.includes(key);
    };

    const hasModuleAccess = (moduleName: string): boolean => {
        if (user?.role === 'company') return true;
        return permissions.some(p => p.startsWith(`${moduleName}:`));
    };

    return {
        can,
        hasModuleAccess,
        permissions,
    };
};
