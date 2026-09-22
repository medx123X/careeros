import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { Document } from '../shared/types';
import { api } from '../shared/api';

interface DocumentPreviewProps {
  doc: Document;
  onClose: () => void;
}

export function DocumentPreview({ doc, onClose }: DocumentPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (doc.file_type.toLowerCase() !== 'pdf') {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    setPdf(null);
    setPageNumber(1);
    setError(null);
    setIsLoading(true);

    async function loadPdf() {
      try {
        const bytes = await api.previewDocument(doc.id);
        if (bytes.byteLength === 0) throw new Error("The stored PDF is empty");
        if (cancelled) return;

        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        loadingTask = pdfjs.getDocument({ data: bytes });
        const loadedPdf = await loadingTask.promise;
        if (cancelled) {
          await loadingTask.destroy();
          return;
        }
        setPdf(loadedPdf);
      } catch (cause) {
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : 'Could not preview this PDF');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPdf();
    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [doc.id, doc.file_type]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;
    let renderTask: RenderTask | null = null;

    async function renderPage() {
      try {
        setIsRendering(true);
        const page = await pdf!.getPage(pageNumber);
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;

        const availableWidth = Math.max(280, canvas.parentElement?.clientWidth ?? 700);
        const original = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({
          scale: Math.min(1.6, availableWidth / original.width),
        });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        renderTask = page.render({
          canvas,
          viewport,
          transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
        });
        await renderTask.promise;
      } catch (cause) {
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : 'Could not render this PDF');
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    }

    renderPage();
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, pageNumber]);

  async function handleDownload() {
    try {
      const blob = await api.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Download failed');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${doc.name}`}
    >
      <div className="w-full max-w-4xl max-h-[95vh] bg-[var(--color-white)] rounded-xl shadow-xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close preview">
              ×
            </button>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{doc.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {doc.file_type.toUpperCase()} · {formatFileSize(doc.file_size)}
              </p>
            </div>
          </div>
          <button onClick={handleDownload} className="btn btn-secondary btn-sm">
            Download
          </button>
        </div>

        {pdf && (
          <div className="flex items-center justify-center gap-3 p-2 border-b border-[var(--color-border)]">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPageNumber((page) => page - 1)}
              disabled={pageNumber <= 1 || isRendering}
              aria-label="Previous page"
            >
              ←
            </button>
            <span className="text-xs">
              Page {pageNumber} of {pdf.numPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPageNumber((page) => page + 1)}
              disabled={pageNumber >= pdf.numPages || isRendering}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-auto p-3 bg-[var(--color-background)] text-center">
          {isLoading && <p className="text-sm text-[var(--color-text-muted)]">Loading preview…</p>}
          {error && <div className="card p-4 text-sm text-[var(--color-error)]">{error}</div>}
          {doc.file_type.toLowerCase() !== 'pdf' && !error && (
            <div className="card p-4 text-sm">
              Preview is available for PDF files. Download this file to open it.
            </div>
          )}
          {pdf && (
            <canvas
              ref={canvasRef}
              className="mx-auto max-w-full bg-white shadow-sm"
              aria-label={`PDF page ${pageNumber}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
