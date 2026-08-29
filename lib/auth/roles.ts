export const AGENCY_ADMIN_ROLES = ['agency_super_admin', 'agency_manager'];

export function isAgencyAdmin(role?: string | null) {
  return Boolean(role && AGENCY_ADMIN_ROLES.includes(role));
}

export function isDirectOwner(role?: string | null) {
  return role === 'direct_owner';
}

export function roleLabel(role?: string | null) {
  if (role === 'direct_owner') {
    return 'Business owner';
  }
  return (role || '').replace(/_/g, ' ');
}
