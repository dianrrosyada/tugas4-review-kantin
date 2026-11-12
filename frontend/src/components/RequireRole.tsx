import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/stall';
import StatePanel from './StatePanel';

interface RequireRoleProps {
  roles: UserRole[];
  children: ReactNode;
}

/** Penjaga rute: belum login -> ke /login (ingat tujuan); login tapi role salah -> panel 403. */
function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <StatePanel variant="loading" />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'login-required' }} />;
  }

  if (!roles.includes(user.role)) {
    return (
      <StatePanel
        variant="forbidden"
        message={`Halaman ini hanya untuk role: ${roles.join(', ')}. Akunmu berperan ${user.role}.`}
        actionLabel="Kembali ke daftar warung"
        actionTo="/"
      />
    );
  }

  return <>{children}</>;
}

export default RequireRole;
