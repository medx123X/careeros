import { useEffect, useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { api } from '../shared/api';
import { DocumentPreview } from './DocumentPreview';
import { PageHeader } from './ui';

const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx', '.txt'];

export function DocumentUpload() {
  const { uploadDocument, deleteDocument, documents } = useProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCvCheckbox, setShowCvCheckbox] = useState(false);
  const [isCv, setIsCv] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<import('../shared/types').Document | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError(`File type ${ext} not supported. Accepted: ${ACCEPTED_TYPES.join(', ')}`);
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setShowCvCheckbox(true);
    setError(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem('file') as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      await uploadDocument(file, isCv);
      input.value = '';
      setShowCvCheckbox(false);
      setIsCv(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocument(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleDownload = async (doc: import('../shared/types').Document) => {
    try {
      const blob = await api.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="YOUR FILES"
        title="Documents"
        description="Keep your CV and supporting files ready to use."
      />
      <form onSubmit={handleUpload} className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[var(--color-text)]">Upload Document</h3>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Select File (PDF, DOC, DOCX, TXT • Max 10MB)
          </label>
          <input
            type="file"
            name="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="input"
            disabled={isUploading}
            required
          />
        </div>

        {showCvCheckbox && (
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={isCv}
              onChange={(e) => setIsCv(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--color-text)]">Mark as CV/Resume</span>
          </label>
        )}

        {error && (
          <div className="text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isUploading || (!showCvCheckbox && !isUploading)}
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>

      {documents.length > 0 && (
        <div className="card">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <h3 className="font-medium text-[var(--color-text)]">Your Documents</h3>
          </div>
          <div className="p-4 space-y-2">
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                document={doc}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onPreview={setPreviewDoc}
              />
            ))}
          </div>
        </div>
      )}

      {previewDoc && <DocumentPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}

function DocumentItem({
  document,
  onDownload,
  onDelete,
  onPreview,
}: {
  document: import('../shared/types').Document;
  onDownload: (doc: import('../shared/types').Document) => void;
  onDelete: (id: number) => void;
  onPreview: (doc: import('../shared/types').Document) => void;
}) {
  const [dragFile, setDragFile] = useState<File | null>(null);
  const [dragData, setDragData] = useState<string | null>(null);
  const [dragError, setDragError] = useState(false);

  useEffect(() => {
    let active = true;
    setDragFile(null);
    setDragData(null);
    setDragError(false);
    api.getDocumentFile(document.id, document.name, document.file_type)
      .then(({ file, data }) => { if (active) { setDragFile(file); setDragData(data); } })
      .catch(() => { if (active) setDragError(true); });
    return () => { active = false; };
  }, [document.id, document.name, document.file_type]);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragFile || !dragData || !event.dataTransfer) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.clearData();
    event.dataTransfer.effectAllowed = 'copy';
    const dragId = crypto.randomUUID();
    event.dataTransfer.setData('text/plain', `careeros-file:${dragId}`);
    event.dataTransfer.items.add(dragFile);
    chrome.runtime.sendMessage({
      type: 'START_DOCUMENT_DRAG', dragId,
      file: { name: dragFile.name, type: dragFile.type, data: dragData },
    });
  };

  const isCV =
    document.is_cv ||
    document.name.toLowerCase().includes('cv') ||
    document.name.toLowerCase().includes('resume');
  const isPDF = document.file_type === 'pdf';

  return (
    <div className="flex items-center justify-between p-3 bg-[var(--color-background)] rounded-lg">
      <div
        className={`flex items-center gap-3 flex-1 min-w-0 ${isPDF ? 'cursor-pointer' : ''}`}
        onClick={isPDF ? () => onPreview(document) : undefined}
        role={isPDF ? 'button' : undefined}
        tabIndex={isPDF ? 0 : undefined}
        onKeyDown={
          isPDF
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onPreview(document);
                }
              }
            : undefined
        }
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[var(--color-accent)] flex-shrink-0"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate flex items-center gap-2">
            {document.name}
            {isCV && (
              <span className="px-2 py-0.5 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex-shrink-0">
                CV
              </span>
            )}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {document.file_type.toUpperCase()} • {formatFileSize(document.file_size)} | {dragFile ? 'Drag to upload' : dragError ? 'Drag unavailable' : 'Preparing drag...'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          draggable={Boolean(dragFile)}
          onDragStart={handleDragStart}
          onDragEnd={() => chrome.runtime.sendMessage({ type: 'END_DOCUMENT_DRAG' })}
          className={`btn btn-secondary btn-sm select-none ${dragFile ? 'cursor-grab active:cursor-grabbing' : 'opacity-50 cursor-default'}`}
          title={dragFile ? 'Drag the file to a website upload area' : dragError ? 'Could not prepare file' : 'Preparing file'}
          aria-label={dragFile ? `Drag ${document.name} to upload` : `Preparing ${document.name}`}
        >
          Drag file
        </div>
        {isPDF && (
          <button
            onClick={() => onPreview(document)}
            className="btn btn-secondary btn-sm"
            title="Preview"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        )}
        <button
          onClick={() => onDownload(document)}
          className="btn btn-secondary btn-sm"
          title="Download"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
        <button
          onClick={() => onDelete(document.id)}
          className="btn btn-ghost btn-sm btn-icon text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
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
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
