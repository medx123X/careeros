import { useState, useEffect, useCallback } from 'react';
import { api } from '../shared/api';
import type { Post, PostVersion } from '../shared/types';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postVersions, setPostVersions] = useState<PostVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPost = useCallback(async (postId: number) => {
    try {
      const post = await api.getPost(postId);
      setSelectedPost(post);
      const versions = await api.getPostVersions(postId);
      setPostVersions(versions);
      return post;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (
    postData: Omit<Post, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createPost(postData);
    setPosts((prev) => [created, ...prev]);
    return created;
  };

  const updatePost = async (postId: number, data: Partial<Post>) => {
    const updated = await api.updatePost(postId, data);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    if (selectedPost?.id === postId) {
      setSelectedPost(updated);
    }
    return updated;
  };

  const deletePost = async (postId: number) => {
    await api.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
      setPostVersions([]);
    }
  };

  const createVersion = async (
    postId: number,
    versionData: Omit<PostVersion, 'id' | 'post_id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await api.createPostVersion(postId, versionData);
    setPostVersions((prev) => [created, ...prev]);
    return created;
  };

  const copyPostContent = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  return {
    posts,
    selectedPost,
    postVersions,
    isLoading,
    error,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    createVersion,
    copyPostContent,
    setSelectedPost,
    setPostVersions,
  };
}
