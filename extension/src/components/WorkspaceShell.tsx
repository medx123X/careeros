import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

export type View = 'home' | 'profile' | 'posts' | 'documents' | 'platforms';

const labels: Record<View, string> = {
  home: 'Overview',
  profile: 'Profile',
  posts: 'Posts',
  documents: 'Documents',
  platforms: 'Platforms',
};

export function WorkspaceShell({
  surface,
  activeView,
  onNavigate,
  children,
}: {
  surface: 'popup' | 'sidebar';
  activeView: View;
  onNavigate: (view: View) => void;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const views: View[] =
    surface === 'popup'
      ? ['home', 'profile', 'posts', 'platforms']
      : ['home', 'profile', 'posts', 'documents', 'platforms'];

  return (
    <div className={`workspace workspace-${surface}`}>
      <header className="workspace-header">
        <button className="brand" onClick={() => onNavigate('home')} aria-label="CareerOS overview">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span>
            Career<span className="brand-light">OS</span>
          </span>
        </button>
        <div className="account-controls">
          <span className="account-email" title={user?.email}>
            {user?.email}
          </span>
          <button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </header>
      <nav className="workspace-nav" aria-label="Main navigation">
        {views.map((view) => (
          <button
            key={view}
            className={`nav-item ${activeView === view ? 'is-active' : ''}`}
            onClick={() => onNavigate(view)}
            aria-current={activeView === view ? 'page' : undefined}
          >
            {labels[view]}
          </button>
        ))}
      </nav>
      <main className="workspace-main">{children}</main>
    </div>
  );
}
