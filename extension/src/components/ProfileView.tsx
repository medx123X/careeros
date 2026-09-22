import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useToast } from '../hooks/useToast';
import { EditProfileForm } from './EditProfileForm';
import { PageHeader } from './ui';
import { api } from '../shared/api';

interface ProfileFieldProps {
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
  copyable?: boolean;
}

function ProfileField({ label, value, multiline = false, copyable = true }: ProfileFieldProps) {
  const { success } = useToast();

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    success(`Copied ${label.toLowerCase()}`);
  };

  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-[var(--color-border)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">{label}</p>
        <p className={`font-medium text-sm ${multiline ? 'whitespace-pre-wrap' : 'truncate'}`}>
          {value || <span className="text-[var(--color-text-muted)]">—</span>}
        </p>
      </div>
      {copyable && value && (
        <button
          onClick={handleCopy}
          className="btn btn-ghost btn-sm btn-icon flex-shrink-0"
          title="Copy to clipboard"
          aria-label={`Copy ${label}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      )}
    </div>
  );
}

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function ProfileSection({ title, children, icon }: ProfileSectionProps) {
  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h3 className="flex items-center gap-2 font-medium text-[var(--color-text)]">
          {icon && <span className="text-[var(--color-primary)]">{icon}</span>}
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ProfileAvatar({ name }: { name?: string | null }) {
  const initials =
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'CA';

  return (
    <div className="w-16 h-16 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white text-xl font-semibold">
      {initials}
    </div>
  );
}

export function ProfileView() {
  const { user } = useAuth();
  const {
    masterProfile,
    experiences,
    education,
    projects,
    certifications,
    documents,
    isLoading,
    error,
    refresh,
  } = useProfile();
  const [showEditModal, setShowEditModal] = useState(false);

  if (isLoading) {
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
        <button onClick={refresh} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const currentProfile = masterProfile;
  const hasProfile = masterProfile;

  if (!hasProfile) {
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center">
          <ProfileAvatar name={user?.email} />
          <h2 className="font-semibold text-[var(--color-text)] mt-4">No profile yet</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Create your master profile to get started
          </p>
          <button className="btn btn-primary mt-4" onClick={() => setShowEditModal(true)}>
            Create Master Profile
          </button>
        </div>
        {showEditModal && (
          <EditProfileForm
            onClose={() => setShowEditModal(false)}
            onSaved={refresh}
            initialProfile={masterProfile}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 profile-page">
      <PageHeader
        eyebrow="YOUR DETAILS"
        title="Profile"
        description="Review and copy the information you use most."
      />
      <div className="profile-identity card">
        <div className="flex items-center gap-3">
          <ProfileAvatar name={currentProfile?.full_name || masterProfile?.full_name} />
          <div>
            <h2 className="font-semibold text-[var(--color-text)]">
              {currentProfile?.full_name || masterProfile?.full_name || 'Unnamed Profile'}
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              {currentProfile?.job_title || masterProfile?.job_title || 'No title'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => setShowEditModal(true)}>
            Edit
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileSection title="Personal" icon={<PersonIcon />}>
          <ProfileField label="Full Name" value={currentProfile?.full_name} />
          <ProfileField label="Email" value={currentProfile?.email} />
          <ProfileField label="Phone" value={currentProfile?.phone} />
          <ProfileField label="Location" value={currentProfile?.location} />
          <ProfileField label="Website" value={currentProfile?.website} />
          <ProfileField label="LinkedIn" value={currentProfile?.linkedin} />
          <ProfileField label="GitHub" value={currentProfile?.github} />
        </ProfileSection>

        <ProfileSection title="Professional" icon={<BriefcaseIcon />}>
          <ProfileField label="Job Title" value={currentProfile?.job_title} />
          <ProfileField label="Bio" value={currentProfile?.bio} multiline />
          <ProfileField label="Skills" value={currentProfile?.skills} multiline />
        </ProfileSection>
      </div>

      {(experiences.length || education.length || projects.length || certifications.length) && (
        <div className="space-y-4">
          {experiences.length > 0 && (
            <ProfileSection title="Experience" icon={<BriefcaseIcon />}>
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <ExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>
            </ProfileSection>
          )}

          {education.length > 0 && (
            <ProfileSection title="Education" icon={<GraduationIcon />}>
              <div className="space-y-3">
                {education.map((edu) => (
                  <EducationCard key={edu.id} education={edu} />
                ))}
              </div>
            </ProfileSection>
          )}

          {projects.length > 0 && (
            <ProfileSection title="Projects" icon={<CodeIcon />}>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <ProjectCard key={proj.id} project={proj} />
                ))}
              </div>
            </ProfileSection>
          )}

          {certifications.length > 0 && (
            <ProfileSection title="Certifications" icon={<AwardIcon />}>
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <CertificationCard key={cert.id} certification={cert} />
                ))}
              </div>
            </ProfileSection>
          )}
        </div>
      )}

      {documents.length > 0 && (
        <ProfileSection title="Documents" icon={<FileIcon />}>
          <div className="space-y-2">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </ProfileSection>
      )}

      {showEditModal && (
        <EditProfileForm
          onClose={() => setShowEditModal(false)}
          onSaved={refresh}
          initialProfile={masterProfile}
        />
      )}
    </div>
  );
}

function ExperienceCard({ experience }: { experience: import('../shared/types').Experience }) {
  return (
    <div className="p-3 bg-[var(--color-background)] rounded-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{experience.position}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{experience.company}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {formatDate(experience.start_date)} –{' '}
            {experience.is_current ? 'Present' : formatDate(experience.end_date)}
          </p>
          {experience.description && (
            <p className="text-sm mt-1 line-clamp-2">{experience.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function EducationCard({ education }: { education: import('../shared/types').Education }) {
  return (
    <div className="p-3 bg-[var(--color-background)] rounded-lg">
      <p className="font-medium text-sm">{education.degree}</p>
      <p className="text-sm text-[var(--color-text-muted)]">{education.institution}</p>
      {education.field_of_study && (
        <p className="text-xs text-[var(--color-text-muted)]">{education.field_of_study}</p>
      )}
      <p className="text-xs text-[var(--color-text-muted)]">
        {formatDate(education.start_date)} – {formatDate(education.end_date)}
      </p>
    </div>
  );
}

function ProjectCard({ project }: { project: import('../shared/types').Project }) {
  return (
    <div className="p-3 bg-[var(--color-background)] rounded-lg">
      <p className="font-medium text-sm">{project.name}</p>
      {project.description && (
        <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">
          {project.description}
        </p>
      )}
      {project.technologies && (
        <p className="text-xs text-[var(--color-accent)] mt-1">{project.technologies}</p>
      )}
      {project.link && (
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-primary)] mt-1 inline-block"
        >
          View project →
        </a>
      )}
    </div>
  );
}

function CertificationCard({
  certification,
}: {
  certification: import('../shared/types').Certification;
}) {
  return (
    <div className="p-3 bg-[var(--color-background)] rounded-lg">
      <p className="font-medium text-sm">{certification.name}</p>
      <p className="text-sm text-[var(--color-text-muted)]">{certification.organization}</p>
      <p className="text-xs text-[var(--color-text-muted)]">{formatDate(certification.date)}</p>
      {certification.credential_url && (
        <a
          href={certification.credential_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-primary)] mt-1 inline-block"
        >
          View credential →
        </a>
      )}
    </div>
  );
}

function DocumentCard({ document }: { document: import('../shared/types').Document }) {
  const isCV =
    document.is_cv ||
    document.name.toLowerCase().includes('cv') ||
    document.name.toLowerCase().includes('resume');

  return (
    <div className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded-lg">
      <div className="flex items-center gap-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[var(--color-accent)]"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <div>
          <p className="font-medium text-sm flex items-center gap-2">
            {document.name}
            {isCV && (
              <span className="px-2 py-0.5 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
                CV
              </span>
            )}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {document.file_type.toUpperCase()} • {formatFileSize(document.file_size)}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="btn btn-secondary btn-sm"
          onClick={async () => {
            const blob = await api.downloadDocument(document.id);
            const url = URL.createObjectURL(blob);
            const link = globalThis.document.createElement('a');
            link.href = url;
            link.download = document.name;
            link.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          Download
        </button>
      </div>
    </div>
  );
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Icons
function PersonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 21V16a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5"></path>
      <path d="M7 7h10"></path>
      <path d="M9 3v4"></path>
      <path d="M15 3v4"></path>
    </svg>
  );
}
function GraduationIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  );
}
function AwardIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
    </svg>
  );
}
function FileIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
    </svg>
  );
}
