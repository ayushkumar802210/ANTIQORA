import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Trash2, 
  ExternalLink, 
  RotateCcw, 
  Plus,
  FileCode,
  FileSpreadsheet,
  FileImage,
  FileArchive
} from 'lucide-react';
import { DownloadItem } from '../types';

interface DownloadsViewProps {
  onBack: () => void;
  downloads: DownloadItem[];
  onRemoveDownload: (id: string) => void;
  onClearCompletedDownloads: () => void;
  onAddDownload: (item: DownloadItem) => void;
  onRetryDownload: (id: string) => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  onBack,
  downloads,
  onRemoveDownload,
  onClearCompletedDownloads,
  onAddDownload,
  onRetryDownload
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredDownloads = downloads.filter(d => {
    if (filterType === 'all') return true;
    return d.fileType.toLowerCase() === filterType;
  });

  const handleTestDownload = () => {
    const testItem: DownloadItem = {
      id: 'dl_' + Date.now(),
      fileName: `Antiqora_Research_Export_${Math.floor(Math.random() * 900 + 100)}.pdf`,
      fileType: 'pdf',
      fileSize: '2.4 MB',
      downloadedAt: Date.now(),
      sourceUrl: 'https://antiqora.io/research/papers/quantum-ai.pdf',
      sourceDomain: 'antiqora.io',
      status: 'downloading',
      progress: 25
    };
    onAddDownload(testItem);

    // Simulate real progress
    let p = 25;
    const interval = setInterval(() => {
      p += 25;
      if (p >= 100) {
        clearInterval(interval);
        testItem.status = 'completed';
        testItem.progress = 100;
        // Trigger browser file download anchor
        const blob = new Blob([`ANTIQORA Research Paper Export\nDate: ${new Date().toISOString()}\n\nSample research overview dataset.`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = testItem.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }, 400);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
      case 'doc':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'code':
      case 'json':
        return <FileCode className="w-5 h-5 text-emerald-500" />;
      case 'csv':
      case 'data':
        return <FileSpreadsheet className="w-5 h-5 text-amber-500" />;
      case 'image':
      case 'png':
        return <FileImage className="w-5 h-5 text-cyan-500" />;
      default:
        return <Download className="w-5 h-5 text-cyan-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-in fade-in duration-200">
      
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="Back to Browser"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Browser</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-500" />
              <span>Downloads</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Sample Download</span>
            </button>

            {downloads.length > 0 && (
              <button
                onClick={onClearCompletedDownloads}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Completed</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl w-full flex-1 p-4 sm:p-8 space-y-6">
        
        {/* Info Banner & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Files downloaded via ANTIQORA are tracked here and saved directly to your device's browser download folder.
          </p>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['all', 'pdf', 'image', 'code', 'data'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  filterType === type
                    ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Download Items List */}
        {filteredDownloads.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
            <Download className="w-12 h-12 mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No downloads yet</h3>
            <p className="text-xs text-slate-500">Your downloaded files, PDFs, and exports will appear here.</p>
            <button
              onClick={handleTestDownload}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>Test Download File</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDownloads.map((dl) => (
              <div 
                key={dl.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm space-y-3 hover:border-cyan-500/30 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      {getFileIcon(dl.fileType)}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {dl.fileName}
                      </h4>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{dl.fileSize || 'Unknown size'}</span>
                        <span>·</span>
                        <span>{dl.sourceDomain}</span>
                        <span>·</span>
                        <span>{new Date(dl.downloadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {dl.status === 'completed' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                    {dl.status === 'downloading' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 animate-pulse">
                        <Download className="w-3.5 h-3.5" /> {dl.progress}%
                      </span>
                    )}
                    {dl.status === 'failed' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}

                    <button
                      onClick={() => window.open(dl.sourceUrl, '_blank')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Open source website"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    {dl.status === 'failed' && (
                      <button
                        onClick={() => onRetryDownload(dl.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Retry download"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onRemoveDownload(dl.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                      title="Remove from list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar for Downloading */}
                {dl.status === 'downloading' && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full transition-all duration-300" 
                      style={{ width: `${dl.progress}%` }} 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
