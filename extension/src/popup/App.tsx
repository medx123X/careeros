import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthView } from '../components/AuthView';
import { ProfileView } from '../components/ProfileView';
import { PostManager } from '../components/PostManager';
import { PlatformDirectory } from '../components/PlatformDirectory';
import { QuickHome } from '../components/QuickHome';
import { WorkspaceShell, type View } from '../components/WorkspaceShell';

function App() {
  const { isLoading, isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState<View>('home');
  const [newPost, setNewPost] = useState(false);

  if (isLoading)
    return (
      <div className="app-loading" role="status">
        Loading CareerOS…
      </div>
    );
  if (!isAuthenticated) return <AuthView />;

  function navigate(view: View) {
    setNewPost(false);
    setActiveView(view);
  }

  function createPost() {
    setNewPost(true);
    setActiveView('posts');
  }

  return (
    <WorkspaceShell surface="popup" activeView={activeView} onNavigate={navigate}>
      {activeView === 'home' && (
        <QuickHome surface="popup" onNavigate={navigate} onNewPost={createPost} />
      )}
      {activeView === 'profile' && <ProfileView />}
      {activeView === 'posts' && <PostManager initialCreate={newPost} />}
      {activeView === 'platforms' && <PlatformDirectory />}
    </WorkspaceShell>
  );
}

export default App;
