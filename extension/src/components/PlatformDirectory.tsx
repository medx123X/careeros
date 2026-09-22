import { useState, useEffect } from 'react';
import { api } from '../shared/api';
import { useToast } from '../hooks/useToast';
import { PageHeader } from './ui';
import type { Platform, PlatformCategory } from '../shared/types';

export function PlatformDirectory() {
  const { info, error: showError } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [activeCategory, setActiveCategory] = useState<PlatformCategory>('job');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlatforms = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPlatforms(activeCategory);
      setPlatforms(data);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load platforms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, [activeCategory]);

  const handleOpenPlatform = (platform: Platform) => {
    if (platform.profile_url) {
      chrome.tabs.create({ url: platform.profile_url });
      info(`Opened ${platform.name}`);
    } else {
      showError('No URL configured for this platform');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="EXPLORE"
        title="Platforms"
        description="Jump to the places where you find your next opportunity."
      />

      <div className="flex gap-2" role="tablist">
        {(['job', 'freelance'] as PlatformCategory[]).map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-fast ${
              activeCategory === cat
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-background-secondary)]'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {platforms.length === 0 ? (
        <div className="card p-8 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto text-[var(--color-border)] mb-3"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <p className="text-[var(--color-text-muted)]">No {activeCategory} platforms configured</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Add platforms via the admin API
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {platforms.map((platform) => (
            <PlatformCard key={platform.id} platform={platform} onOpen={handleOpenPlatform} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformCard({ platform, onOpen }: { platform: Platform; onOpen: (p: Platform) => void }) {
  return (
    <button
      onClick={() => onOpen(platform)}
      className="card p-4 text-left group hover:border-[var(--color-accent)] transition-fast w-full"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-background-secondary)] flex items-center justify-center text-[var(--color-primary)]">
          {platform.logo ? (
            <img src={platform.logo} alt="" width="24" height="24" className="rounded" />
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--color-text)] truncate">{platform.name}</h3>
          <p className="text-xs text-[var(--color-text-muted)] truncate">
            {platform.profile_url || 'No URL configured'}
          </p>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </div>
    </button>
  );
}
