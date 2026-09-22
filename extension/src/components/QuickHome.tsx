import { useProfile } from '../hooks/useProfile';
import { useToast } from '../hooks/useToast';
import { api } from '../shared/api';
import type { View } from './WorkspaceShell';
import { Button, Card, PageHeader } from './ui';

export function QuickHome({
  surface,
  onNavigate,
  onNewPost,
}: {
  surface: 'popup' | 'sidebar';
  onNavigate: (view: View) => void;
  onNewPost: () => void;
}) {
  const { masterProfile, documents, isLoading, error, refresh } = useProfile();
  const { success, error: showError } = useToast();
  const cv =
    documents.find((doc) => doc.is_cv) ?? documents.find((doc) => /cv|resume/i.test(doc.name));
  const displayName = masterProfile?.full_name?.trim() || 'Your career workspace';
  const initials =
    masterProfile?.full_name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'C';
  const profileFields = [
    masterProfile?.full_name,
    masterProfile?.job_title,
    masterProfile?.bio,
    masterProfile?.location,
    masterProfile?.skills,
  ];
  const complete = profileFields.filter((field) => field?.trim()).length;

  async function copyBio() {
    if (!masterProfile?.bio) return;
    try {
      await navigator.clipboard.writeText(masterProfile.bio);
      success('Bio copied');
    } catch {
      showError('Could not copy your bio');
    }
  }

  async function downloadCv() {
    if (!cv) return;
    try {
      const blob = await api.downloadDocument(cv.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = cv.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      success('CV downloaded');
    } catch (cause) {
      showError(cause instanceof Error ? cause.message : 'Could not download your CV');
    }
  }

  async function openWorkspace() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found');
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close();
    } catch {
      showError('Could not open the sidebar on this page');
    }
  }

  return (
    <div className="home-content">
      <PageHeader
        eyebrow="YOUR WORKSPACE"
        title="Everything ready to reuse"
        description="Keep your best career details close while you browse."
      />
      {error ? (
        <Card className="status-card">
          <strong>Could not load your workspace</strong>
          <p>{error}</p>
          <Button size="small" onClick={refresh}>
            Try again
          </Button>
        </Card>
      ) : (
        <>
          <Card className="profile-summary">
            <div className="profile-summary-top">
              <span className="profile-summary-avatar" aria-hidden="true">
                {initials}
              </span>
              <div className="profile-summary-copy">
                <span className="eyebrow">MASTER PROFILE</span>
                <h3>{isLoading ? 'Loading profile…' : displayName}</h3>
                <p>{masterProfile?.job_title || 'Add a title that describes what you do'}</p>
              </div>
            </div>
            <div className="profile-progress">
              <span>{complete === 5 ? 'Profile ready' : `${complete} of 5 essentials added`}</span>
              <span>{Math.round((complete / 5) * 100)}%</span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${(complete / 5) * 100}%` }} />
            </div>
            <button className="text-action" onClick={() => onNavigate('profile')}>
              {masterProfile ? 'View profile' : 'Create profile'} <span aria-hidden="true">→</span>
            </button>
          </Card>

          <section className="quick-actions" aria-label="Quick actions">
            <div className="section-heading">
              <h3>Quick actions</h3>
              <span>One click away</span>
            </div>
            <div className="action-grid">
              <button
                className="action-tile"
                onClick={copyBio}
                disabled={!masterProfile?.bio || isLoading}
              >
                <span className="action-glyph">↗</span>
                <strong>Copy bio</strong>
                <small>{masterProfile?.bio ? 'Ready to paste' : 'Add a bio first'}</small>
              </button>
              <button className="action-tile" onClick={downloadCv} disabled={!cv || isLoading}>
                <span className="action-glyph">↓</span>
                <strong>Download CV</strong>
                <small>{cv ? cv.name : 'Upload a CV first'}</small>
              </button>
              <button className="action-tile" onClick={onNewPost}>
                <span className="action-glyph">＋</span>
                <strong>New post</strong>
                <small>Capture an idea</small>
              </button>
              <button className="action-tile" onClick={() => onNavigate('platforms')}>
                <span className="action-glyph">↗</span>
                <strong>Platforms</strong>
                <small>Job & freelance links</small>
              </button>
            </div>
          </section>
          {surface === 'popup' && (
            <button className="workspace-link" onClick={openWorkspace}>
              <span>
                <strong>Open full workspace</strong>
                <small>Use the sidebar for editing and documents</small>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          )}
          {surface === 'sidebar' && (
            <button className="workspace-link" onClick={() => onNavigate('documents')}>
              <span>
                <strong>Manage documents</strong>
                <small>Upload, preview and download your files</small>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
