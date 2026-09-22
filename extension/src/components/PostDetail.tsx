import { useState, useEffect } from 'react';
import { usePosts } from '../hooks/usePosts';
import { PostVersionForm } from './PostVersionForm';

interface PostDetailProps {
  post: import('../shared/types').Post;
  onClose: () => void;
  onEdit: (post: import('../shared/types').Post) => void;
}

export function PostDetail({ post, onClose, onEdit }: PostDetailProps) {
  const { postVersions, fetchPost, createVersion, copyPostContent } = usePosts();
  const [activeVersion, setActiveVersion] = useState<'original' | string>('original');
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchPost(post.id);
  }, [post.id, fetchPost]);

  const handleCopy = async (content: string, label: string) => {
    await copyPostContent(content);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const getCurrentContent = () => {
    if (activeVersion === 'original') return post.content;
    const version = postVersions.find((v) => v.id === parseInt(activeVersion));
    return version?.content || post.content;
  };

  const getCurrentHashtags = () => {
    if (activeVersion === 'original') return post.hashtags;
    const version = postVersions.find((v) => v.id === parseInt(activeVersion));
    return version?.hashtags;
  };

  const getCurrentLinks = () => {
    if (activeVersion === 'original') return post.links;
    const version = postVersions.find((v) => v.id === parseInt(activeVersion));
    return version?.links;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 animate-fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-auto bg-[var(--color-white)] rounded-xl shadow-xl animate-slide-in">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between sticky top-0 bg-[var(--color-white)] z-10">
          <div className="flex items-center gap-3">
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
            <div>
              <h2 className="font-semibold text-[var(--color-text)] truncate max-w-[300px]">
                {post.title}
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">Original post</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(post)} className="btn btn-secondary btn-sm">
              Edit
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-4">
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
              Version
            </span>
            <select
              value={activeVersion}
              onChange={(e) => setActiveVersion(e.target.value)}
              className="input py-1 px-2 text-sm flex-1 max-w-xs"
            >
              <option value="original">Original</option>
              {postVersions.map((v) => (
                <option key={v.id} value={String(v.id)}>
                  {v.platform} ({v.hashtags ? v.hashtags.slice(0, 20) + '...' : 'No hashtags'})
                </option>
              ))}
            </select>
            {postVersions.length > 0 && (
              <button onClick={() => setShowVersionForm(true)} className="btn btn-primary btn-sm">
                + New Version
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                Content
              </label>
              <div className="bg-[var(--color-background)] rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-auto whitespace-pre-wrap text-sm">
                {getCurrentContent() || (
                  <span className="text-[var(--color-text-muted)]">No content</span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleCopy(getCurrentContent() || '', 'Content')}
                  className={`btn btn-secondary btn-sm ${copied === 'Content' ? 'text-[var(--color-success)]' : ''}`}
                >
                  {copied === 'Content' ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                  Copy
                </button>
              </div>
            </div>

            {getCurrentHashtags() && (
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Hashtags
                </label>
                <div className="bg-[var(--color-background)] rounded-lg p-3 text-sm flex flex-wrap gap-1">
                  {getCurrentHashtags()!
                    .split(' ')
                    .map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleCopy(getCurrentHashtags() || '', 'Hashtags')}
                    className={`btn btn-ghost btn-sm btn-icon ${copied === 'Hashtags' ? 'text-[var(--color-success)]' : ''}`}
                    title={copied === 'Hashtags' ? 'Copied!' : 'Copy hashtags'}
                  >
                    {copied === 'Hashtags' ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {getCurrentLinks() && (
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Links
                </label>
                <div className="bg-[var(--color-background)] rounded-lg p-3 space-y-1">
                  {getCurrentLinks()!
                    .split('\n')
                    .filter(Boolean)
                    .map((link, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[var(--color-primary)] truncate flex-1"
                        >
                          {link}
                        </a>
                        <button
                          onClick={() => handleCopy(link, `Link ${i + 1}`)}
                          className={`btn btn-ghost btn-xs btn-icon ${copied === `Link ${i + 1}` ? 'text-[var(--color-success)]' : ''}`}
                          title={copied === `Link ${i + 1}` ? 'Copied!' : 'Copy link'}
                        >
                          {copied === `Link ${i + 1}` ? (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {showVersionForm && (
            <PostVersionForm
              onClose={() => setShowVersionForm(false)}
              onCreate={async (version) => {
                await createVersion(post.id, {
                  ...version,
                  hashtags: version.hashtags || null,
                  links: version.links || null,
                });
                setShowVersionForm(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
