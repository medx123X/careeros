import { useState, useEffect } from 'react';

interface PostFormProps {
  onClose: () => void;
  onSubmit: (post: import('../shared/types').Post) => Promise<void>;
  initialPost?: import('../shared/types').Post | null;
}

export function PostForm({ onClose, onSubmit, initialPost }: PostFormProps) {
  const isEditing = !!initialPost;
  const [title, setTitle] = useState(initialPost?.title || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [hashtags, setHashtags] = useState(initialPost?.hashtags || '');
  const [links, setLinks] = useState(initialPost?.links || '');
  const [attachments, setAttachments] = useState(initialPost?.attachments || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title);
      setContent(initialPost.content);
      setHashtags(initialPost.hashtags || '');
      setLinks(initialPost.links || '');
      setAttachments(initialPost.attachments || '');
    }
  }, [initialPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        id: initialPost?.id || 0,
        user_id: 0,
        title: title.trim(),
        content: content.trim(),
        hashtags: hashtags.trim() || null,
        links: links.trim() || null,
        attachments: attachments.trim() || null,
        created_at: initialPost?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await onSubmit(postData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-[var(--color-white)] rounded-xl shadow-xl animate-slide-in">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between sticky top-0 bg-[var(--color-white)] z-10">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {isEditing ? 'Edit Post' : 'Create Post'}
          </h2>
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
              htmlFor="title"
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Title <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Enter post title..."
              required
              maxLength={255}
            />
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
              rows={8}
              placeholder="Write your post content here..."
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
              placeholder="#career #machinelearning #jobsearch"
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
              placeholder="https://linkedin.com/...&#10;https://github.com/..."
            />
          </div>

          <div>
            <label
              htmlFor="attachments"
              className="block text-sm font-medium text-[var(--color-text)] mb-1"
            >
              Attachments (file names or URLs, one per line)
            </label>
            <textarea
              id="attachments"
              value={attachments}
              onChange={(e) => setAttachments(e.target.value)}
              className="input"
              rows={2}
              placeholder="resume.pdf&#10;portfolio.png"
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
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
