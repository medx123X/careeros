import { useState } from 'react';

interface PostVersionFormProps {
  onClose: () => void;
  onCreate: (version: {
    platform: string;
    content: string;
    hashtags?: string;
    links?: string;
  }) => Promise<void>;
}

export function PostVersionForm({ onClose, onCreate }: PostVersionFormProps) {
  const [platform, setPlatform] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [links, setLinks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!platform.trim()) {
      setError('Platform is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate({
        platform: platform.trim(),
        content: content.trim(),
        hashtags: hashtags.trim() || undefined,
        links: links.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create version');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-[var(--color-white)] rounded-xl shadow-xl animate-slide-in">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between sticky top-0 bg-[var(--color-white)] z-10">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">New Post Version</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Platform <span className="text-[var(--color-error)]">*</span>
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="input"
              required
            >
              <option value="">Select platform...</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Twitter/X">Twitter/X</option>
              <option value="Freelance">Freelance (Upwork/Fiverr)</option>
              <option value="Blog">Blog/Medium</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Content <span className="text-[var(--color-error)]">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input"
              rows={6}
              placeholder="Adapt the original post for this platform..."
              required
            />
          </div>

          <div>
            <label
              htmlFor="hashtags"
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Hashtags
            </label>
            <input
              id="hashtags"
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="input"
              placeholder="#linkedin #career #jobsearch"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Separate with spaces</p>
          </div>

          <div>
            <label
              htmlFor="links"
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Links (one per line)
            </label>
            <textarea
              id="links"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              className="input"
              rows={3}
              placeholder="https://linkedin.com/...&#10;https://portfolio.com/..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
