import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import type { Auth } from '@/types/auth';

/**
 * Hook to check if the authenticated user has specific permissions.
 * Returns true for users without any role assigned (super admin behavior).
 */
export function usePermissions() {
    const { auth } = usePage<{ auth: Auth }>().props;

    return useMemo(() => {
        const permissions = auth.permissions ?? [];
        const roles = auth.roles ?? [];

        // If the user has no roles, they can access everything (super admin)
        const hasAllAccess = roles.length === 0;

        return {
            has: (permission: string) => hasAllAccess || permissions.includes(permission),
            hasAny: (perms: string[]) => hasAllAccess || perms.some(p => permissions.includes(p)),
            hasAll: (perms: string[]) => hasAllAccess || perms.every(p => permissions.includes(p)),
            canView: (resource: string) => hasAllAccess || permissions.includes(`viewAny ${resource}`) || permissions.includes(`view ${resource}`),
            canViewPage: (page: string) => hasAllAccess || permissions.includes(`view ${page}`),
        };
    }, [auth.permissions, auth.roles]);
}
