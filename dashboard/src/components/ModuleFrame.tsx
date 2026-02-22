"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  tabId: string;
  port: number;
  label: string;
  emoji: string;
}

export default function ModuleFrame({ tabId, port, label, emoji }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Use same hostname as current page
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    setBaseUrl(`http://${host}:${port}`);
    setLoading(true);
    setError(false);
  }, [port]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(false);
    if (iframeRef.current) {
      iframeRef.current.src = baseUrl;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Module header */}
      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>Mission Control</span>
          <span className="text-[var(--border-light)]">/</span>
          <span className="text-[var(--text-primary)] font-semibold flex items-center gap-1">
            <span>{emoji}</span> {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} />
          </button>
          <a
            href={baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 relative bg-[var(--bg-primary)]">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10 bg-[var(--bg-primary)]"
            >
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                <span className="text-xs text-[var(--text-muted)]">Loading {label}...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">{label} is not responding</p>
              <p className="text-[11px] text-[var(--text-muted)] mb-3">Make sure the service is running on port {port}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-1.5 rounded-lg text-xs bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          baseUrl && (
            <iframe
              ref={iframeRef}
              src={baseUrl}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleError}
              allow="clipboard-read; clipboard-write"
            />
          )
        )}
      </div>
    </div>
  );
}
