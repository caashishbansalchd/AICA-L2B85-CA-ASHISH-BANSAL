import React, { useState } from 'react';
import {
  Download,
  Terminal,
  Cpu,
  FileCode,
  CheckCircle2,
  X,
  HardDrive,
  FolderArchive,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  FileArchive,
} from 'lucide-react';

interface DesktopRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopRunnerModal: React.FC<DesktopRunnerModalProps> = ({ isOpen, onClose }) => {
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const exeUrl = `${originUrl}/IndianTaxCalculator.exe`;
  const zipUrl = `${originUrl}/IndianTaxCalculator-Windows.zip`;
  const batUrl = `${originUrl}/IndianTaxCalculator.bat`;

  // PowerShell one-liner for instant terminal download & execution
  const psExeCmd = `powershell -Command "Invoke-WebRequest -Uri '${exeUrl}' -OutFile \\"$HOME\\Downloads\\IndianTaxCalculator.exe\\"; Start-Process \\"$HOME\\Downloads\\IndianTaxCalculator.exe\\""`;
  const psZipCmd = `powershell -Command "Invoke-WebRequest -Uri '${zipUrl}' -OutFile \\"$HOME\\Downloads\\IndianTaxCalculator.zip\\"; Expand-Archive \\"$HOME\\Downloads\\IndianTaxCalculator.zip\\" -DestinationPath \\"$HOME\\Downloads\\IndianTaxCalculator\\" -Force; Start-Process \\"$HOME\\Downloads\\IndianTaxCalculator\\IndianTaxCalculator.exe\\""`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  // Resilient Blob Stream Downloader (bypasses iframe navigation/download blocks)
  const triggerStreamDownload = async (url: string, filename: string) => {
    setDownloadingFile(filename);
    setDownloadProgress(0);
    setDownloadError(null);

    try {
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status} ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        // Fallback to arrayBuffer if streaming reader is unavailable
        const blob = await response.blob();
        saveBlobLocally(blob, filename);
        return;
      }

      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.length;
          if (total > 0) {
            setDownloadProgress(Math.min(100, Math.round((loaded / total) * 100)));
          }
        }
      }

      const completeBlob = new Blob(chunks, { type: 'application/octet-stream' });
      saveBlobLocally(completeBlob, filename);
    } catch (err: any) {
      console.error('Blob download error, falling back to direct window open:', err);
      setDownloadError(err?.message || 'Download was blocked or interrupted');
      
      // Fallback: trigger standard browser top-level download
      const directA = document.createElement('a');
      directA.href = url;
      directA.download = filename;
      directA.target = '_blank';
      directA.rel = 'noopener noreferrer';
      document.body.appendChild(directA);
      directA.click();
      setTimeout(() => {
        if (document.body.contains(directA)) {
          document.body.removeChild(directA);
        }
      }, 1000);
    } finally {
      setTimeout(() => {
        setDownloadingFile(null);
      }, 1500);
    }
  };

  const saveBlobLocally = (blob: Blob, filename: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div
      id="desktop-runner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-slate-800 my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Standalone Windows Desktop Package (.EXE & .BAT)
              </h2>
              <p className="text-xs text-slate-300">
                100% Offline • Node.js Runtime & Rules Bundled • Zero Setup
              </p>
            </div>
          </div>
          <button
            id="btn-close-desktop-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Why browser blocked notice & Open in New Tab solution */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3 text-amber-900 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-950">
                  Did your browser block the .EXE download?
                </div>
                <div className="text-amber-800 text-[11px] leading-relaxed">
                  Web browsers (Chrome / Edge) frequently restrict downloading raw <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.exe</code> files from inside an embedded preview iframe.
                  Use the <strong>.ZIP Archive</strong> below (which downloads freely), or open this app in a new tab!
                </div>
              </div>
            </div>
            <button
              id="btn-open-new-tab"
              onClick={openInNewTab}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors shrink-0"
              title="Open app in a full browser tab without iframe restrictions"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Tab</span>
            </button>
          </div>

          {/* Active Download Progress Bar */}
          {downloadingFile && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>Preparing & Downloading {downloadingFile}...</span>
                </div>
                <span className="font-mono text-blue-700">{downloadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-blue-700">
                Streaming directly to your browser without leaving this page.
              </p>
            </div>
          )}

          {downloadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              <strong>Notice:</strong> {downloadError}. Direct fallback download was initiated.
            </div>
          )}

          {/* Primary Recommendation: .ZIP Archive (Safest for Windows) */}
          <div className="border-2 border-emerald-500/40 bg-emerald-50/40 rounded-xl p-4.5 relative shadow-xs">
            <div className="absolute -top-3 right-4 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Safest for Windows • No Browser Blocks
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileArchive className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-slate-900 text-sm">
                    IndianTaxCalculator-Windows.zip
                  </span>
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-semibold rounded">
                    ~14 MB Compressed
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                  Contains <code className="font-mono text-slate-800 font-bold">IndianTaxCalculator.exe</code>, <code className="font-mono text-slate-800">IndianTaxCalculator.bat</code>, and user guide.
                  Zip files bypass browser executable download warnings and extract cleanly on any PC.
                </p>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  id="btn-stream-download-zip"
                  onClick={() => triggerStreamDownload(zipUrl, 'IndianTaxCalculator-Windows.zip')}
                  disabled={Boolean(downloadingFile)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .ZIP</span>
                </button>
                <a
                  href="/IndianTaxCalculator-Windows.zip"
                  download="IndianTaxCalculator-Windows.zip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-[11px] text-emerald-700 hover:text-emerald-900 underline font-medium"
                >
                  Direct Link
                </a>
              </div>
            </div>
          </div>

          {/* Option 2: Standalone .EXE */}
          <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-slate-900 text-sm">IndianTaxCalculator.exe</span>
                  <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-800 font-mono font-semibold rounded">
                    ~36 MB Standalone
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                  Single-file portable Windows executable. Double-click to start the local web server and open the app in your browser automatically.
                </p>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  id="btn-stream-download-exe"
                  onClick={() => triggerStreamDownload(exeUrl, 'IndianTaxCalculator.exe')}
                  disabled={Boolean(downloadingFile)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .EXE</span>
                </button>
                <a
                  href="/IndianTaxCalculator.exe"
                  download="IndianTaxCalculator.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-[11px] text-blue-700 hover:text-blue-900 underline font-medium"
                >
                  Direct Link
                </a>
              </div>
            </div>
          </div>

          {/* Option 3: Lightweight .BAT Launcher */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-sm">IndianTaxCalculator.bat</span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 font-mono font-semibold rounded">
                    3 KB Fast Download
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                  Instantly downloads in 1 second. Checks for Node.js or automatically sets up a lightweight zero-install portable runtime on double-click.
                </p>
              </div>

              <button
                id="btn-stream-download-bat"
                onClick={() => triggerStreamDownload(batUrl, 'IndianTaxCalculator.bat')}
                disabled={Boolean(downloadingFile)}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .BAT</span>
              </button>
            </div>
          </div>

          {/* Bundled Prerequisites, Database & Utilities Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>All Required Softwares, Database & Utilities Pre-Bundled</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Prerequisite Software</span>
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Node.js v18 LTS runtime, embedded HTTP static server & automatic browser opener bundled. No admin or installer needed.
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Offline Database</span>
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  SQLite WebAssembly & local audit storage. Historical & future tax slabs (AY 2017-18 to 2031-32) bundled inside.
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-purple-900 flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-purple-600" />
                  <span>Bundled Utilities</span>
                </div>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Advance Tax calendar, 234A/B/C interest engines, ITR-U 140B calculator, PDF & Excel export, and Saved Reports history.
                </p>
              </div>
            </div>
          </div>

          {/* Option 4: Windows PowerShell 1-Click Command (Terminal Bypass) */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-900 text-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Windows PowerShell One-Liner (100% Guaranteed)
                </span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                No Browser Needed
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              If your browser restricts downloads altogether, open <strong>PowerShell</strong> in Windows and paste this command. It downloads and starts the app automatically:
            </p>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              <span className="truncate select-all">{psZipCmd}</span>
              <button
                id="btn-copy-ps-cmd"
                onClick={() => copyToClipboard(psZipCmd, 'ps')}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors shrink-0 flex items-center gap-1 text-[11px]"
                title="Copy PowerShell command"
              >
                {copiedKey === 'ps' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-sans font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Includes AY 2017-18 to 2031-32, FA 2025 87A rebate & all interest engines</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-semibold rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
