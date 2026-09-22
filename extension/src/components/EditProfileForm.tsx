import { useState } from 'react';
import { api } from '../shared/api';
import type { Profile } from '../shared/types';
import { Field } from './ui';

interface EditProfileFormProps {
  onClose: () => void;
  onSaved?: () => Promise<void> | void;
  initialProfile?: Profile | null;
}

export function EditProfileForm({ onClose, onSaved, initialProfile }: EditProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dirtyFields, setDirtyFields] = useState<Set<keyof Profile>>(() => new Set());

  const [formData, setFormData] = useState<Partial<Profile>>({
    full_name: initialProfile?.full_name ?? '',
    email: initialProfile?.email ?? '',
    phone: initialProfile?.phone ?? '',
    location: initialProfile?.location ?? '',
    website: initialProfile?.website ?? '',
    linkedin: initialProfile?.linkedin ?? '',
    github: initialProfile?.github ?? '',
    job_title: initialProfile?.job_title ?? '',
    bio: initialProfile?.bio ?? '',
    skills: initialProfile?.skills ?? '',
  });

  const handleChange = (field: keyof Profile, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setDirtyFields((previous) => new Set(previous).add(field));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (initialProfile) {
        const updates: Record<string, string | null> = {};
        for (const field of dirtyFields) {
          const value = formData[field];
          if (typeof value === 'string') updates[field] = value.trim() || null;
        }
        if (Object.keys(updates).length > 0) {
          await api.updateProfile('master', updates);
        }
      } else {
        const filledFields = Object.fromEntries(
          Object.entries(formData)
            .filter(([, value]) => typeof value === 'string' && value.trim() !== '')
            .map(([field, value]) => [field, (value as string).trim()])
        );
        await api.createProfile({ type: 'master', ...filledFields });
      }
      setSuccess(true);
      await onSaved?.();
      window.setTimeout(onClose, 700);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const profileExists = !!initialProfile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-[var(--color-white)] rounded-xl shadow-xl animate-slide-in">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between sticky top-0 bg-[var(--color-white)] z-10">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {profileExists ? 'Edit profile' : 'Create profile'}
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

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <p className="text-sm text-[var(--color-text-muted)]">
            Add what you know now. You can save the rest later.
          </p>
          {error && (
            <div className="text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 p-3 rounded-md">
              Profile saved successfully!
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <input
                type="text"
                value={formData.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="input"
                placeholder="John Doe"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input"
                placeholder="john@example.com"
              />
            </Field>

            <Field label="Phone">
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input"
                placeholder="+1 xxx xxx xxxx"
              />
            </Field>

            <Field label="Location">
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                className="input"
                placeholder="San Francisco, CA"
              />
            </Field>

            <Field label="Website">
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                className="input"
                placeholder="https://example.com"
              />
            </Field>

            <Field label="LinkedIn">
              <input
                type="url"
                value={formData.linkedin || ''}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className="input"
                placeholder="https://linkedin.com/in/username"
              />
            </Field>

            <Field label="GitHub">
              <input
                type="url"
                value={formData.github || ''}
                onChange={(e) => handleChange('github', e.target.value)}
                className="input"
                placeholder="https://github.com/username"
              />
            </Field>

            <Field label="Job Title">
              <input
                type="text"
                value={formData.job_title || ''}
                onChange={(e) => handleChange('job_title', e.target.value)}
                className="input"
                placeholder="Senior Software Engineer"
              />
            </Field>
          </div>

          <Field label="Bio" fullWidth>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="input"
              rows={4}
              placeholder="Write a brief professional bio..."
            />
          </Field>

          <Field label="Skills" fullWidth>
            <textarea
              value={formData.skills || ''}
              onChange={(e) => handleChange('skills', e.target.value)}
              className="input"
              rows={3}
              placeholder="Python • React • TypeScript • AWS • Docker"
            />
            <p className="text-xs text-[var(--color-text-muted)]">
              Separate skills with bullets or commas
            </p>
          </Field>

          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
