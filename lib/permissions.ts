import { UserProfile } from './auth';

export type Role = 'admin' | 'editor' | 'viewer';

export interface Permission {
  canUpload: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canRead: boolean;
}

/**
 * Get permissions for a given role
 */
export function getRolePermissions(role?: string): Permission {
  switch (role) {
    case 'admin':
      return {
        canUpload: true,
        canEdit: true,
        canDelete: true,
        canManageUsers: true,
        canRead: true,
      };
    case 'editor':
      return {
        canUpload: true,
        canEdit: true,
        canDelete: false,
        canManageUsers: false,
        canRead: true,
      };
    case 'viewer':
      return {
        canUpload: false,
        canEdit: false,
        canDelete: false,
        canManageUsers: false,
        canRead: true,
      };
    default:
      return {
        canUpload: false,
        canEdit: false,
        canDelete: false,
        canManageUsers: false,
        canRead: false,
      };
  }
}

/**
 * Get permissions for a user profile
 */
export function getUserPermissions(user: UserProfile | null): Permission {
  if (!user) {
    return getRolePermissions();
  }
  return getRolePermissions(user.role);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: UserProfile | null,
  permission: keyof Permission
): boolean {
  const permissions = getUserPermissions(user);
  return permissions[permission];
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(user: UserProfile | null, ...roles: Role[]): boolean {
  if (!user || !user.role) {
    return false;
  }
  return roles.includes(user.role as Role);
}

/**
 * Require a specific permission (throws if not granted)
 * Use in API routes for permission validation
 */
export function requirePermission(
  user: UserProfile | null,
  permission: keyof Permission
): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Permission denied: ${permission} required`);
  }
}

/**
 * Require a specific role (throws if not granted)
 * Use in API routes for role validation
 */
export function requireRole(user: UserProfile | null, ...roles: Role[]): void {
  if (!hasRole(user, ...roles)) {
    throw new Error(`Role required: ${roles.join(' or ')}`);
  }
}
