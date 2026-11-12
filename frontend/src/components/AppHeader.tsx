import { LogIn, LogOut, UserPlus, UtensilsCrossed } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { btnPrimary, btnSecondary, btnSmall } from '../lib/ui';
import RoleBadge from './RoleBadge';

function AppHeader() {
  const { user, status, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-control bg-primary text-white"
            aria-hidden="true"
          >
            <UtensilsCrossed className="size-5" />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-text">Review Kantin</span>
        </Link>

        <nav aria-label="Navigasi utama">
          <NavLink
            to="/"
            end={false}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive ? 'bg-primary-soft text-primary' : 'text-text-muted hover:text-primary'
              }`
            }
          >
            Warung
          </NavLink>
        </nav>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {status === 'loading' ? (
            <span className="h-9 w-40 animate-pulse rounded-control bg-surface-muted" role="status" aria-label="Memeriksa sesi" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="max-w-40 truncate">{user.name}</span>
                <RoleBadge role={user.role} />
              </div>
              <button type="button" onClick={logout} className={`${btnSecondary} ${btnSmall}`}>
                <LogOut className="size-4" aria-hidden="true" />
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`${btnSecondary} ${btnSmall}`}>
                <LogIn className="size-4" aria-hidden="true" />
                Masuk
              </Link>
              <Link to="/register" className={`${btnPrimary} ${btnSmall}`}>
                <UserPlus className="size-4" aria-hidden="true" />
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
