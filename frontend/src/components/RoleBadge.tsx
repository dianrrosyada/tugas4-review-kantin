import type { UserRole } from '../types/stall';

const styles: Record<UserRole, string> = {
  admin: 'bg-primary-soft text-primary',
  owner: 'bg-accent-soft text-accent',
  customer: 'bg-surface-muted text-text-muted',
};

const labels: Record<UserRole, string> = {
  admin: 'Admin',
  owner: 'Owner',
  customer: 'Customer',
};

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[role]}`}>
      {labels[role]}
    </span>
  );
}

export default RoleBadge;
