import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';

function Layout() {
  return (
    <div className="min-h-screen bg-page text-text">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-7xl px-4 pb-6 pt-2 text-xs text-text-muted sm:px-6 lg:px-8">
        Review Kantin · Temukan dan kelola warung kampus
      </footer>
    </div>
  );
}

export default Layout;
