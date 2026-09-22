import { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import { PostForm } from './PostForm';
import { PostDetail } from './PostDetail';
import { Button, EmptyState, PageHeader } from './ui';

export function PostManager({ initialCreate = false }: { initialCreate?: boolean }) {
  const {
    posts,
    selectedPost,
    isLoading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    fetchPost,
    setSelectedPost,
  } = usePosts();
  const [showForm, setShowForm] = useState(initialCreate);
  const [editingPost, setEditingPost] = useState<import('../shared/types').Post | null>(null);

  const handleNewPost = () => {
    setEditingPost(null);
    setShowForm(true);
  };

  const handleEditPost = (post: import('../shared/types').Post) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleViewPost = async (postId: number) => {
    await fetchPost(postId);
    setShowForm(false);
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Delete this post?')) return;
    await deletePost(postId);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  const handleFormSubmit = async (postData: import('../shared/types').Post) => {
    if (editingPost) {
      await updatePost(editingPost.id, postData);
    } else {
      await createPost(postData);
    }
    setShowForm(false);
    setEditingPost(null);
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-[var(--color-error)] mb-4">{error}</p>
        <button onClick={fetchPosts} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="CONTENT LIBRARY"
        title="Your posts"
        description="Save ideas and reuse your best writing across platforms."
        action={
          <Button variant="primary" size="small" onClick={handleNewPost}>
            New post
          </Button>
        }
      />

      {showForm && (
        <PostForm onClose={handleFormClose} onSubmit={handleFormSubmit} initialPost={editingPost} />
      )}

      {!showForm && selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => {
            setSelectedPost(null);
            fetchPosts();
          }}
          onEdit={handleEditPost}
        />
      )}

      {!showForm && !selectedPost && (
        <div className={posts.length ? 'card' : ''}>
          <div className={posts.length ? 'p-3 space-y-2' : ''}>
            {posts.length === 0 ? (
              <EmptyState
                title="No posts yet"
                description="Capture your first idea and keep it ready to reuse."
                action={
                  <Button variant="primary" onClick={handleNewPost}>
                    Create post
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {posts.map((post) => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    onClick={() => handleViewPost(post.id)}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PostListItem({
  post,
  onClick,
  onEdit,
  onDelete,
}: {
  post: import('../shared/types').Post;
  onClick: () => void;
  onEdit: (post: import('../shared/types').Post) => void;
  onDelete: (postId: number) => void;
}) {
  return (
    <div
      className="post-list-item"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-[var(--color-text)] truncate">{post.title}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">{post.content}</p>
          {post.hashtags && (
            <p className="text-xs text-[var(--color-primary)] mt-1">{post.hashtags}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post);
            }}
            className="btn btn-ghost btn-sm btn-icon"
            title="Edit"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(post.id);
            }}
            className="btn btn-ghost btn-sm btn-icon text-[var(--color-error)]"
            title="Delete"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
