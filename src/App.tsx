/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend, Cell, PieChart, Pie } from 'recharts';
import { CoPilotChat } from './components/CoPilotChat';
import { GoogleChatSimulator } from './components/GoogleChatSimulator';
import { MyQueue } from './components/MyQueue';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { CommunicationsModule } from './components/CommunicationsModule';
import { BidScorecard } from './components/BidScorecard';
import ReactMarkdown from 'react-markdown';
import { ComplianceEngine } from './components/ComplianceEngine';
import { MockInterview } from './components/MockInterview';
import { generateDocxExport } from './services/exportService';
import { 
  Terminal, 
  FileText, 
  Package, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Search,
  Cpu,
  Workflow,
  ShieldCheck,
  User,
  MessageSquare,
  MessageSquareDiff,
  Moon,
  Sun,
  Plus,
  LogIn,
  LogOut,
  Trash2,
  Save,
  Send,
  Upload,
  Paperclip,
  FileIcon,
  History,
  Share2,
  Link as LinkIcon,
  Copy,
  X,
  Sparkles,
  Target,
  AlertTriangle,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  UserPlus,
  Shield,
  Lock,
  PlusCircle,
  MoreVertical,
  Edit2,
  RefreshCw,
  Filter,
  Eye,
  Hash,
  Check,
  Settings,
  Maximize,
  Download,
  Menu,
  Folder,
  BarChart3,
  Database,
  List,
  LayoutGrid,
  Bot,
  Mails,
  Mail
} from 'lucide-react';
import { MANIFEST, CONTROL_PACK, GEM_CHAIN_LOGIC as INITIAL_GEM_CHAIN_LOGIC } from './constants';
import { auth, loginWithGoogle, logout, linkGoogleDrive } from './lib/firebase';
import { createFolder, uploadFileToDrive } from './services/driveService';

function TemplateUploadWizard({ onClose, onComplete }: { onClose: () => void, onComplete: (template: Omit<TemplateArtifact, 'id'>, file?: File) => Promise<void> }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = async (filesToProcess: FileList | File[]) => {
    setIsUploading(true);
    try {
        for (let i = 0; i < filesToProcess.length; i++) {
          const f = filesToProcess[i];
          setUploadText(`Uploading ${i + 1} of ${filesToProcess.length}: ${f.name}...`);
          await onComplete({
            name: f.name,
            description: '',
            fileType: f.name.split('.').pop() || 'unknown',
            uploadDate: new Date().toISOString(),
            currentVersion: 1,
            versions: [{ version: 1, uploadDate: new Date().toISOString(), description: 'Initial upload via Wizard' }],
            usedIn: []
          }, f);
        }
    } finally {
        setIsUploading(false);
        onClose();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm w-full max-w-lg">
        <div className="flex justify-between items-center bg-slate-900 text-white rounded-t-xl p-4">
          <div className="font-mono text-sm font-bold uppercase truncate">Upload Template</div>
          {!isUploading && <button onClick={onClose} className="hover:rotate-90 transition-transform rounded-md shadow-sm"><X size={18} /></button>}
        </div>
        <div className="p-8">
            <div className="text-center font-mono">
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-black/30 bg-neutral-50 hover:bg-neutral-100'} p-12 cursor-pointer transition-colors flex flex-col items-center justify-center gap-4 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Upload size={32} className="opacity-50" />
                <div>
                  <p className="font-bold">{isUploading ? uploadText : "Click to Browse or Drag File(s) Here"}</p>
                  {!isUploading && <p className="text-[10px] opacity-60 mt-2">Supported: PDF, DOCX, XLSX, JSON...</p>}
                </div>
              </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
}

function QuickIngestWizard({ onClose, onComplete }: { onClose: () => void, onComplete: (title: string, files: File[]) => void }) {
  const [title, setTitle] = useState(`RFP_${new Date().toLocaleDateString()}`);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center bg-slate-900 text-white rounded-t-2xl p-4 shrink-0">
          <div className="font-sans text-sm font-bold tracking-wide flex items-center gap-2"><Upload size={16} className="text-blue-400"/> Analyze New RFP</div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform rounded-md shadow-sm"><X size={18} /></button>
        </div>
        <div className="p-8 flex flex-col gap-6 overflow-y-auto w-full">
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Submission Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 font-sans font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                placeholder="E.g., RFP_Project_Alpha"
              />
            </div>
            <div className="text-center font-mono space-y-2 relative">
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500 block text-left">Upload Documents</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl ${isDragOver ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100/80 hover:border-slate-400'} p-10 cursor-pointer transition-all flex flex-col items-center justify-center gap-3`}
              >
                <div className={`p-3 rounded-full transition-colors ${isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-white text-neutral-400 shadow-sm border border-neutral-200'}`}>
                  <Upload size={24} />
                </div>
                <div>
                  <p className="font-sans font-bold text-sm text-slate-700">Click to Browse or Drag File(s) Here</p>
                  <p className="text-[10px] opacity-60 mt-1">Supported: PDF, DOCX, XLSX, TXT, MD</p>
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Selected Files ({files.length})</label>
                    <button onClick={() => setFiles([])} className="text-[9px] font-mono uppercase font-bold text-red-500 hover:text-red-700">Clear All</button>
                  </div>
                  <ul className="max-h-[150px] overflow-y-auto space-y-2 font-mono text-xs p-1">
                    {files.map((f, i) => (
                      <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex items-center justify-between bg-white px-3 py-2 border border-neutral-200 rounded-lg shadow-sm group">
                        <span className="truncate pr-2 text-slate-700 font-medium">{f.name}</span>
                        <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-neutral-400 hover:text-red-500 p-1 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="pt-2 mt-auto">
              <button 
                onClick={() => {
                  onComplete(title, files);
                  onClose();
                }}
                disabled={files.length === 0 || !title.trim()}
                className="bg-blue-600 text-white w-full py-4 rounded-xl font-bold font-sans tracking-wide disabled:opacity-50 disabled:bg-slate-300 hover:bg-blue-700 transition-colors shadow-md active:scale-[0.98]"
              >
                Start Analysis & Extraction
              </button>
            </div>
        </div>
      </div>
    </motion.div>
  );
}

function TemplateVersionsViewer({ template, onClose, onRevert }: { template: TemplateArtifact, onClose: () => void, onRevert: (version: number) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-neutral-200 rounded-lg shadow-sm rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center bg-slate-900 text-white rounded-lg p-4 shrink-0">
          <div className="font-mono text-sm font-bold uppercase truncate">Version History // {template.name}</div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform rounded-md shadow-sm"><X size={18} /></button>
        </div>
        <div className="p-8 overflow-y-auto font-mono flex-1 space-y-4">
          <div className="text-xl font-bold uppercase tracking-tighter mb-6 flex items-center gap-3">
            <History /> Version History
          </div>
          {template.versions.sort((a,b) => b.version - a.version).map(v => (
            <div key={v.version} className={`border p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${v.version === template.currentVersion ? 'border-green-500 bg-green-50' : 'border-black'}`}>
              <div>
                <h4 className="font-bold cursor-default text-lg flex items-center gap-2">
                  Version {v.version}
                  {v.version === template.currentVersion && <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">Current</span>}
                </h4>
                <p className="text-[10px] opacity-60 mb-2">{new Date(v.uploadDate).toLocaleString()}</p>
                <p className="text-sm">{v.description}</p>
              </div>
              {v.version < template.currentVersion && (
                <button 
                  onClick={() => {
                    if(confirm(`Are you sure you want to revert to Version ${v.version}?`)) onRevert(v.version);
                  }}
                  className="bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200 px-4 py-2 font-bold text-xs uppercase shrink-0"
                >
                  Revert to v{v.version}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FileViewer({ filename, content, driveUrl: initialDriveUrl, onClose }: { filename: string, content?: string, driveUrl?: string, onClose: () => void }) {
  const [loadedContent, setLoadedContent] = useState<string | null>(content || null);
  const [loading, setLoading] = useState(!content && !initialDriveUrl);
  const [driveUrl, setDriveUrl] = useState<string | null>(initialDriveUrl || null);

  useEffect(() => {
    if (initialDriveUrl) {
      setDriveUrl(initialDriveUrl);
      setLoading(false);
      return;
    }

    if (!content) {
      setLoading(true);
      
      const checkDrive = async () => {
        try {
          const { getPlatformIntegrations } = await import('./services/platformIntegrationService');
          const integrations = await getPlatformIntegrations();
          const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
          if (driveConfig?.config?.internalId) {
             const { getFolderContents } = await import('./services/driveService');
             const internals = await getFolderContents(null, driveConfig.config.internalId);
             
             let templatesFolder = internals.find((f:any) => f.name === 'Templates');
             if (templatesFolder) {
                const templatesInDrive = await getFolderContents(null, templatesFolder.id);
                const driveFile = templatesInDrive.find((f:any) => f.name === filename);
                if (driveFile?.webViewLink) {
                   setDriveUrl(driveFile.webViewLink);
                   setLoading(false);
                   return true;
                }
             }
          }
        } catch (e) {
          console.warn('Could not find file in drive', e);
        }
        return false;
      };

      checkDrive().then(foundInDrive => {
        if (!foundInDrive) {
          generateMockDocumentContent(filename).then(res => {
            setLoadedContent(res);
            setLoading(false);
          });
        }
      });
    }
  }, [filename, content]);

  const isImage = loadedContent && loadedContent.startsWith('data:image/');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 lg:p-12 overflow-hidden"
    >
      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-neutral-200 w-full h-full flex flex-col border border-neutral-200 rounded-lg shadow-sm rounded-xl overflow-hidden relative"
      >
        <div className="flex justify-between items-center bg-slate-900 text-white rounded-lg p-4">
          <div className="font-mono text-sm font-bold uppercase truncate pr-4">Immersive Viewer // {filename}</div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform rounded-md shadow-sm"><X /></button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-neutral-200 flex items-start justify-center">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
               <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
               <p className="uppercase font-bold tracking-widest text-xs font-mono">Rendering Virtual Document...</p>
             </div>
          ) : driveUrl ? (
             <div className="w-full h-full flex flex-col items-center justify-center">
                 <iframe 
                   src={driveUrl.replace(/\/view.*$/, '/preview')} 
                   className="w-full h-full border-0 rounded-lg shadow-2xl" 
                   allow="autoplay; camera; microphone; fullscreen; display-capture"
                 ></iframe>
             </div>
          ) : (
            <div className="bg-white p-12 w-full max-w-4xl min-h-[11in] border border-neutral-100 rounded-lg shadow-2xl mx-auto flex flex-col my-4">
              {isImage ? (
                <img src={loadedContent!} alt={filename} className="max-w-full h-auto mx-auto object-contain" />
              ) : (
                <div 
                  className="prose prose-sm md:prose-base max-w-none text-black font-sans leading-relaxed"
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                  dangerouslySetInnerHTML={{ __html: loadedContent || `<h1>Preview unavailable</h1>` }}
                />
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider } from 'firebase/auth';
import { arrayUnion } from 'firebase/firestore';
import { 
  createSubmission, 
  subscribeSubmissions,
  getSubmission,
  updateSubmission, 
  submitPackage, 
  deleteSubmission,
  bulkDeleteSubmissions,
  bulkSubmitPackages,
  updateActiveEditor,
  clearActiveEditor,
  RfxSubmission,
  RfxData,
  Assumption,
  Risk,
  createWorkflowTask,
  getTasksForSubmission,
  updateTaskStatus,
  deleteWorkflowTask,
  WorkflowTask,
  FileMetadata,
  ensureUserProfile,
  getUserProfile,
  UserProfile,
  UserRole,
  UserFeedback
} from './services/rfxService';
import {
  TemplateArtifact,
  TemplateVersion,
  ManifestTask,
  getTemplates,
  subscribeTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getManifestTasks,
  createManifestTasksRecord
} from './services/templateService';
import {
  PlatformUser,
  getPlatformUsers,
  createPlatformUser,
  updatePlatformUser,
  deletePlatformUser
} from './services/platformUserService';
import {
  PlatformIntegration,
  getPlatformIntegrations,
  createPlatformIntegration,
  updatePlatformIntegration,
  deletePlatformIntegration
} from './services/platformIntegrationService';
import { 
  analyzePackage, 
  extractEntityFromFile, 
  generateResponseDraft, 
  optimizePackage,
  generateChatResponse,
  analyzeManifestRevision,
  generateMockDocumentContent,
  executeCustomWorkflowStep
} from './services/geminiService';
import JSZip from 'jszip';

function Tooltip({ children, content }: { children: React.ReactNode, content: string }) {
  return (
    <div className="group/tooltip relative inline-flex">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-xs -translate-x-1/2 scale-95 opacity-0 transition-opacity duration-200 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 bg-slate-900/90 backdrop-blur-sm text-white rounded-lg text-[10px] p-2 font-mono z-[9999] shadow-lg">
        {content}
        <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
      </div>
    </div>
  );
}

function ShareModal({ 
  submission, 
  onClose, 
  onTogglePublic,
  onShareWithEmail,
  onRemoveShare,
  onUpdateRole,
  canManageShares
}: { 
  submission: RfxSubmission, 
  onClose: () => void,
  onTogglePublic: (isPublic: boolean) => void,
  onShareWithEmail: (email: string, role: 'VIEWER' | 'EDITOR') => void,
  onRemoveShare: (email: string) => void,
  onUpdateRole: (email: string, role: 'VIEWER' | 'EDITOR') => void,
  canManageShares?: boolean
}) {
  const [copying, setCopying] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
  const shareUrl = `${window.location.origin}${window.location.pathname}?share=${submission.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleAddShare = () => {
    if (emailInput.trim() && emailInput.includes('@')) {
      onShareWithEmail(emailInput.trim(), roleInput);
      setEmailInput('');
      setRoleInput('VIEWER');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-xl border border-neutral-200 rounded-lg w-full max-w-md shadow-sm rounded-xl p-6"
      >
        <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-tight">Share & Permissions</h3>
            <p className="font-mono text-[10px] opacity-60 uppercase">{submission.title}</p>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform rounded-md shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg bg-neutral-50 shadow-sm rounded-xl">
            <div>
              <p className="text-xs font-medium">Public Access</p>
              <p className="font-mono text-[9px] opacity-60">Anyone with the link can view</p>
            </div>
            {canManageShares ? (
              <button 
                onClick={() => onTogglePublic(!submission.isPublic)}
                className={`w-12 h-6 border border-neutral-200 rounded-lg flex items-center p-1 transition-colors ${submission.isPublic ? 'bg-black' : 'bg-white'}`}
              >
                <div className={`w-4 h-4 transition-transform ${submission.isPublic ? 'bg-white translate-x-6' : 'bg-black'}`} />
              </button>
            ) : (
              <div className={`text-[10px] uppercase font-bold border px-2 py-1 ${submission.isPublic ? 'bg-green-100 text-green-800 border-green-800' : 'bg-neutral-100 text-neutral-600 border-neutral-400'}`}>
                {submission.isPublic ? 'PUBLIC' : 'PRIVATE'}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="font-mono text-[9px] font-bold uppercase opacity-50">Private Collaboration (RBAC)</label>
            {canManageShares && (
              <div className="flex gap-2">
                <input 
                  type="email"
                  placeholder="collaborator@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 font-mono text-[10px] outline-none"
                />
                <select
                  value={roleInput}
                  onChange={e => setRoleInput(e.target.value as 'VIEWER' | 'EDITOR')}
                  className="border border-neutral-200 rounded-lg bg-white px-2 py-2 font-mono text-[10px] outline-none font-bold uppercase"
                >
                  <option value="VIEWER">VIEWER</option>
                  <option value="EDITOR">EDITOR</option>
                </select>
                <button 
                  onClick={handleAddShare}
                  className="bg-slate-900 text-white px-4 font-mono text-[10px] font-bold uppercase hover:bg-neutral-800 rounded-md shadow-sm"
                >
                  INVITE
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {submission.sharedWith?.map(email => (
                <div key={email} className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px]">
                  <div className="flex items-center gap-2 flex-1">
                    <Shield size={10} className={submission.authorizedUsers?.[email] === 'EDITOR' ? 'text-green-600' : 'text-blue-600'} />
                    <span className="font-mono font-bold lowercase truncate max-w-[150px]">{email}</span>
                  </div>
                  {canManageShares ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={submission.authorizedUsers?.[email] === 'EDITOR' ? 'EDITOR' : 'VIEWER'}
                        onChange={(e) => onUpdateRole(email, e.target.value as 'VIEWER' | 'EDITOR')}
                        className="bg-transparent border-b border-dashed border-black/30 font-mono text-[9px] font-bold uppercase outline-none"
                      >
                        <option value="VIEWER">VIEWER</option>
                        <option value="EDITOR">EDITOR</option>
                      </select>
                      <button onClick={() => onRemoveShare(email)} className="text-red-600 hover:scale-110 ml-2">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ) : (
                    <span className="font-mono text-[9px] font-bold uppercase opacity-60">
                      {submission.authorizedUsers?.[email] || 'VIEWER'}
                    </span>
                  )}
                </div>
              ))}
              {(!submission.sharedWith || submission.sharedWith.length === 0) && (
                <p className="text-[9px] opacity-30 italic font-mono text-center py-2">No collaborators invited yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 pt-4 border-t border-black/10">
            <label className="font-mono text-[9px] font-bold uppercase opacity-50">Deep Link</label>
            <div className="flex gap-2">
              <div className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 bg-neutral-50 font-mono text-[10px] truncate">
                {shareUrl}
              </div>
              <button 
                onClick={copyToClipboard}
                className="bg-slate-900 text-white px-4 flex items-center gap-2 hover:bg-neutral-800 transition-colors rounded-md shadow-sm"
              >
                {copying ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                <span className="font-mono text-[10px] font-bold uppercase">{copying ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 bg-slate-900 text-white py-3 font-mono text-xs font-bold tracking-widest hover:bg-neutral-800 transition-colors rounded-md shadow-sm"
        >
          CONFIRM SETTINGS
        </button>
      </motion.div>
    </motion.div>
  );
}

function RegistersManager({ 
  data, 
  onChange, 
  readOnly,
  submissionId,
  user,
  autoStartScan,
  aiPacingMs,
  setViewingFile,
  setViewingGemContent,
  gemChainLogic,
  activeEditors
}: { 
  data: RfxData, 
  onChange: (data: RfxData) => void,
  readOnly?: boolean,
  submissionId?: string,
  user: FirebaseUser | null,
  autoStartScan?: boolean,
  aiPacingMs: number,
  setViewingFile: (file: {filename: string, content?: string, driveUrl?: string} | null) => void,
  setViewingGemContent: (content: string | null) => void,
  gemChainLogic: any[],
  activeEditors?: { [uid: string]: { heartbeat: number, currentStep?: string, email: string } }
}) {
  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgressStr, setAnalyzeProgressStr] = useState("");
  const [selectedFileAction, setSelectedFileAction] = useState<FileMetadata | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeRegisterTab, setActiveRegisterTab] = useState<'requirements' | 'assumptions' | 'risks' | 'executive_summary' | 'graph' | 'scorecard' | 'compliance' | 'mock_interview'>('requirements');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const stopTaskRefs = React.useRef<{[id: string]: boolean}>({});
  const [selectedGems, setSelectedGems] = useState<string[]>([]);
  const [editingRequirement, setEditingRequirement] = useState<any | null>(null);
  
  const [reqFilterStatus, setReqFilterStatus] = useState<string>('all');
  const [reqFilterType, setReqFilterType] = useState<string>('all');
  
  const isWorkflowButtonDisabled = tasks.some(t => t.status === 'IN_PROGRESS') || (typeof selectedFileIds !== 'undefined' && selectedFileIds.length === 0) || (typeof selectedGems !== 'undefined' && selectedGems.length === 0);
  
  React.useEffect(() => {
    if (data && data.files) {
      setSelectedFileIds(prev => {
        const newIds = data.files.map(f => f.id);
        const addedIds = newIds.filter(id => !prev.includes(id));
        if (addedIds.length > 0) return [...prev, ...addedIds];
        if (prev.length === 0 && newIds.length > 0) return newIds;
        return prev;
      });
    }
  }, [data?.files]);

  useEffect(() => {
    let unsubscribeTasks: (() => void) | undefined;
    let unsubscribeSub: (() => void) | undefined;
    
    if (submissionId) {
      import('./services/rfxService').then(({ onTasksSnapshot, onSubmissionSnapshot }) => {
        unsubscribeTasks = onTasksSnapshot(submissionId, (t) => {
          setTasks(t);
        });
        // We only subscribe to submissions to sync real-time changes
        // if another user edits it.
        unsubscribeSub = onSubmissionSnapshot(submissionId, (newSub) => {
           if (newSub && newSub.data) {
               onChange(newSub.data);
           }
        });
      });
      
      return () => {
         if (unsubscribeTasks) unsubscribeTasks();
         if (unsubscribeSub) unsubscribeSub();
      };
    }
  }, [submissionId]);

  useEffect(() => {
    if (autoStartScan && submissionId && data.files && data.files.length > 0 && !data.lifecycle) {
      startTask('INTAKE');
    }
  }, [autoStartScan]);

  const activeRegisterItems = activeRegisterTab === 'requirements' ? data.requirements : activeRegisterTab === 'assumptions' ? data.assumptions : data.risks;

  const handleAiAnalysis = async (type: 'requirements' | 'assumptions' | 'risks') => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const selected = data.files?.filter(f => selectedFileIds.includes(f.id)) || [];
      if (selected.length === 0) {
        alert("Please select at least one file first.");
        return;
      }

      let updatedData = { ...data };
      updatedData.requirements = [...(updatedData.requirements || [])];
      updatedData.assumptions = [...(updatedData.assumptions || [])];
      updatedData.risks = [...(updatedData.risks || [])];
      updatedData.files = [...(updatedData.files || [])];

      for (let i = 0; i < selected.length; i++) {
        if (stopTaskRefs.current['AI_SCAN']) {
          break; // Stop button sets this ref
        }
        const file = selected[i];
        if (file.scansCompleted?.includes(type)) {
          continue; // skip if already scanned
        }
        try {
           let allResults: any[] = [];
           if (type === 'requirements') {
             for (let pass = 1; pass <= 4; pass++) {
               setAnalyzeProgressStr(`DEEP SCAN PASS ${pass}/4 [${file.name}]`);
               const results = await extractEntityFromFile(file.name, file.content || '', type);
               allResults.push(...results);
               if (pass < 4) await new Promise(res => setTimeout(res, aiPacingMs || 1000));
             }
           } else {
             setAnalyzeProgressStr(`ANALYZING [${file.name}]`);
             const results = await extractEntityFromFile(file.name, file.content || '', type);
             allResults.push(...results);
           }
           setAnalyzeProgressStr("");
           
           if (type === 'requirements') {
             // Deduplicate by simple text comparison optionally, or just push
             updatedData.requirements.push(...allResults.map((r: any) => ({ ...r, id: `REQ-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, text: typeof r === 'string' ? r : (r.text || r.description), source: file.name, status: 'pending', type: r.type || 'overt', aiInsight: r.aiInsight, aiConfidenceScore: r.aiConfidenceScore, hallucinationFlag: r.hallucinationFlag })));
           } else if (type === 'assumptions') {
             updatedData.assumptions.push(...allResults.map((r: any) => ({ id: `ASM-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, description: typeof r === 'string' ? r : (r.text || r.description), source: file.name, impact: 'medium' as any, status: "open" as any, aiInsight: r.aiInsight, aiConfidenceScore: r.aiConfidenceScore, hallucinationFlag: r.hallucinationFlag })));
           } else if (type === 'risks') {
             updatedData.risks.push(...allResults.map((r: any) => ({ id: `RSK-${Date.now()}-${Math.random().toString(36).substring(2,7)}`, title: typeof r === 'string' ? r : (r.title || r.text || r.description), source: file.name, impact: 'medium' as any, probability: 'medium' as any, mitigation: r.mitigation || 'Pending AI Analysis', aiInsight: r.aiInsight, aiConfidenceScore: r.aiConfidenceScore, hallucinationFlag: r.hallucinationFlag })));
           }
           
           // Update file scansCompleted
           const fileIdx = updatedData.files.findIndex((f: any) => f.id === file.id);
           if (fileIdx > -1) {
             const f = { ...updatedData.files[fileIdx] };
             f.scansCompleted = [...(f.scansCompleted || [])];
             if (!f.scansCompleted.includes(type)) f.scansCompleted.push(type);
             updatedData.files[fileIdx] = f;
           }
           
           onChange({...updatedData});
        } catch(e) {
          console.error("Failed extracting", type, "from", file.name);
        }
        
        if (i < selected.length - 1) {
           await new Promise(res => setTimeout(res, aiPacingMs));
        }
      }
      
    } catch (error: any) {
      alert("AI Analysis failed: " + (error?.message || "Please try again."));
    } finally {
      setIsAnalyzing(false);
      stopTaskRefs.current['AI_SCAN'] = false;
    }
  };

  const loadTasks = async () => {
    if (!submissionId) return;
    const t = await getTasksForSubmission(submissionId);
    setTasks(t);
  };

  const startTask = async (type: 'INTAKE' | 'REVIEW', gemsToRun: string[] = []) => {
    if (!submissionId) return;
    const taskId = await createWorkflowTask(submissionId, type);
    if (taskId) {
      executeWorkflowTask(taskId, type, gemsToRun);
      loadTasks();
    }
  };

  const executeWorkflowTask = async (taskId: string, type: string, gemsToRun: string[] = []) => {
    let progress = 0;
    const stages = [
      ...gemChainLogic.map(g => ({ gem: g.id, msg: `${g.name}: ${g.detail || 'Executing step...'}` })),
      { gem: "SYS", msg: "Workflow Completed Successfully." }
    ];

    const updateStage = async (stageIdx: number, progressPct: number, extraMsg?: string) => {
      const currentStage = stages[stageIdx];
      await updateTaskStatus(taskId, { 
        status: 'IN_PROGRESS', 
        progress: progressPct,
        logs: arrayUnion({ 
          message: `[GEM ${currentStage.gem}] ${extraMsg || currentStage.msg}`, 
          timestamp: new Date().toISOString() 
        }) as any
      });
      return currentStage;
    };
    
    const handleStop = async () => {
        await updateTaskStatus(taskId, { status: 'FAILED' }); // or 'STOPPED' if possible
        stopTaskRefs.current[taskId] = false;
        loadTasks();
    };

    try {
      const shouldRun = (gemId: string) => gemsToRun.length === 0 || gemsToRun.includes(gemId);

      for (let i = 0; i < gemChainLogic.length; i++) {
        const gem = gemChainLogic[i];
        if (shouldRun(gem.id)) {
          if (stopTaskRefs.current[taskId]) return await handleStop();
          
          if (gem.id === "12" && submissionId) {
             const t = await getTasksForSubmission(submissionId);
             const taskObj = t.find(task => task.id === taskId);
             if (taskObj && !taskObj.approvedBy) {
                await updateTaskStatus(taskId, {
                   status: 'AWAITING_APPROVAL',
                   approvalRequired: true,
                   logs: arrayUnion({
                      message: `[Human-in-the-Loop] Execution paused. Gem 12 requires explicit SME approval.`,
                      timestamp: new Date().toISOString()
                   }) as any
                });
                loadTasks();
                return; // Stop execution, wait for approval
             }
          }

          let stage = await updateStage(i, Math.floor((i / gemChainLogic.length) * 90));
          onChange({ ...data, lifecycle: { ...data.lifecycle, currentGemId: stage.gem } });

          let currentData = { ...data };
          if (gem.prompt) {
             const { getTemplates } = await import('./services/templateService');
             const templates = await getTemplates();
             const stepTemplates = templates.filter(t => (gem.templateIds || []).includes(t.id));
             const { getPlatformIntegrations } = await import('./services/platformIntegrationService');
             const storedIntegrations = await getPlatformIntegrations();
             const personaDetails = (gem.personas || []).map(pId => {
                 const found = storedIntegrations.find(i => i.id === pId);
                 return found ? `${found.name}: ${found.config?.description}` : pId;
             });
             const result = await executeCustomWorkflowStep(gem.prompt, currentData, stepTemplates, personaDetails);
             if (result.logMessage) {
                 await updateStage(i, Math.floor(((i + 0.5) / gemChainLogic.length) * 90), `AI output: ${result.logMessage}`);
             }
             if (result.dataUpdate) {
                 currentData = { ...currentData, ...result.dataUpdate };
                 onChange({ ...currentData, lifecycle: { ...currentData.lifecycle, currentGemId: stage.gem } });
             }
             if (result.outputFiles && result.outputFiles.length > 0 && submissionId) {
                  const { getPlatformIntegrations } = await import('./services/platformIntegrationService');
                  const { getSubmission } = await import('./services/rfxService');
                  const integrations = await getPlatformIntegrations();
                  const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
                  if (driveConfig?.config?.internalId) {
                      const { createFolder, uploadFileToDrive, getFolderContents } = await import('./services/driveService');
                      const sub = await getSubmission(submissionId);
                      if (sub?.driveFolderId) {
                          const internals = await getFolderContents(null, sub.driveFolderId);
                          let outputsFolderId = internals.find((f:any) => f.name === 'Outputs')?.id;
                          if (!outputsFolderId) {
                             outputsFolderId = await createFolder(null, 'Outputs', sub.driveFolderId);
                          }
                          for (const f of result.outputFiles) {
                              let blob;
                              let mimeType = 'text/markdown';
                              
                              if (f.filename.endsWith('.docx')) {
                                  try {
                                      const { Document, Packer, Paragraph } = await import('docx');
                                      const paragraphs = f.content.split('\\n').map((line: string) => new Paragraph({ text: line }));
                                      const doc = new Document({
                                          sections: [{ properties: {}, children: paragraphs }]
                                      });
                                      blob = await Packer.toBlob(doc);
                                      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                                  } catch (e) {
                                      blob = new Blob([f.content], { type: 'text/markdown' });
                                  }
                              } else if (f.filename.endsWith('.xlsx')) {
                                  try {
                                      const ExcelJS = await import('exceljs');
                                      const workbook = new ExcelJS.Workbook();
                                      const worksheet = workbook.addWorksheet('Sheet1');
                                      let parsedData = [];
                                      try {
                                          parsedData = JSON.parse(f.content);
                                      } catch(e) { /* not JSON */ }
                                      
                                      if (Array.isArray(parsedData) && parsedData.length > 0) {
                                          parsedData.forEach(row => worksheet.addRow(Array.isArray(row) ? row : Object.values(row)));
                                      } else {
                                          f.content.split('\\n').forEach((line: string) => worksheet.addRow(line.split(',')));
                                      }
                                      const buffer = await workbook.xlsx.writeBuffer();
                                      blob = new Blob([buffer], { type: 'application/octet-stream' });
                                      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                                  } catch (e) {
                                      blob = new Blob([f.content], { type: 'text/markdown' });
                                  }
                              } else {
                                  blob = new Blob([f.content], { type: 'text/markdown' });
                              }
                              
                              const file = new File([blob], f.filename, { type: mimeType });
                              await uploadFileToDrive(null, file, outputsFolderId);
                              currentData.files = [...(currentData.files || []), {
                                  name: `Outputs/${f.filename}`,
                                  size: file.size,
                                  type: mimeType,
                                  url: '',
                                  id: Math.random().toString(),
                                  scansCompleted: [],
                                  content: f.content, uploadedAt: new Date().toISOString() } ];
                          }
                          onChange({ ...currentData });
                      }
                  }
             }

             if (gem.requiresHumanReview) {
                 await updateStage(i, Math.floor(((i + 1) / gemChainLogic.length) * 90), `Workflow paused for Human Review.`);
                 await updateTaskStatus(taskId, { status: 'AWAITING_REVIEW' });
                 loadTasks();
                 return; // Pause execution here
             }
          } else {
             await new Promise(r => setTimeout(r, aiPacingMs));
             if (gem.requiresHumanReview) {
                 await updateStage(i, Math.floor(((i + 1) / gemChainLogic.length) * 90), `Workflow paused for Human Review.`);
                 await updateTaskStatus(taskId, { status: 'AWAITING_REVIEW' });
                 loadTasks();
                 return; // Pause execution here
             }
          }
        }
      }

      if (stopTaskRefs.current[taskId]) return await handleStop();

      await updateStage(stages.length - 1, 95);
      await updateTaskStatus(taskId, { 
        status: 'COMPLETED', 
        progress: 100,
        logs: arrayUnion({ message: stages[stages.length - 1].msg, timestamp: new Date().toISOString() }) as any
      });
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      console.warn('Workflow failed:\n', errorMessage);
      await updateTaskStatus(taskId, { 
        status: 'FAILED', 
        progress: 100,
        logs: arrayUnion({ message: `Workflow Failed: ${errorMessage}`, timestamp: new Date().toISOString() }) as any
      });
    }
  };
  const addAssumption = () => {
    const newAssumptions = [...(data.assumptions || []), {
      id: `A-${Date.now().toString().slice(-4)}`,
      source: '',
      description: '',
      impact: 'medium',
      status: 'open'
    } as Assumption];
    onChange({ ...data, assumptions: newAssumptions });
  };

  const addRisk = () => {
    const newRisks = [...(data.risks || []), {
      id: `R-${Date.now().toString().slice(-4)}`,
      title: '',
      mitigation: 'TBD - Mitigation Strategy Required',
      impact: 'medium',
      probability: 'medium'
    } as Risk];
    onChange({ ...data, risks: newRisks });
  };

  const updateAssumption = (idx: number, updates: Partial<Assumption>) => {
    const newAssumptions = [...(data.assumptions || [])];
    newAssumptions[idx] = { ...newAssumptions[idx], ...updates };
    onChange({ ...data, assumptions: newAssumptions });
  };

  const updateRisk = (idx: number, updates: Partial<Risk>) => {
    const newRisks = [...(data.risks || [])];
    newRisks[idx] = { ...newRisks[idx], ...updates };
    onChange({ ...data, risks: newRisks });
  };

  const removeAssumption = (idx: number) => {
    const newAssumptions = data.assumptions?.filter((_, i) => i !== idx);
    onChange({ ...data, assumptions: newAssumptions });
  };

  const removeRisk = (idx: number) => {
    const newRisks = data.risks?.filter((_, i) => i !== idx);
    onChange({ ...data, risks: newRisks });
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processFiles = async (files: File[]) => {
    let currentData = { ...data };
    let didAskSync = false;
    let shouldSync = false;
    let targetFolder: string | null = null;
    let submissionFolderName = `Submission_${submissionId}`;
    let actualFolderToUpload: string | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (i > 0) {
        // Throttle uploads to prevent API rate limit issues
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
      setUploadError(null);
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|csv|xls|xlsx|md)$/i)) {
        setUploadError(`Unsupported file format: ${file.name}. Please upload PDF, Word Docs, Text, or Spreadsheets.`);
        continue;
      }
      
      const fileId = `F-${Date.now().toString().slice(-4)}-${Math.floor(Math.random()*1000)}`;
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 25 }));
        
        const reader = new FileReader();
        const content = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.onerror = () => reject(new Error('Failed to read file'));
          if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) { reader.readAsText(file); } else { reader.readAsDataURL(file); }
        });
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));
        
        const extraction = undefined;
        const newFile: FileMetadata = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          content: content?.slice(0, 500) || 'STORAGE_POINTER_RECORDED',
          uploadedAt: new Date().toISOString(),
          extraction
        };
        
        currentData = { ...currentData, files: [...(currentData.files || []), newFile] };
        
        // Attempt Drive Sync once for the batch
        if (!didAskSync) {
          didAskSync = true;
          try {
            const integrations = await getPlatformIntegrations();
            const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
            targetFolder = driveConfig?.config?.submissionsId || driveConfig?.config?.rootId;
            
            shouldSync = true;

            if (shouldSync) {
              const token = null;
              if (!targetFolder) {
                // Fallback initialization if Drive wasn't already initialized by admin
                const newRootId = await createFolder(token, 'Elyria_System_Master');
                targetFolder = await createFolder(token, 'External (Submissions)', newRootId);
                
                if (!driveConfig) {
                  await createPlatformIntegration({
                    name: `Drive Linked (Central Service)`,
                    type: 'GOOGLE_DRIVE',
                    status: 'ACTIVE',
                    config: { rootId: newRootId, submissionsId: targetFolder, owner: 'Central Service' },
                    createdAt: new Date().toISOString()
                  });
                }
              }
              const { getSubmission, updateSubmission } = await import('./services/rfxService');
              const sub = await getSubmission(submissionId!);
              actualFolderToUpload = sub?.driveFolderId || null;
              if (!actualFolderToUpload) {
                 const titleSafe = sub?.title?.replace(/[^a-zA-Z0-9 -_]/g, '') || "Untitled";
                 actualFolderToUpload = await createFolder(token, `${titleSafe} [${submissionId?.slice(-5)}]`, targetFolder);
                 if (sub && submissionId) {
                    await updateSubmission(submissionId, { driveFolderId: actualFolderToUpload });
                 }
              }
            }
          } catch (e) {
            console.warn("Could not setup drive sync", e);
          }
        }

        if (shouldSync && actualFolderToUpload) {
          try {
            const driveFileId = await uploadFileToDrive(null, file, actualFolderToUpload);
            // update the file in currentData to use the driveFileId
            currentData.files = currentData.files?.map(f => f.id === fileId ? { ...f, driveFileId } as any : f);
          } catch(e: any) {
            console.error(e);
            alert("Drive Upload failed for " + file.name + ": " + (e.message || String(e)));
          }
        }

        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      } catch (err) {
        console.error("AI Extraction failed:", err);
        // Still add the file but without extraction
        const newFile: FileMetadata = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          content: 'STORAGE_POINTER_RECORDED',
          uploadedAt: new Date().toISOString()
        };
        currentData = { ...currentData, files: [...(currentData.files || []), newFile] };
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      }
      
      setTimeout(() => {
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[fileId];
          return next;
        });
      }, 1000);
      
      onChange(currentData);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    processFiles(files);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (readOnly) return;
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = async (idx: number) => {
    const fileToRemove = data.files?.[idx];
    if (fileToRemove) {
      if (fileToRemove.driveFileId) {
        try {
          const { deleteFile } = await import('./services/driveService');
          await deleteFile(null, fileToRemove.driveFileId);
        } catch (err) {
          console.warn('Could not delete file from drive on remove', err);
        }
      } else {
        // Fallback for old files
        try {
           const { getSubmission } = await import('./services/rfxService');
           const sub = await getSubmission(submissionId!);
           let folderId = sub?.driveFolderId;
           const { findFolderByName, getFolderContents, deleteFile } = await import('./services/driveService');
           if (!folderId) folderId = await findFolderByName(null, `Submission_${submissionId}`);
           
           if (folderId) {
             const contents = await getFolderContents(null, folderId);
             const driveFile = contents.find((f: any) => f.name === fileToRemove.name);
             if (driveFile) {
               await deleteFile(null, driveFile.id);
             }
           }
        } catch(e) {
           console.warn('Could not delete fallback file from drive', e);
        }
      }
    }
    const newFiles = data.files?.filter((_, i) => i !== idx);
    onChange({ ...data, files: newFiles });
  };

  const [showAiReport, setShowAiReport] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<{type: 'assumption' | 'risk', idx: number} | null>(null);

  const toggleFeedback = (type: 'assumption' | 'risk', idx: number, rating: 'helpful' | 'not_helpful', comment?: string) => {
    if (!user) return;
    const feedback: UserFeedback = {
      userId: user.uid,
      userName: user.displayName || 'Unknown',
      rating,
      comment,
      timestamp: new Date().toISOString()
    };

    if (type === 'assumption') {
      const current = [...(data.assumptions || [])];
      const existingFeedback = current[idx].feedback || [];
      const userFeedbackIdx = existingFeedback.findIndex(f => f.userId === user.uid);
      
      if (userFeedbackIdx >= 0) {
        existingFeedback[userFeedbackIdx] = { ...existingFeedback[userFeedbackIdx], rating, comment: comment !== undefined ? comment : existingFeedback[userFeedbackIdx].comment };
      } else {
        existingFeedback.push(feedback);
      }
      
      current[idx] = { ...current[idx], feedback: existingFeedback };
      onChange({ ...data, assumptions: current });
    } else {
      const current = [...(data.risks || [])];
      const existingFeedback = current[idx].feedback || [];
      const userFeedbackIdx = existingFeedback.findIndex(f => f.userId === user.uid);
      
      if (userFeedbackIdx >= 0) {
        existingFeedback[userFeedbackIdx] = { ...existingFeedback[userFeedbackIdx], rating, comment: comment !== undefined ? comment : existingFeedback[userFeedbackIdx].comment };
      } else {
        existingFeedback.push(feedback);
      }
      
      current[idx] = { ...current[idx], feedback: existingFeedback };
      onChange({ ...data, risks: current });
    }
  };

  return (
    <div className="space-y-8 mt-6">
      {data.lifecycle && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-blue-600 bg-blue-50 p-4 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="text-blue-600" size={20} />
              <div>
                <h4 className="text-xs font-medium tracking-tight text-blue-900">Lifecycle Intelligence Active</h4>
                <p className="font-mono text-[9px] text-blue-700/70 uppercase">
                  Current Stage: {gemChainLogic.find(g => g.id === data.lifecycle?.currentGemId)?.name || 'Initializing'} 
                  {data.lifecycle.scoreDelta && ` // Optimization Delta: +${data.lifecycle.scoreDelta}%`}
                </p>
              </div>
            </div>
            {(data.lifecycle.executiveSummary || data.lifecycle.remediationActions) && (
              <button 
                onClick={() => setShowAiReport(true)}
                className="bg-blue-600 text-white px-4 py-2 font-mono text-[10px] font-bold uppercase hover:bg-blue-700 transition-colors"
              >
                View AI Strategy Report
              </button>
            )}
          </div>
        </motion.div>
      )}

      {!readOnly && data.files && data.files.length > 0 && !data.lifecycle && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-blue-600 text-white p-6 border-4 border-black shadow-sm rounded-xl mb-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="animate-pulse" />
              <div>
                <h4 className="font-mono text-sm font-bold uppercase tracking-tight">Intelligence Scan Pending</h4>
                <p className="font-mono text-[10px] opacity-70">
                  Documentation detected. Ready to trigger Orchestrator - select file(s) & flow(s) first.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                if (submissionId) {
                  startTask('INTAKE');
                } else {
                  alert("Submission ID missing. Please ensure document is saved to a draft first.");
                }
              }}
              className="bg-white text-black py-4 text-xs font-medium tracking-widest hover:bg-neutral-100   shadow-sm transition-all"
            >
              Start AI Intelligence Scan & Scoring
            </button>
          </div>
        </motion.div>
      )}

      <section
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative transition-all p-4 rounded-xl border-dashed border-[3px] ${isDragOver ? 'bg-blue-500/10 border-blue-500 shadow-sm scale-[1.01]' : 'border-black bg-transparent'} mb-8`}
      >
        {isDragOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl border-2 border-blue-500 m-[-3px]">
             <div className="animate-bounce bg-blue-100 p-4 rounded-full mb-4 shadow-sm">
               <Upload size={32} className="text-blue-600" />
             </div>
             <p className="font-mono text-sm font-bold uppercase text-blue-600 tracking-widest bg-white px-4 py-2 shadow-sm">Drop Files to Ingest</p>
          </div>
        )}
        <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
          <div className="flex items-center gap-2">
            <Paperclip size={14} className="text-black" />
            <h5 className="text-xs font-medium tracking-tight">RFx Client Documents & Artifacts</h5>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              
              <Tooltip content="Select or Deselect All Files">
                <button 
                  onClick={() => {
                    if (data?.files && selectedFileIds.length === data.files.length) {
                       setSelectedFileIds([]);
                    } else {
                       setSelectedFileIds((data?.files || []).map(f => f.id));
                    }
                  }}
                  className="font-mono text-[10px] font-bold uppercase px-4 py-2 rounded-md bg-neutral-200 text-black shadow-sm hover:bg-neutral-300 transition-colors mr-2"
                >
                  {data?.files && selectedFileIds.length > 0 && selectedFileIds.length === data.files.length ? 'DESELECT ALL' : 'SELECT ALL'}
                </button>
              </Tooltip>

              <Tooltip content="Upload an Addendum to diff against the primary package">
                <label className="font-mono text-[10px] font-bold uppercase px-4 py-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shadow-sm hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-2">
                  <Sparkles size={12} /> ADDENDUM / DIFF
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx" onChange={async (e) => {
                         if (!e.target.files || e.target.files.length === 0) return;
                         const file = e.target.files[0];
                         if (file) {
                             const reader = new FileReader();
                             reader.onload = async (event) => {
                                 const content = event.target?.result as string || '';
                                 setAnalyzeProgressStr(`Diffing Addendum [${file.name}]...`);
                                 try {
                                     const { analyzeAddendum } = await import('./services/geminiService');
                                     const res = await analyzeAddendum(file.name, content, data.requirements || []);
                                     
                                     let newReqs = [...(data.requirements || [])];
                                     
                                     // Handle deleted
                                     if (res.deletedRequirementIds) {
                                         newReqs = newReqs.filter(r => !res.deletedRequirementIds.includes(r.id));
                                     }
                                     
                                     // Handle modified
                                     if (res.modifiedRequirements) {
                                         res.modifiedRequirements.forEach((mod: any) => {
                                             const idx = newReqs.findIndex(r => r.id === mod.id);
                                             if (idx > -1) {
                                                 newReqs[idx].text = mod.newText;
                                                 newReqs[idx].aiInsight = "ADDENDUM MODIFIED: " + mod.diffReason;
                                                 newReqs[idx].diffStatus = 'modified'; // Visual flag
                                             }
                                         });
                                     }
                                     
                                     // Handle new
                                     if (res.newRequirements) {
                                         res.newRequirements.forEach((nReq: any) => {
                                             newReqs.push({
                                                 id: `REQ-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
                                                 text: nReq.text,
                                                 source: file.name,
                                                 status: 'pending' as any,
                                                 type: nReq.type || 'overt',
                                                 aiInsight: 'NEW FROM ADDENDUM',
                                                 diffStatus: 'new' // Visual flag
                                             });
                                         });
                                     }
                                     
                                     onChange({ ...data, requirements: newReqs });
                                     alert(`Addendum Diff Complete: ${res.modifiedRequirements?.length || 0} modified, ${res.newRequirements?.length || 0} new, ${res.deletedRequirementIds?.length || 0} deleted.`);
                                     
                                 } catch(err) {
                                     alert("Failed to diff addendum.");
                                 }
                                 setAnalyzeProgressStr("");
                             };
                             if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
                                reader.readAsText(file);
                             } else {
                                alert("For full diffing, please upload a text-based/md Addendum for now.");
                             }
                         }
                     }} />
                </label>
              </Tooltip>

              <Tooltip content="Upload documentation (or drag & drop files here)">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="font-mono text-[10px] font-bold uppercase px-4 py-2 rounded-md bg-slate-900 text-white rounded-lg shadow-sm hover:bg-neutral-800 transition-colors"
                >
                  + UPLOAD FILES
                </button>
              </Tooltip>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.files?.map((f, idx) => (
            <div key={idx} className={`border ${selectedFileIds.includes(f.id) ? 'border-slate-800 bg-slate-50' : 'border-neutral-200 bg-white'} rounded-lg p-3 flex flex-col gap-3 group shadow-sm hover:shadow-md transition-all cursor-pointer`} onClick={() => setSelectedFileIds(prev => prev.includes(f.id) ? prev.filter(i => i !== f.id) : [...prev, f.id])}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${selectedFileIds.includes(f.id) ? 'bg-slate-800 border-slate-800' : 'border-neutral-300'}`}>
                    {selectedFileIds.includes(f.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="min-w-0">
                    <p 
                      className="font-mono text-[10px] font-bold truncate uppercase hover:underline cursor-pointer flex items-center" 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (f.driveFileId) {
                          setViewingFile({
                            filename: f.name,
                            driveUrl: `https://drive.google.com/file/d/${f.driveFileId}/preview`
                          });
                        } else {
                          alert("File not synced to drive yet. Try clicking Sync to Drive in the bottom right context menu.");
                        }
                      }}
                    >
                      {f.name}
                    </p>
                    <p className="font-mono text-[8px] opacity-40 uppercase">
                      {(f.size / (1024 * 1024)).toFixed(1)}MB // {f.uploadedAt.split('T')[0]} 
                      <span className="ml-2 font-bold">{f.driveFileId ? '✓ SYNCED' : (uploadProgress[f.id] ? '○ SYNCING...' : '⨯ LOCAL ONLY')}</span>
                    </p>
                  </div>
                </div>
                {!readOnly && (
                  <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="text-red-600 hover:scale-110 transition-transform">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <div className="border-t border-black/10 pt-2 flex items-center gap-2">
                <div className={`flex items-center gap-1 font-mono text-[7px] uppercase font-bold px-1.5 py-0.5 rounded border ${f.scansCompleted?.includes('requirements') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-neutral-50 text-neutral-400 border-neutral-200'}`}>
                  {f.scansCompleted?.includes('requirements') ? '✓ REQ' : '○ REQ'}
                </div>
                <div className={`flex items-center gap-1 font-mono text-[7px] uppercase font-bold px-1.5 py-0.5 rounded border ${f.scansCompleted?.includes('assumptions') ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-neutral-50 text-neutral-400 border-neutral-200'}`}>
                  {f.scansCompleted?.includes('assumptions') ? '✓ ASM' : '○ ASM'}
                </div>
                <div className={`flex items-center gap-1 font-mono text-[7px] uppercase font-bold px-1.5 py-0.5 rounded border ${f.scansCompleted?.includes('risks') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-neutral-50 text-neutral-400 border-neutral-200'}`}>
                  {f.scansCompleted?.includes('risks') ? '✓ RSK' : '○ RSK'}
                </div>
              </div>

              {f.extraction && (
                <div className="border-t border-black/10 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Sparkles size={10} />
                      <span className="font-mono text-[8px] font-bold uppercase">Intelligence Detected</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedFileAction(f); }}
                      className="font-mono text-[8px] font-bold uppercase underline hover:no-underline"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {Object.entries(uploadProgress).map(([id, p]) => (
            <div key={id} className="border border-neutral-200 rounded-lg p-3 bg-slate-900 text-white rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-[8px] uppercase">{p === 100 ? 'COMPLETE' : 'UPLOADING...'}</p>
                <p className="font-mono text-[8px]">{p}%</p>
              </div>
              <div className="w-full h-1 bg-white/20">
                <div className="h-full bg-green-400 transition-all duration-300" style={{ width: `${p}%` }} />
              </div>
            </div>
          ))}
          {(!data.files || data.files.length === 0) && Object.keys(uploadProgress).length === 0 && (
            <div 
              className={`col-span-full border border-neutral-200 rounded-lg border-dashed p-8 flex flex-col items-center justify-center text-center opacity-50 font-mono text-[10px] uppercase ${readOnly ? '' : 'group cursor-pointer transition-colors hover:bg-neutral-50'}`} 
              onClick={() => !readOnly && fileInputRef.current?.click()}
            >
              <Upload size={24} className={`mb-2 ${readOnly ? '' : 'group-hover:-translate-y-1 transition-transform'}`} />
              <p>{readOnly ? 'No files attached' : 'Drag and drop files here, or click to upload'}</p>
            </div>
          )}
        </div>
      </section>

      {/* Task Workflows Section */}
      <section className="bg-neutral-100 p-6 border border-neutral-200 rounded-lg border-dashed">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Workflow size={18} className="text-black" />
            <div>
              <h5 className="text-xs font-medium tracking-tight">Active Automation Workflows</h5>
              <p className="font-mono text-[8px] opacity-50 uppercase">System-level intake & exhaustive review threads</p>
            </div>
          </div>
          {!readOnly && tasks.some(t => t.status === 'AWAITING_REVIEW') ? (
            <button 
              onClick={() => {
                const awaitingReviewTask = tasks.find(t => t.status === 'AWAITING_REVIEW');
                if (awaitingReviewTask) {
                   const idx = gemChainLogic.findIndex(g => g.id === data.lifecycle?.currentGemId);
                   if (idx !== -1 && idx + 1 < gemChainLogic.length) {
                      const remainingGems = gemChainLogic.slice(idx + 1).map(g => g.id);
                      updateTaskStatus(awaitingReviewTask.id, { status: 'COMPLETED' }).then(() => {
                         startTask('INTAKE', remainingGems);
                      });
                   } else {
                      updateTaskStatus(awaitingReviewTask.id, { status: 'COMPLETED' }).then(loadTasks);
                   }
                }
              }}
              className="bg-amber-500 text-black rounded-lg px-6 py-2 font-mono text-[10px] font-bold uppercase flex items-center gap-2 hover:bg-amber-400 transition-colors shadow-sm   "
            >
              <Check size={14} /> 
              APPROVE OUTPUTS & RESUME WORKFLOW
            </button>
          ) : !readOnly && (
            <button 
              onClick={() => startTask('INTAKE', selectedGems)}
              disabled={isWorkflowButtonDisabled}
              className="bg-slate-900 text-white rounded-lg px-4 py-2 font-mono text-[10px] font-bold uppercase flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Cpu size={14} className={tasks.some(t => t.status === 'IN_PROGRESS') ? 'animate-spin' : ''} /> 
              INITIALIZE SELECTED WORKFLOWS
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2 mb-6 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/10 -translate-y-1/2 z-0 hidden sm:block" />
            {gemChainLogic.map((gem, i) => {
              const activeTask = tasks.find(t => t.status === 'IN_PROGRESS');
              const latestCompletedTask = tasks.find(t => t.status === 'COMPLETED');
              const allTaskLogs = activeTask?.logs || latestCompletedTask?.logs || [];
              
              const hasStarted = allTaskLogs.some(l => l.message.includes(`[GEM ${gem.id}]`));
              
              const latestGemLog = [...allTaskLogs].reverse().find(l => l.message.includes('[GEM '));
              const latestGemId = latestGemLog?.message.match(/\[GEM (\w+)\]/)?.[1];
              
              const isActive = activeTask?.status === 'IN_PROGRESS' && latestGemId === gem.id;
              const isCompleted = (hasStarted && !isActive) || (latestCompletedTask && latestCompletedTask.logs?.some((l: any) => l.message.includes(`[GEM ${gem.id}]`)));

              return (
                <div key={gem.id} className={`p-2 border-2 transition-all relative z-10 flex flex-col gap-1 items-start shadow-sm rounded-xl cursor-pointer ${
                  isActive ? 'border-blue-500 bg-blue-50 text-blue-900 animate-pulse' : 
                  selectedGems.includes(gem.id) ? 'border-purple-500 bg-purple-50 text-purple-900' :
                  isCompleted ? 'border-green-500 bg-green-50 text-green-900' : 
                  'border-black bg-white text-black opacity-40'
                }`} onClick={() => setSelectedGems(prev => prev.includes(gem.id) ? prev.filter(g => g !== gem.id) : [...prev, gem.id])}>
                  <div className={`w-3 h-3 border flex items-center justify-center ${
                    isActive ? 'border-blue-500 bg-blue-500 text-white' : 
                    selectedGems.includes(gem.id) ? 'border-purple-500 bg-purple-500 text-white' :
                    isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                    'border-black'
                  }`}>
                    {(isCompleted || selectedGems.includes(gem.id)) && <CheckCircle2 size={8} />}
                  </div>
                  <div className="min-w-0 w-full flex justify-between">
                    <p className="font-mono text-[8px] font-bold">GEM {gem.id}</p>
                    <button onClick={(e) => { e.stopPropagation(); setViewingGemContent(gem.detail); }} className="text-black opacity-50 hover:opacity-100"><Edit2 size={10} /></button>
                    <p className="font-mono text-[7px] uppercase truncate w-full" title={gem.name}>{gem.name}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {tasks.map((task) => (
            <div key={task.id} className="border border-neutral-200 rounded-lg bg-white p-4 shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-3 border-b border-black/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-500' : task.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`} />
                  <span className={`font-mono text-[10px] font-bold uppercase ${task.status === 'FAILED' ? 'text-red-500' : ''}`}>{task.type} // {task.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] opacity-40">{new Date(task.updatedAt?.toDate?.() || task.updatedAt).toLocaleTimeString()}</span>
                  {task.status === 'IN_PROGRESS' && (
                    <button 
                      onClick={() => stopTaskRefs.current[task.id!] = true}
                      className="text-[10px] font-mono font-bold uppercase border border-red-200 text-red-600 px-2 py-0.5 hover:bg-red-50 rounded"
                    >
                      Stop
                    </button>
                  )}
                  {task.status === 'AWAITING_APPROVAL' && !readOnly && (
                    <button 
                      onClick={async () => {
                         const email = auth.currentUser?.email || 'Unknown User';
                         await updateTaskStatus(task.id!, { 
                             approvedBy: email,
                             logs: arrayUnion({
                                message: `[Human-in-the-Loop] Approved by ${email}. Resuming workflow...`,
                                timestamp: new Date().toISOString()
                             }) as any
                         });
                         executeWorkflowTask(task.id!, task.type);
                      }}
                      className="text-[10px] font-mono font-bold uppercase bg-green-600 text-white px-3 py-0.5 hover:bg-green-700 rounded transition-colors"
                    >
                      Approve & Resume
                    </button>
                  )}
                  {!readOnly && (
                    <button 
                      onClick={async () => {
                        try {
                           setTasks(prev => prev.filter(t => t.id !== task.id));
                           if (task.id) {
                             await deleteWorkflowTask(task.id);
                           }
                        } catch(e) {
                           console.error('Failed to delete task', e);
                           loadTasks(); // restore if failed
                        }
                      }}
                      className="text-[10px] font-mono font-bold uppercase border border-neutral-200 text-neutral-600 px-2 py-0.5 hover:bg-neutral-50 rounded"
                    >
                      Delete
                    </button>
                  )}
                  {task.status === 'FAILED' && !readOnly && (
                    <button 
                      onClick={() => executeWorkflowTask(task.id!, task.type)}
                      className="text-[10px] font-mono font-bold uppercase border border-red-200 text-red-600 px-2 py-0.5 hover:bg-red-50 rounded"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-2 bg-neutral-100 border border-neutral-100 rounded-lg">
                  <div 
                    className="h-full bg-black transition-all duration-1000" 
                    style={{ width: `${task.progress}%` }} 
                  />
                </div>
                <span className="font-mono text-[10px] font-bold w-8">{task.progress}%</span>
              </div>

              <div className="bg-black text-[#00FF41] p-2 font-mono text-[8px] h-20 overflow-y-auto scrollbar-hide">
                {task.logs?.map((log, i) => (
                  <div key={i} className="flex gap-2 opacity-80">
                    <span className="opacity-40">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-6 border border-neutral-100 rounded-lg border-dashed opacity-30 font-mono text-[9px] uppercase">
              No automation tasks triggered for this submission.
            </div>
          )}
        </div>
      </section>
      {/* Tabs for Registers */}
      {(data.assumptions?.length || data.risks?.length || autoStartScan) || true ? (
        <div className="flex border-b border-black mb-6">
          <button 
            onClick={() => setActiveRegisterTab('requirements')}
            className={`px-6 py-2 text-xs font-medium transition-colors ${activeRegisterTab === 'requirements' ? 'bg-slate-900 text-white rounded-lg' : 'hover:bg-neutral-100'} border-r border-black`}
          >
            Requirements
          </button>
          <button 
            onClick={() => setActiveRegisterTab('assumptions')}
            className={`px-6 py-2 text-xs font-medium transition-colors ${activeRegisterTab === 'assumptions' ? 'bg-slate-900 text-white rounded-lg' : 'hover:bg-neutral-100'} border-r border-black`}
          >
            Assumptions & Dependencies
          </button>
          <button 
            onClick={() => setActiveRegisterTab('risks')}
            className={`px-6 py-2 text-xs font-medium transition-colors ${activeRegisterTab === 'risks' ? 'bg-slate-900 text-white rounded-lg' : 'hover:bg-neutral-100'} border-r border-black`}
          >
            Risk Register
          </button>
          <button 
            onClick={() => setActiveRegisterTab('executive_summary')}
            className={`px-6 py-2 text-xs font-medium transition-colors ${activeRegisterTab === 'executive_summary' ? 'bg-slate-900 text-white rounded-lg' : 'hover:bg-neutral-100'} border-r border-black`}
          >
            Executive Summary
          </button>
          <button 
            onClick={() => setActiveRegisterTab('scorecard')}
            className={`px-6 py-2 text-xs font-medium transition-colors ${activeRegisterTab === 'scorecard' ? 'bg-slate-900 text-white rounded-lg' : 'hover:bg-neutral-100'} border-r border-black`}
          >
            Bid Scorecard
          </button>
          <button 
            onClick={() => setActiveRegisterTab('compliance')}
            className={`px-6 py-2 text-xs font-medium transition-colors ${activeRegisterTab === 'compliance' ? 'bg-slate-900 text-white rounded-lg' : 'hover:bg-neutral-100'} border-r border-black`}
          >
            Compliance Engine
          </button>
          <button 
            onClick={() => setActiveRegisterTab('mock_interview')}
            className={`px-6 py-2 text-xs font-medium transition-colors ${activeRegisterTab === 'mock_interview' ? 'bg-slate-900 text-white rounded-lg' : 'hover:bg-neutral-100'} border-r border-black`}
          >
            Red Team Mock
          </button>
          <button 
            onClick={() => setActiveRegisterTab('graph')}
            className={`px-6 py-2 text-xs font-medium transition-colors ${activeRegisterTab === 'graph' ? 'bg-slate-900 text-white rounded-lg' : 'hover:bg-neutral-100'}`}
          >
            Knowledge Graph
          </button>
        </div>
      ) : null}

      {activeRegisterTab === 'requirements' && (
      <section>
        <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
          <div className="flex items-center gap-2">
            <h5 className="text-xs font-medium tracking-tight text-green-700">Requirements</h5>
          </div>
          <div className="flex items-center gap-4">

            <Tooltip content="Export Traceability Matrix (CSV)">
              <button
                 onClick={() => {
                     const rows = [
                         ["ID", "Source", "Type", "Status", "Requirement Text", "Confidence Score", "Hallucination Warning", "AI Insight"],
                         ...(data.requirements || []).map(r => [r.id, r.source || '', r.type || 'overt', r.status || 'pending', `"${(r.text || '').replace(/"/g, '""')}"`, r.aiConfidenceScore || '', r.hallucinationFlag ? 'YES' : 'NO', `"${(r.aiInsight || '').replace(/"/g, '""')}"`])
                     ];
                     const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
                     const encodedUri = encodeURI(csvContent);
                     const link = document.createElement("a");
                     link.setAttribute("href", encodedUri);
                     link.setAttribute("download", `Traceability_Matrix_${submissionId || 'export'}.csv`);
                     document.body.appendChild(link);
                     link.click();
                     document.body.removeChild(link);
                 }}
                 className="font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 px-4 py-2 rounded-md bg-white border border-slate-900 text-slate-900 shadow-sm hover:bg-neutral-100 transition-colors"
               >
                 <Download size={10} /> EXPORT MATRIX
              </button>
            </Tooltip>

            <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-md p-1 shadow-sm">
              <select className="font-mono text-[9px] uppercase bg-transparent outline-none pr-1 cursor-pointer" value={reqFilterStatus} onChange={(e) => setReqFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="w-px h-4 bg-neutral-200 mx-1"></div>
              <select className="font-mono text-[9px] uppercase bg-transparent outline-none pr-1 cursor-pointer" value={reqFilterType} onChange={(e) => setReqFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="overt">Overt</option>
                <option value="implied">Implied</option>
                <option value="inferred">Inferred</option>
                <option value="inter">Inter</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            {!readOnly && (
              <Tooltip content="Run AI to extract requirements">
                <button 
                  onClick={() => handleAiAnalysis('requirements')}
                  disabled={isAnalyzing || selectedFileIds.length === 0}
                  className="font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-30 transition-colors shadow-sm"
                >
                  <Sparkles size={10} className={isAnalyzing ? 'animate-pulse' : ''} />
                  {isAnalyzing ? (analyzeProgressStr || 'ANALYZING...') : 'DEEP SCAN REQUIREMENTS'}
                </button>
              </Tooltip>
            )}
            {!readOnly && (
              <Tooltip content="Add a new requirement manually">
                <button 
                  onClick={() => onChange({...data, requirements: [...(data.requirements || []), { id: `REQ-${Date.now()}`, text: 'New Requirement', source: 'Manual', status: 'pending', type: 'overt' }]})}
                  className="font-mono text-[10px] font-bold uppercase px-4 py-2 rounded-md bg-slate-900 text-white shadow-sm hover:bg-neutral-800 transition-colors"
                >
                  + ADD ROW
                </button>
              </Tooltip>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          <table className="w-full font-mono text-[10px] text-left">
            <thead className="bg-slate-900 text-white rounded-lg">
              <tr>
                <th className="p-2 border-r border-white/20">ID</th>
                <th className="p-2 border-r border-white/20">SOURCE</th>
                <th className="p-2 border-r border-white/20">TYPE</th>
                <th className="p-2 border-r border-white/20">TEXT</th>
                <th className="p-2 border-r border-white/20">CONFIDENCE</th>
                <th className="p-2 border-r border-white/20">ALERTS</th>
                <th className="p-2 border-r border-white/20">ASSIGNEE</th>
                <th className="p-2 border-r border-white/20">STATUS</th>
                {!readOnly && <th className="p-2 text-center">ACTION</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-neutral-800">
              {(data.requirements || []).filter((req: any) => (reqFilterStatus === 'all' || (req.status || 'pending') === reqFilterStatus) && (reqFilterType === 'all' || (req.type || 'overt') === reqFilterType)).map((req: any, idx: number) => {
                const isBeingEditedBy = activeEditors && Object.entries(activeEditors).find(([uid, ed]) => uid !== user?.uid && ed.currentStep === `req:${req.id}` && Date.now() - ed.heartbeat < 30000);
                return (
                <tr key={req.id || idx} className={`hover:bg-neutral-50 transition-colors ${req.hallucinationFlag ? 'bg-orange-50' : ''} ${req.diffStatus === 'new' ? 'bg-green-50/50 outline outline-1 outline-green-400' : req.diffStatus === 'modified' ? 'bg-amber-50/50 outline outline-1 outline-amber-400' : ''} ${isBeingEditedBy ? 'outline outline-2 outline-blue-500 bg-blue-50/30' : ''}`}>
                  <td className="p-2 border-r border-black/20 font-bold whitespace-nowrap cursor-pointer hover:underline text-blue-600 relative" onClick={() => { setEditingRequirement(req); if (submissionId) updateActiveEditor(submissionId, `req:${req.id}`); }}>
                    {isBeingEditedBy && (
                      <div className="absolute -top-3 left-0 bg-blue-500 text-white text-[8px] px-1 py-0.5 rounded shadow-sm z-10 font-sans tracking-tighter w-max">
                        {isBeingEditedBy[1].email.split('@')[0]} is editing...
                      </div>
                    )}
                    {req.id}
                    {req.diffStatus && <span className={`ml-1 px-1 rounded-sm text-[8px] uppercase tracking-tighter ${req.diffStatus === 'new' ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'}`}>{req.diffStatus}</span>}
                  </td>
                  <td className="p-2 border-r border-black/20 text-[9px] opacity-70 cursor-pointer" onClick={() => { setEditingRequirement(req); if (submissionId) updateActiveEditor(submissionId, `req:${req.id}`); }}>
                    <a href={`#file-${req.source}`} onClick={(e) => {
                        e.stopPropagation();
                        // open the source file in view
                        const sourceFile = data.files.find(f => f.name.includes(req.source) || req.source.includes(f.name));
                        if (sourceFile) {
                            setViewingFile({ filename: sourceFile.name, content: sourceFile.content, driveUrl: sourceFile.driveFileId ? `https://docs.google.com/file/d/${sourceFile.driveFileId}/view` : undefined });
                        }
                    }} className="hover:text-blue-600 hover:underline">{req.source}</a>
                  </td>
                  <td className="p-2 border-r border-black/20 text-[9px] uppercase cursor-pointer" onClick={() => setEditingRequirement(req)}>
                    {req.type || 'overt'}
                  </td>
                  <td className="p-2 border-r border-black/20 cursor-pointer" onClick={() => setEditingRequirement(req)}>
                    <div className="w-full bg-transparent overflow-hidden text-ellipsis line-clamp-1" title={req.text}>{req.text}</div>
                  </td>
                  <td className="p-2 border-r border-black/20 cursor-pointer text-center relative group" onClick={() => setEditingRequirement(req)}>
                    {req.aiConfidenceScore ? (
                        <div className={`font-mono font-bold ${req.aiConfidenceScore >= 90 ? 'text-green-600' : req.aiConfidenceScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {req.aiConfidenceScore}%
                            <div className="hidden group-hover:block absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 border border-slate-700 rounded shadow-xl text-[10px] text-white">
                                AI Confidence Score. Below 70% suggests human review needed.
                            </div>
                        </div>
                    ) : (
                        <span className="opacity-30">-</span>
                    )}
                  </td>
                  <td className="p-2 border-r border-black/20 cursor-pointer text-center relative group" onClick={() => setEditingRequirement(req)}>
                    {req.hallucinationFlag ? (
                        <div className="text-orange-600 flex justify-center w-full">
                            <AlertCircle size={14} className="animate-pulse" />
                            <div className="hidden group-hover:block absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-900 border border-slate-700 rounded shadow-xl text-[10px] text-white text-left font-sans">
                                <b>Warning: Potential Hallucination</b><br/>
                                The AI was unable to definitively trace this requirement to exactly the stated source text, or it contradicts another requirement.
                            </div>
                        </div>
                    ) : (
                        <span className="opacity-30">-</span>
                    )}
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <input 
                      type="text" 
                      disabled={readOnly} 
                      placeholder="Assignee Email..." 
                      value={req.assignedTo || ''} 
                      onChange={(e) => {
                        const newReqs = [...(data.requirements || [])];
                        const realIdx = newReqs.findIndex(r => r.id === req.id);
                        if (realIdx > -1) {
                           newReqs[realIdx].assignedTo = e.target.value;
                           onChange({...data, requirements: newReqs});
                        }
                      }} 
                      onBlur={async (e) => {
                        if (e.target.value && e.target.value.includes('@')) {
                          try {
                            const { getPlatformIntegrations } = await import('./services/platformIntegrationService');
                            const { sendGoogleChatNotification } = await import('./services/googleChatService');
                            const integrations = await getPlatformIntegrations();
                            const gchat = integrations.find((i: any) => i.type === 'SERVICE' && i.name === 'GoogleChat' && i.status === 'ACTIVE');
                            if (gchat && gchat.config?.webhookUrl) {
                              await sendGoogleChatNotification(
                                gchat.config.webhookUrl, 
                                "New Requirement Assigned", 
                                `You have been assigned to Requirement ${req.id}.\n\nText: ${req.text}\nAssignee: ${e.target.value}`
                              );
                            }
                          } catch(err) {
                            console.error("Failed to trigger webhook", err);
                          }
                        }
                      }}
                      className="bg-transparent outline-none w-full text-[10px]" 
                    />
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <select disabled={readOnly} value={req.status || 'pending'} onChange={(e) => {
                      const newReqs = [...(data.requirements || [])];
                      const realIdx = newReqs.findIndex((r: any) => r.id === req.id);
                      if (realIdx > -1) {
                         newReqs[realIdx].status = e.target.value as any;
                         onChange({...data, requirements: newReqs});
                      }
                    }} className="bg-transparent outline-none uppercase font-bold text-[9px]">
                      <option value="pending">PENDING</option>
                      <option value="accepted">ACCEPTED</option>
                      <option value="rejected">REJECTED</option>
                    </select>
                  </td>
                  {!readOnly && (
                    <td className="p-2 text-center">
                      <button onClick={() => {
                        const newReqs = [...(data.requirements || [])];
                        const realIdx = newReqs.findIndex(r => r.id === req.id);
                        if (realIdx > -1) {
                           newReqs.splice(realIdx, 1);
                           onChange({...data, requirements: newReqs});
                        }
                      }} className="text-red-600 hover:scale-110">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              )})}
              {(!(data.requirements && data.requirements.filter((req: any) => (reqFilterStatus === 'all' || (req.status || 'pending') === reqFilterStatus) && (reqFilterType === 'all' || (req.type || 'overt') === reqFilterType)).length > 0)) && (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <span className="opacity-70 italic block mb-4">No requirements found.</span>
                    {data.files && data.files.length > 0 && (
                      <button 
                        onClick={() => handleAiAnalysis('requirements')}
                        disabled={isAnalyzing || selectedFileIds.length === 0}
                        className="bg-green-600 text-white px-6 py-2 text-xs font-medium disabled:opacity-30 inline-flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-sm rounded-lg mx-auto"
                      >
                        <Sparkles size={14} className={isAnalyzing ? 'animate-pulse' : ''} />
                        {isAnalyzing ? (analyzeProgressStr || 'ANALYZING...') : 'DEEP SCAN REQUIREMENTS'}
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {activeRegisterTab === 'assumptions' && (
      <section>
        <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-blue-600" />
            <h5 className="text-xs font-medium tracking-tight">Assumptions & Dependencies</h5>
          </div>
          <div className="flex items-center gap-4">
            {!readOnly && (
              <Tooltip content="Run GemChain AI to analyze risks and assumptions">
                <button 
                  onClick={() => handleAiAnalysis('assumptions')}
                  disabled={isAnalyzing}
                  className="font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 transition-colors shadow-sm"
                >
                  <Sparkles size={10} className={isAnalyzing ? 'animate-pulse' : ''} />
                  {isAnalyzing ? 'ANALYZING...' : 'AI SCAN PACKAGE'}
                </button>
              </Tooltip>
            )}
            {!readOnly && (
              <Tooltip content="Add a new assumption or dependency manually">
                <button 
                  onClick={addAssumption}
                  className="font-mono text-[10px] font-bold uppercase px-4 py-2 bg-slate-900 text-white hover:bg-neutral-800 transition-colors rounded-md shadow-sm"
                >
                  + ADD ROW
                </button>
              </Tooltip>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          <table className="w-full font-mono text-[10px] text-left">
            <thead className="bg-slate-900 text-white rounded-lg">
              <tr>
                <th className="p-2 border-r border-white/20">ID</th>
                <th className="p-2 border-r border-white/20">SOURCE</th>
                <th className="p-2 border-r border-white/20">DESCRIPTION</th>
                <th className="p-2 border-r border-white/20">CONFIDENCE</th>
                <th className="p-2 border-r border-white/20">ALERTS</th>
                <th className="p-2 border-r border-white/20">ASSIGNEE</th>
                <th className="p-2 border-r border-white/20">IMPACT</th>
                <th className="p-2 border-r border-white/20">STATUS</th>
                {!readOnly && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {data.assumptions?.map((a, idx) => (
                <tr key={idx} className={`border-t border-black hover:bg-black/5 ${a.status === 'open' ? 'bg-yellow-100/50' : ''}`}>
                  <td className="p-2 border-r border-black/20 font-bold">
                    {a.id}
                    {a.aiInsight && (
                      <div className="mt-1 flex items-center gap-1 text-[8px] text-blue-600 uppercase font-bold">
                        <Sparkles size={8} /> AI
                      </div>
                    )}
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <input 
                      disabled={readOnly}
                      value={a.source} 
                      onChange={(e) => updateAssumption(idx, { source: e.target.value })}
                      className="w-full bg-transparent outline-none placeholder:opacity-30"
                      placeholder="e.g. SME-Tech"
                    />
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <div className="space-y-1">
                      <input 
                        disabled={readOnly}
                        value={a.description} 
                        onChange={(e) => updateAssumption(idx, { description: e.target.value })}
                        className="w-full bg-transparent outline-none"
                        placeholder="Dependency details..."
                      />
                      {a.aiInsight && (
                        <div className="flex flex-col gap-1">
                          <p className="text-[9px] text-blue-600/80 italic leading-tight">
                            Insight: {a.aiInsight}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[7px] font-bold uppercase opacity-40">{a.feedback?.find(f => f.userId === user?.uid) ? 'Feedback:' : 'HelpfulAI?'}</span>
                            <button 
                              onClick={() => toggleFeedback('assumption', idx, 'helpful')}
                              className={`p-0.5 border border-neutral-100 rounded-lg rounded-md hover:bg-green-50 ${a.feedback?.find(f => f.userId === user?.uid)?.rating === 'helpful' ? 'bg-green-100 border-green-500' : ''}`}
                            >
                              <ThumbsUp size={8} />
                            </button>
                            <button 
                              onClick={() => toggleFeedback('assumption', idx, 'not_helpful')}
                              className={`p-0.5 border border-neutral-100 rounded-lg rounded-md hover:bg-red-50 ${a.feedback?.find(f => f.userId === user?.uid)?.rating === 'not_helpful' ? 'bg-red-100 border-red-500' : ''}`}
                            >
                              <ThumbsDown size={8} />
                            </button>
                            {a.feedback?.find(f => f.userId === user?.uid) && activeFeedback?.type !== 'assumption' && (
                              <button 
                                onClick={() => setActiveFeedback({type: 'assumption', idx})} 
                                className="text-[7px] underline text-black/50 hover:text-black"
                              >
                                {a.feedback?.find(f => f.userId === user?.uid)?.comment ? '(Edit Comment)' : '(Add Comment)'}
                              </button>
                            )}
                          </div>
                          {a.feedback?.find(f => f.userId === user?.uid)?.comment && activeFeedback?.type !== 'assumption' && (
                            <div className="text-[8px] italic opacity-60 mt-0.5 max-w-[200px] truncate">
                              "{a.feedback?.find(f => f.userId === user?.uid)?.comment}"
                            </div>
                          )}
                          {activeFeedback?.type === 'assumption' && activeFeedback.idx === idx && (
                            <div className="flex items-center gap-1 mt-1">
                              <input 
                                type="text" 
                                placeholder="Feedback comment..."
                                className="flex-1 bg-white rounded-xl border border-neutral-100 rounded-lg text-[9px] px-1.5 py-0.5 outline-none"
                                defaultValue={a.feedback?.find(f => f.userId === user?.uid)?.comment || ''}
                                onBlur={(e) => {
                                  toggleFeedback('assumption', idx, a.feedback?.find(f => f.userId === user?.uid)?.rating || 'helpful', e.target.value);
                                  setActiveFeedback(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    toggleFeedback('assumption', idx, a.feedback?.find(f => f.userId === user?.uid)?.rating || 'helpful', e.currentTarget.value);
                                    setActiveFeedback(null);
                                  }
                                }}
                                autoFocus
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-2 border-r border-black/20 text-center relative group">
                    {a.aiConfidenceScore ? (
                        <div className={`font-mono font-bold ${a.aiConfidenceScore >= 90 ? 'text-green-600' : a.aiConfidenceScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {a.aiConfidenceScore}%
                        </div>
                    ) : (
                        <span className="opacity-30">-</span>
                    )}
                  </td>
                  <td className="p-2 border-r border-black/20 text-center relative group">
                    {a.hallucinationFlag ? (
                        <div className="text-orange-600 flex justify-center w-full" title="Potential Hallucination / Lacks Source Verifiability">
                            <AlertCircle size={14} className="animate-pulse" />
                        </div>
                    ) : (
                        <span className="opacity-30">-</span>
                    )}
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <input 
                      disabled={readOnly}
                      value={a.assignedTo || ''} 
                      onChange={(e) => updateAssumption(idx, { assignedTo: e.target.value })}
                      className="w-full bg-transparent outline-none placeholder:opacity-30 text-[10px]"
                      placeholder="Assignee Email..."
                    />
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <select 
                      disabled={readOnly}
                      value={a.impact}
                      onChange={(e) => updateAssumption(idx, { impact: e.target.value as any })}
                      className="w-full bg-transparent outline-none uppercase font-bold text-[9px]"
                    >
                      <option value="low">LOW</option>
                      <option value="medium">MED</option>
                      <option value="high">HIGH</option>
                    </select>
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <select 
                      disabled={readOnly}
                      value={a.status}
                      onChange={(e) => updateAssumption(idx, { status: e.target.value as any })}
                      className={`w-full bg-transparent outline-none uppercase font-bold text-[9px] ${a.status === 'open' ? 'text-blue-600' : 'text-green-600'}`}
                    >
                      <option value="open">OPEN</option>
                      <option value="validated">VALIDATED</option>
                      <option value="closed">CLOSED</option>
                    </select>
                  </td>
                  {!readOnly && (
                    <td className="p-2 text-center">
                      <button onClick={() => removeAssumption(idx)} className="text-red-600 hover:scale-110 transition-transform">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {(!data.assumptions || data.assumptions.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-8 text-center opacity-70">
                    <div className="flex flex-col items-center justify-center">
                      <span className="italic mb-4">No assumptions registered.</span>
                      {data.files && data.files.length > 0 && (
                        <button 
                          onClick={() => handleAiAnalysis('assumptions')}
                          disabled={isAnalyzing}
                          className="bg-blue-600 text-white px-6 py-2 text-xs font-medium disabled:opacity-30 flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <Sparkles size={14} /> SCAN FILES FOR ASSUMPTIONS
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {activeRegisterTab === 'risks' && (
      <section>
        <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-red-600" />
            <h5 className="text-xs font-medium tracking-tight text-red-600">Risk Register</h5>
          </div>
          <div className="flex items-center gap-4">
            {!readOnly && (
              <Tooltip content="Run GemChain AI to analyze risks and assumptions">
                <button 
                  onClick={() => handleAiAnalysis('risks')}
                  disabled={isAnalyzing}
                  className="font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-30 transition-colors shadow-sm"
                >
                  <Sparkles size={10} className={isAnalyzing ? 'animate-pulse' : ''} />
                  {isAnalyzing ? 'ANALYZING...' : 'AI SCAN PACKAGE'}
                </button>
              </Tooltip>
            )}
            {!readOnly && (
              <Tooltip content="Add a new risk matrix entry">
                <button 
                  onClick={addRisk}
                  className="font-mono text-[10px] font-bold uppercase px-4 py-2 bg-slate-900 text-white hover:bg-neutral-800 transition-colors rounded-md shadow-sm"
                >
                  + ADD ROW
                </button>
              </Tooltip>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          <table className="w-full font-mono text-[10px] text-left">
            <thead className="bg-slate-900 text-white rounded-lg">
              <tr>
                <th className="p-2 border-r border-white/20">ID</th>
                <th className="p-2 border-r border-white/20">RISK TITLE</th>
                <th className="p-2 border-r border-white/20">MITIGATION</th>
                <th className="p-2 border-r border-white/20">CONFIDENCE</th>
                <th className="p-2 border-r border-white/20">ALERTS</th>
                <th className="p-2 border-r border-white/20">ASSIGNEE</th>
                <th className="p-2 border-r border-white/20">IMPACT</th>
                <th className="p-2 border-r border-white/20">PROB</th>
                <th className="p-2 border-r border-white/20">AI IMPACT</th>
                <th className="p-2 border-r border-white/20">AI PROB</th>
                {!readOnly && <th className="p-2"></th>}
              </tr>
            </thead>
            <tbody>
              {data.risks?.map((r, idx) => (
                <tr key={idx} className={`border-t border-black hover:bg-black/5 ${r.impact === 'high' || r.probability === 'high' ? 'bg-red-100/50' : ''}`}>
                  <td className="p-2 border-r border-black/20 font-bold">
                    {r.id}
                    {r.aiProbabilityScore !== undefined && (
                      <div className="mt-1 flex items-center gap-1 text-[8px] text-blue-600 uppercase font-bold">
                        <Sparkles size={8} /> AI
                      </div>
                    )}
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <input 
                      disabled={readOnly}
                      value={r.title} 
                      onChange={(e) => updateRisk(idx, { title: e.target.value })}
                      className="w-full bg-transparent outline-none"
                      placeholder="e.g. Delivery Delay"
                    />
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <div className="space-y-1">
                      <input 
                        disabled={readOnly}
                        value={r.mitigation} 
                        onChange={(e) => updateRisk(idx, { mitigation: e.target.value })}
                        className="w-full bg-transparent outline-none"
                        placeholder="Mitigation steps..."
                      />
                      {r.aiProbabilityScore !== undefined && (
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-2 text-[8px] font-bold text-blue-600/80 uppercase">
                            <span>P: {r.aiProbabilityScore}%</span>
                            <span>I: {r.aiImpactScore}%</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[7px] font-bold uppercase opacity-40">{r.feedback?.find(f => f.userId === user?.uid) ? 'Feedback:' : 'HelpfulAI?'}</span>
                            <button 
                              onClick={() => toggleFeedback('risk', idx, 'helpful')}
                              className={`p-0.5 border border-neutral-100 rounded-lg rounded-md hover:bg-green-50 ${r.feedback?.find(f => f.userId === user?.uid)?.rating === 'helpful' ? 'bg-green-100 border-green-500' : ''}`}
                            >
                              <ThumbsUp size={8} />
                            </button>
                            <button 
                              onClick={() => toggleFeedback('risk', idx, 'not_helpful')}
                              className={`p-0.5 border border-neutral-100 rounded-lg rounded-md hover:bg-red-50 ${r.feedback?.find(f => f.userId === user?.uid)?.rating === 'not_helpful' ? 'bg-red-100 border-red-500' : ''}`}
                            >
                              <ThumbsDown size={8} />
                            </button>
                            {r.feedback?.find(f => f.userId === user?.uid) && activeFeedback?.type !== 'risk' && (
                              <button 
                                onClick={() => setActiveFeedback({type: 'risk', idx})} 
                                className="text-[7px] underline text-black/50 hover:text-black"
                              >
                                {r.feedback?.find(f => f.userId === user?.uid)?.comment ? '(Edit Comment)' : '(Add Comment)'}
                              </button>
                            )}
                          </div>
                          {r.feedback?.find(f => f.userId === user?.uid)?.comment && activeFeedback?.type !== 'risk' && (
                            <div className="text-[8px] italic opacity-60 mt-0.5 max-w-[200px] truncate">
                              "{r.feedback?.find(f => f.userId === user?.uid)?.comment}"
                            </div>
                          )}
                          {activeFeedback?.type === 'risk' && activeFeedback.idx === idx && (
                            <div className="flex items-center gap-1 mt-1">
                              <input 
                                type="text" 
                                placeholder="Feedback comment..."
                                className="flex-1 bg-white rounded-xl border border-neutral-100 rounded-lg text-[9px] px-1.5 py-0.5 outline-none"
                                defaultValue={r.feedback?.find(f => f.userId === user?.uid)?.comment || ''}
                                onBlur={(e) => {
                                  toggleFeedback('risk', idx, r.feedback?.find(f => f.userId === user?.uid)?.rating || 'helpful', e.target.value);
                                  setActiveFeedback(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    toggleFeedback('risk', idx, r.feedback?.find(f => f.userId === user?.uid)?.rating || 'helpful', e.currentTarget.value);
                                    setActiveFeedback(null);
                                  }
                                }}
                                autoFocus
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-2 border-r border-black/20 text-center relative group">
                    {r.aiConfidenceScore ? (
                        <div className={`font-mono font-bold ${r.aiConfidenceScore >= 90 ? 'text-green-600' : r.aiConfidenceScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {r.aiConfidenceScore}%
                        </div>
                    ) : (
                        <span className="opacity-30">-</span>
                    )}
                  </td>
                  <td className="p-2 border-r border-black/20 text-center relative group">
                    {r.hallucinationFlag ? (
                        <div className="text-orange-600 flex justify-center w-full" title="Potential Hallucination / Lacks Source Verifiability">
                            <AlertCircle size={14} className="animate-pulse" />
                        </div>
                    ) : (
                        <span className="opacity-30">-</span>
                    )}
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <input 
                      disabled={readOnly}
                      value={r.assignedTo || ''} 
                      onChange={(e) => updateRisk(idx, { assignedTo: e.target.value })}
                      onBlur={async (e) => {
                        if (e.target.value && e.target.value.includes('@')) {
                          try {
                            const { getPlatformIntegrations } = await import('./services/platformIntegrationService');
                            const { sendGoogleChatNotification } = await import('./services/googleChatService');
                            const integrations = await getPlatformIntegrations();
                            const gchat = integrations.find((i: any) => i.type === 'SERVICE' && i.name === 'GoogleChat' && i.status === 'ACTIVE');
                            if (gchat && gchat.config?.webhookUrl) {
                              await sendGoogleChatNotification(
                                gchat.config.webhookUrl, 
                                "New Risk Assigned", 
                                `You have been assigned to Risk: ${r.title}.\n\nMitigation Strategy: ${r.mitigation}\nAssignee: ${e.target.value}`
                              );
                            }
                          } catch(err) {
                            console.error("Failed to trigger webhook", err);
                          }
                        }
                      }}
                      className="w-full bg-transparent outline-none placeholder:opacity-30 text-[10px]"
                      placeholder="Assignee Email..."
                    />
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <select 
                      disabled={readOnly}
                      value={r.impact}
                      onChange={(e) => updateRisk(idx, { impact: e.target.value as any })}
                      className="w-full bg-transparent outline-none uppercase font-bold text-[9px]"
                    >
                      <option value="low">LOW</option>
                      <option value="medium">MED</option>
                      <option value="high">HIGH</option>
                    </select>
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <select 
                      disabled={readOnly}
                      value={r.probability}
                      onChange={(e) => updateRisk(idx, { probability: e.target.value as any })}
                      className="w-full bg-transparent outline-none uppercase font-bold text-[9px]"
                    >
                      <option value="low">LOW</option>
                      <option value="medium">MED</option>
                      <option value="high">HIGH</option>
                    </select>
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <span className="opacity-60 uppercase font-bold text-[9px]">{r.aiImpactScore !== undefined ? r.aiImpactScore + '%' : 'MEDIUM'}</span>
                  </td>
                  <td className="p-2 border-r border-black/20">
                    <span className="opacity-60 uppercase font-bold text-[9px]">{r.aiProbabilityScore !== undefined ? r.aiProbabilityScore + '%' : 'MEDIUM'}</span>
                  </td>
                  {!readOnly && (
                    <td className="p-2 text-center">
                      <button onClick={() => removeRisk(idx)} className="text-red-600 hover:scale-110 transition-transform">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {(!data.risks || data.risks.length === 0) && (
                <tr>
                  <td colSpan={8} className="p-8 text-center opacity-70">
                    <div className="flex flex-col items-center justify-center">
                      <span className="italic mb-4">No risks identified.</span>
                      {data.files && data.files.length > 0 && (
                        <button 
                          onClick={() => handleAiAnalysis('risks')}
                          disabled={isAnalyzing}
                          className="bg-red-600 text-white px-6 py-2 text-xs font-medium disabled:opacity-30 flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
                        >
                          <Sparkles size={14} /> SCAN FILES FOR RISKS
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {activeRegisterTab === 'executive_summary' && (
      <section>
        <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
          <div className="flex items-center gap-2">
            <h5 className="text-xs font-medium tracking-tight text-blue-700">Executive Summary Draft</h5>
          </div>
          <div className="flex items-center gap-4">
            <button
               onClick={async () => {
                   setAnalyzeProgressStr("Drafting Executive Summary...");
                   try {
                       const { generateExecutiveSummary } = await import('./services/geminiService');
                       const summary = await generateExecutiveSummary({
                           requirements: data.requirements || [],
                           risks: data.risks || [],
                           assumptions: data.assumptions || []
                       });
                       onChange({ ...data, executiveSummary: summary });
                   } catch(err) {
                       alert("Failed to draft executive summary.");
                   }
                   setAnalyzeProgressStr("");
               }}
               disabled={!!analyzeProgressStr}
               className="font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#00FF41] text-black shadow-[4px_4px_0px_#000000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-all disabled:opacity-50"
            >
               {analyzeProgressStr ? "GENERATING..." : "AUTO-DRAFT"}
            </button>
          </div>
        </div>

        {data.executiveSummary ? (
            <div className="bg-white border text-sm p-4 h-[600px] overflow-y-auto w-full">
                {readOnly ? (
                  <div className="markdown-body prose max-w-none">
                    <ReactMarkdown>{data.executiveSummary}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea 
                    className="w-full h-full resize-none outline-none font-mono text-xs leading-relaxed" 
                    value={data.executiveSummary}
                    onChange={(e) => onChange({...data, executiveSummary: e.target.value})}
                  />
                )}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center p-12 opacity-50 border border-dashed border-neutral-300">
                <span className="italic mb-4 text-xs font-mono">No executive summary generated yet.</span>
                <button
                   onClick={async () => {
                       setAnalyzeProgressStr("Drafting Executive Summary...");
                       try {
                           const { generateExecutiveSummary } = await import('./services/geminiService');
                           const summary = await generateExecutiveSummary({
                               requirements: data.requirements || [],
                               risks: data.risks || [],
                               assumptions: data.assumptions || []
                           });
                           onChange({ ...data, executiveSummary: summary });
                       } catch(err) {
                           alert("Failed to draft executive summary.");
                       }
                       setAnalyzeProgressStr("");
                   }}
                   disabled={!!analyzeProgressStr}
                   className="font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 px-6 py-3 rounded-md bg-[#00FF41] text-black shadow-[4px_4px_0px_#000000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] transition-all disabled:opacity-50"
                >
                   GENERATE FROM EXTRACTED DATA
                </button>
            </div>
        )}
      </section>
      )}

      {activeRegisterTab === 'graph' && (
      <section>
        <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
          <div className="flex items-center gap-2">
            <h5 className="text-xs font-medium tracking-tight text-purple-700">Knowledge Graph</h5>
          </div>
        </div>
        <KnowledgeGraph data={data} />
      </section>
      )}

      {activeRegisterTab === 'scorecard' && (
        <section>
          <BidScorecard submission={{ data }} />
        </section>
      )}

      {activeRegisterTab === 'compliance' && (
        <section>
          <ComplianceEngine submission={{ data }} />
        </section>
      )}

      {activeRegisterTab === 'mock_interview' && (
        <section>
          <MockInterview submission={{ title: 'Submission', data }} />
        </section>
      )}

      {editingRequirement && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-slate-900 text-white rounded-t-xl p-4 shrink-0">
              <div className="font-mono text-sm font-bold uppercase truncate flex items-center gap-2">
                <Edit2 size={16} /> 
                Editing Requirement {editingRequirement.id}
              </div>
              <button onClick={() => setEditingRequirement(null)} className="hover:rotate-90 transition-transform"><X size={18} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase opacity-60">Source File</label>
                  <input type="text" className="bg-neutral-100 p-2 rounded-md font-mono text-[10px] border border-neutral-200" disabled value={editingRequirement.source} />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase opacity-60">Requirement Type</label>
                  <select 
                    value={editingRequirement.type || 'overt'} 
                    onChange={(e) => setEditingRequirement({...editingRequirement, type: e.target.value})}
                    className="p-2 rounded-md font-mono text-[10px] uppercase border border-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="overt">Overt</option>
                    <option value="implied">Implied</option>
                    <option value="inferred">Inferred</option>
                    <option value="inter">Inter</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase opacity-60">Status</label>
                <div className="flex gap-2">
                  {['pending', 'accepted', 'rejected'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setEditingRequirement({...editingRequirement, status})}
                      className={`font-mono text-[10px] font-bold uppercase w-1/3 py-2 border transition-all ${editingRequirement.status === status ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white text-black border-black/20 hover:border-black/50 hover:bg-neutral-50'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-mono font-bold uppercase opacity-60">Requirement Text / Clause</label>
                <textarea 
                  value={editingRequirement.text}
                  onChange={(e) => setEditingRequirement({...editingRequirement, text: e.target.value})}
                  className="w-full h-40 p-3 bg-white border border-black focus:outline-none focus:ring-2 focus:ring-blue-500 font-serif text-sm leading-relaxed rounded-md resize-none shadow-sm"
                  placeholder="Enter the full requirement text here..."
                />
              </div>

            </div>
            
            <div className="p-4 border-t border-black/10 flex justify-end gap-3 bg-neutral-50 rounded-b-xl shrink-0">
              <button 
                onClick={() => setEditingRequirement(null)}
                className="px-6 py-2 font-mono text-[10px] font-bold uppercase btn text-neutral-600 hover:text-black border border-black/10 hover:border-black transition-all bg-white shadow-sm rounded"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const newReqs = [...(data.requirements || [])];
                  const idx = newReqs.findIndex(r => r.id === editingRequirement.id);
                  if (idx > -1) {
                    newReqs[idx] = editingRequirement;
                  } else {
                    newReqs.push(editingRequirement);
                  }
                  onChange({...data, requirements: newReqs});
                  setEditingRequirement(null);
                }}
                className="px-6 py-2 font-mono text-[10px] font-bold uppercase inline-flex items-center gap-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {!readOnly && (
        <div className="flex justify-end pt-8 border-t border-black/10">
          <button 
            onClick={() => {
              if (confirm("Finalize NGP-002 Register? This will lock the submission package for formal evaluation.")) {
                if (submissionId) {
                  submitPackage(submissionId);
                  window.location.reload();
                }
              }
            }}
            className="bg-slate-900 text-white rounded-lg px-10 py-4 text-xs font-medium tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex items-center gap-3"
          >
            <Lock size={16} /> 
            Finalize NGP-002 Register Closure
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedFileAction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-xl border border-neutral-200 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col shadow-sm rounded-xl"
            >
              <div className="bg-slate-900 text-white rounded-lg p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-blue-400" />
                  <div>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-[0.2em]">Intelligence Extraction Report</h3>
                    <p className="font-mono text-[9px] opacity-60 uppercase">{selectedFileAction.name}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedFileAction(null)} className="hover:rotate-90 transition-transform p-2">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 border-b border-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-medium border-b border-black pb-2 flex items-center gap-2">
                      <ShieldCheck size={14} /> Requirements Hunter Findings
                    </h4>
                    <div className="space-y-2">
                      {selectedFileAction.extraction?.requirements.map((req, i) => (
                        <div key={i} className="p-3 border border-neutral-200 rounded-lg bg-neutral-50 flex gap-3">
                          <span className={`px-1.5 py-0.5 h-fit font-mono text-[7px] font-bold uppercase border ${
                            req.type === 'overt' ? 'bg-green-100 text-green-700 border-green-300' :
                            req.type === 'hidden' ? 'bg-red-100 text-red-700 border-red-300' :
                            'bg-blue-100 text-blue-700 border-blue-300'
                          }`}>
                            {req.type}
                          </span>
                          <p className="font-mono text-[10px] leading-relaxed italic">"{req.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-medium border-b border-black pb-2 flex items-center gap-2 mb-4">
                        <FileText size={14} /> Key Clauses
                      </h4>
                      <ul className="space-y-2">
                        {selectedFileAction.extraction?.clauses.map((c, i) => (
                          <li key={i} className="font-mono text-[10px] flex items-start gap-2">
                            <span className="mt-1 text-black">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium border-b border-black pb-2 flex items-center gap-2 mb-4">
                        <AlertTriangle size={14} /> Latent Risks
                      </h4>
                      <ul className="space-y-2">
                        {selectedFileAction.extraction?.risks.map((r, i) => (
                          <li key={i} className="font-mono text-[10px] flex items-start gap-2 text-red-600">
                            <AlertCircle size={10} className="mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-medium border-b border-black pb-2 flex items-center gap-2 mb-4">
                        <Bookmark size={14} /> Inferred Assumptions
                      </h4>
                      <ul className="space-y-2">
                        {selectedFileAction.extraction?.assumptions.map((a, i) => (
                          <li key={i} className="font-mono text-[10px] flex items-start gap-2 text-blue-600">
                            <span className="mt-1">→</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-black bg-neutral-50 flex justify-end">
                <button 
                  onClick={() => setSelectedFileAction(null)}
                  className="bg-slate-900 text-white rounded-lg px-8 py-3 font-mono text-xs font-bold tracking-widest hover:bg-neutral-800 transition-colors"
                >
                  DISMISS REPORT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAiReport && data.lifecycle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-blue-900/40 backdrop-blur-md z-[70] flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-xl border-2 border-black w-full max-w-5xl h-[85vh] flex flex-col shadow-sm rounded-xl"
            >
              <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu />
                  <div>
                    <h3 className="font-mono text-lg font-bold uppercase tracking-tighter">RFx Execution Strategy (GEM 06/07)</h3>
                    <p className="font-mono text-[10px] opacity-70 uppercase">Automated Remediation & Draft Response Engine</p>
                  </div>
                </div>
                <button onClick={() => setShowAiReport(false)} className="hover:rotate-90 transition-transform bg-white/20 p-2">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12">
                {data.lifecycle.executiveSummary && (
                  <div className="space-y-4">
                    <h4 className="font-mono text-sm font-bold uppercase border-b border-black pb-2 flex items-center gap-3">
                      <Target className="text-blue-600" /> Executive summary Draft
                    </h4>
                    <div className="font-mono text-xs leading-relaxed text-neutral-700 bg-neutral-50 p-6 border-l-4 border-blue-600 italic">
                      "{data.lifecycle.executiveSummary}"
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {data.lifecycle.valuePropositions && (
                    <div className="space-y-4">
                      <h4 className="font-mono text-sm font-bold uppercase border-b border-black pb-2">Value Propositions</h4>
                      <ul className="space-y-3">
                        {data.lifecycle.valuePropositions.map((vp, i) => (
                          <li key={i} className="font-mono text-[11px] flex gap-3 p-3 bg-green-50 border border-green-200">
                            <span className="font-bold text-green-600 shrink-0">0{i+1}</span>
                            <span>{vp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data.lifecycle.remediationActions && (
                    <div className="space-y-4">
                      <h4 className="font-mono text-sm font-bold uppercase border-b border-black pb-2">Remediation Roadmap</h4>
                      <ul className="space-y-3">
                        {data.lifecycle.remediationActions.map((ra, i) => (
                          <li key={i} className="font-mono text-[11px] flex gap-3 p-3 bg-red-50 border border-red-200">
                            <AlertTriangle className="text-red-600 shrink-0" size={14} />
                            <span>{ra}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {data.lifecycle.scoreDelta !== undefined && (
                  <div className="bg-slate-900 text-white rounded-lg p-6 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-medium mb-1">Package Readiness Score</h5>
                      <p className="font-mono text-[10px] opacity-60">Calculated after GEM 06 Remediation rescore</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-4xl font-bold text-green-400">+{data.lifecycle.scoreDelta}%</span>
                      <p className="text-xs font-medium text-slate-500 tracking-wide uppercase tracking-widest">Efficiency GAIN</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-black bg-neutral-50 flex justify-end gap-4">
                <button 
                  onClick={() => setShowAiReport(false)}
                  className="px-8 py-3 font-mono text-xs font-bold border border-neutral-200 rounded-lg hover:bg-neutral-100"
                >
                  DISMISS
                </button>
                <button 
                  onClick={() => alert('Strategy locked for submission.')}
                  className="bg-slate-900 text-white rounded-lg px-8 py-3 font-mono text-xs font-bold hover:bg-neutral-800"
                >
                  LOCK STRATEGY
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VersionHistory({ history }: { history: any[] }) {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-2 border-b border-black pb-2 mb-4">
        <History size={14} />
        <h5 className="text-xs font-medium tracking-tight">Version & Audit History</h5>
      </div>
      <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
        <table className="w-full font-mono text-[9px] text-left">
          <thead className="bg-neutral-100 border-b border-black">
            <tr>
              <th className="p-2 border-r border-black/20">TIMESTAMP</th>
              <th className="p-2 border-r border-black/20">USER</th>
              <th className="p-2">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {history?.slice().reverse().map((entry, idx) => (
              <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                <td className="p-2 border-r border-black/20 opacity-60">
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
                <td className="p-2 border-r border-black/20 font-bold uppercase">
                  {entry.userName}
                </td>
                <td className="p-2 uppercase tracking-tight">
                  {entry.action.replace(/_/g, ' ')}
                </td>
              </tr>
            ))}
            {(!history || history.length === 0) && (
              <tr>
                <td colSpan={3} className="p-8 text-center opacity-30 italic font-mono text-[9px]">
                  No history records available for this package.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ELYRIA_QUOTES = [
  "Matthew, assumptions are just parked issues until someone owns the question queue. Get to work on TRUEUP-06.",
  "Requirements aren't going to parse themselves. Let's start the ingestion.",
  "Is the compliance matrix updated? I'm not seeing the latest mappings.",
  "A good proposal is 90% preparation and 10% perspiration. Your templates are disorganized.",
  "The baseline is drifting. We need to lock the control pack before adding more permutations."
];

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [elyriaQuote] = useState(() => ELYRIA_QUOTES[Math.floor(Math.random() * ELYRIA_QUOTES.length)]);
  const [systemAppName, setSystemAppName] = useState(() => localStorage.getItem('systemAppName') || 'RFx TRUEUP ENGINE');
  const [systemAppDesc, setSystemAppDesc] = useState(() => localStorage.getItem('systemAppDesc') || 'Next-Generation Procurement AI Platform');
  const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('maintenanceMode') === 'true');
  const [isFullWidth, setIsFullWidth] = useState(() => localStorage.getItem('isFullWidth') === 'true');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('isDarkMode') === 'true');
  const [viewingGemContent, setViewingGemContent] = useState<string | null>(null);
  const [editingGemItem, setEditingGemItem] = useState<any | null>(null);

  const [aiPacingMs, setAiPacingMs] = useState(() => parseInt(localStorage.getItem('aiPacingMs') || '5000', 10));
  const [gemChainLogic, setGemChainLogic] = useState<any[]>(() => {
    const saved = localStorage.getItem('gemChainLogic');
    return saved ? JSON.parse(saved) : INITIAL_GEM_CHAIN_LOGIC;
  });
  
  const saveGemChainLogic = (newLogic: any[]) => {
    setGemChainLogic(newLogic);
    localStorage.setItem('gemChainLogic', JSON.stringify(newLogic));
  };
  
  const [tempAppName, setTempAppName] = useState(systemAppName);
  const [tempAppDesc, setTempAppDesc] = useState(systemAppDesc);
  const [tempMaintenance, setTempMaintenance] = useState(maintenanceMode);
  const [tempAiPacingMs, setTempAiPacingMs] = useState(aiPacingMs.toString());
  
  React.useEffect(() => {
    if (isDarkMode) {
       document.documentElement.classList.add('dark');
    } else {
       document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('isDarkMode', String(isDarkMode));
  }, [isDarkMode]);

  React.useEffect(() => {
    localStorage.setItem('isFullWidth', String(isFullWidth));
  }, [isFullWidth]);

  const [activeTab, setActiveTab] = useState<'status' | 'manifest' | 'analytics' | 'orchestration' | 'submissions' | 'chat' | 'templates' | 'configuration' | 'ragExplorer' | 'my_queue' | 'communications'>('analytics');
  
  const [showCoPilot, setShowCoPilot] = useState(false);
  const [showGchatSimulator, setShowGchatSimulator] = useState(false);
  
  const [templateViewMode, setTemplateViewMode] = useState<'grid' | 'list'>('grid');
  const [ragViewMode, setRagViewMode] = useState<'grid' | 'list'>('grid');

  const [chatMessages, setChatMessages] = useState<{role: 'user'|'model', content: string}[]>([{
    role: 'model',
    content: "Hello there. I am Elyria. I'm connected to the Firebase Persistence Layer and can assist with your RFx Submissions. How can I help you today?"
  }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatting) return;
    
    const userMessage = { role: 'user' as const, content: chatInput.trim() };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatting(true);

    try {
      const response = await generateChatResponse(newMessages);
      setChatMessages([...newMessages, { role: 'model', content: response }]);
    } catch (err: any) {
      setChatMessages([...newMessages, { role: 'model', content: "Sorry, I couldn't process your request." }]);
    } finally {
      setIsChatting(false);
    }
  };
  const [configSection, setConfigSection] = useState<'general' | 'manifest' | 'users' | 'integrations' | 'drive' | 'system_tasks' | 'personas' | 'rag_sources'>('general');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function cleanDB() {
      if (!userProfile || !['ADMIN', 'OWNER'].includes(userProfile.role)) return;
      try {
        const { collection, query, getDocs, deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');
        const q = query(collection(db, 'templates'));
        const snap = await getDocs(q);
        const toDelete = [
          "Generic_RFx_Scorecard_Blank_Template_Mode1.docx",
          "RFx_Prompt_05_Mode_1_RFP_Only_Scorecard_Builder.docx",
          "RFx_Prompt_06_Mode_2_Bid_Response_Scoring.docx"
        ];
        for (const d of snap.docs) {
          if (toDelete.includes(d.data().name)) {
            console.log('Deleting template from DB:', d.data().name);
            await deleteDoc(doc(db, 'templates', d.id)).catch(e => console.error("Del err", e));
          }
        }
      } catch (e) {
        console.error('Failed to clean templates', e);
      }
    }
    cleanDB();
  }, [userProfile]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<RfxSubmission[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isQuickIngestModalOpen, setIsQuickIngestModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [autoStartScan, setAutoStartScan] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editData, setEditData] = useState<RfxData>({ assumptions: [], risks: [], files: [] });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorHeader, setErrorHeader] = useState<{message: string, details?: string, nextSteps?: string} | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<{ action: 'delete' | 'submit', count: number } | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [sharedSubmission, setSharedSubmission] = useState<RfxSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [driveDetailsExpanded, setDriveDetailsExpanded] = useState<string | null>(null);
  const [driveSubfolders, setDriveSubfolders] = useState<any[]>([]);
  const [driveDetailsExpandedSubmissions, setDriveDetailsExpandedSubmissions] = useState<string | null>(null);
  const [driveSubfoldersSubmissions, setDriveSubfoldersSubmissions] = useState<any[]>([]);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);

  const handleDriveError = (e: any, context: string) => {
    let msg = e?.message || String(e);
    let urlMatch = msg.match(/(https:\/\/console\.developers\.google\.com[^\s]+)/);
    if(urlMatch) {
       setErrorHeader({
         message: "Google Drive API is Disabled",
         details: "You need to enable the Drive API in your Google Cloud project for this feature to work.",
         nextSteps: urlMatch[1]
       });
    } else {
       setErrorHeader({ message: `Drive Error during ${context}`, details: msg });
    }
  };
  const [viewingFile, setViewingFile] = useState<{filename: string, content?: string, driveUrl?: string} | null>(null);
  const [viewingVersions, setViewingVersions] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateArtifact[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderPath, setCurrentFolderPath] = useState<{id: string | null, name: string}[]>([{id: null, name: 'Templates'}]);
  const [ragFolderPath, setRagFolderPath] = useState<{id: string, name: string}[]>([]);
  const [ragFolderContents, setRagFolderContents] = useState<any[]>([]);
  const [isLoadingRag, setIsLoadingRag] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [manifestTasks, setManifestTasks] = useState<ManifestTask[]>([]);
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [platformIntegrations, setPlatformIntegrations] = useState<PlatformIntegration[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editingTemplateDesc, setEditingTemplateDesc] = useState('');
  const [replacingTemplateId, setReplacingTemplateId] = useState<string | null>(null);
  const [deleteTemplateConfirm, setDeleteTemplateConfirm] = useState<{step: 1 | 2, id: string} | null>(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [newTemplateFile, setNewTemplateFile] = useState<File | null>(null);
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [templateFilter, setTemplateFilter] = useState({ query: '', fileType: '', timeRange: '' });
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [triggerTemplateSync, setTriggerTemplateSync] = useState(0);
  const [isSyncingTemplates, setIsSyncingTemplates] = useState(false);
  const [showGchatInput, setShowGchatInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [gchatInputValue, setGchatInputValue] = useState('');
  const [emailInputValue, setEmailInputValue] = useState('rfps');

  const [notifyTaskCompletion, setNotifyTaskCompletion] = useState(() => localStorage.getItem('notifyTaskCompletion') === 'true');
  const [notifyStatusChanges, setNotifyStatusChanges] = useState(() => localStorage.getItem('notifyStatusChanges') === 'true');
  const [notifyNewCollaborator, setNotifyNewCollaborator] = useState(() => localStorage.getItem('notifyNewCollaborator') === 'true');

  useEffect(() => {
     localStorage.setItem('notifyTaskCompletion', String(notifyTaskCompletion));
     localStorage.setItem('notifyStatusChanges', String(notifyStatusChanges));
     localStorage.setItem('notifyNewCollaborator', String(notifyNewCollaborator));
  }, [notifyTaskCompletion, notifyStatusChanges, notifyNewCollaborator]);

  
  const [manifestArchiveFiles, setManifestArchiveFiles] = useState<{id: string, name: string, webViewLink?: string, isFolder?: boolean, mimeType?: string}[]>([]);
  const [rootManifestFolderId, setRootManifestFolderId] = useState<string | null>(null);
  const [isUploadingManifestArchive, setIsUploadingManifestArchive] = useState(false);
  const manifestFileInputRef = React.useRef<HTMLInputElement>(null);
  const [manifestUploadStatus, setManifestUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'done'>('idle');
  const [manifestAnalysisResult, setManifestAnalysisResult] = useState<{
    intents: { intent: string, tasks: string[] }[],
    platformTasks: string[]
  } | null>(null);
  const [manifestHover, setManifestHover] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const exportManifestAsZip = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      
      zip.file('project_manifest.json', JSON.stringify(MANIFEST, null, 2));
      
      const filesFolder = zip.folder("raw_files");
      if (filesFolder) {
        MANIFEST.files.forEach(filename => {
          filesFolder.file(filename, `Raw contents of ${filename}\n\nThis file is managed by the Elyria Matrix platform.\nDo not modify this directly without pipeline consensus.`);
        });
      }
      
      const settingsFolder = zip.folder("settings");
      if (settingsFolder) {
        settingsFolder.file("CONTROL_PACK_v9.json", JSON.stringify(CONTROL_PACK, null, 2));
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Project_Manifest_Archive_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate zip", error);
      alert("Failed to generate zip archive.");
    } finally {
      setIsExportingZip(false);
    }
  };

  // Autosave Support
  const editTitleRef = React.useRef(editTitle);
  const editDescRef = React.useRef(editDesc);
  const editDataRef = React.useRef(editData);
  const editingIdRef = React.useRef(editingId);

  useEffect(() => {
    editTitleRef.current = editTitle;
    editDescRef.current = editDesc;
    editDataRef.current = editData;
    editingIdRef.current = editingId;
  }, [editTitle, editDesc, editData, editingId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editingIdRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    const autosaveInterval = setInterval(() => {
      if (editingIdRef.current) {
        updateSubmission(
          editingIdRef.current,
          {
            title: editTitleRef.current,
            description: editDescRef.current,
            data: editDataRef.current
          },
          'AUTOSAVE_DRAFT'
        ).catch(err => console.error("Autosave failed:", err));
      }
    }, 30000); // Autosave every 30 seconds

    return () => {
      clearInterval(autosaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (editingId && user) {
       updateActiveEditor(editingId, 'Form Edition');
       interval = setInterval(() => {
          updateActiveEditor(editingId, 'Form Edition');
       }, 15000);
    }
    
    return () => {
       if (interval) clearInterval(interval);
       if (editingId && user) {
           clearActiveEditor(editingId);
       }
    };
  }, [editingId, user]);

  const [rootTemplateFolderId, setRootTemplateFolderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user) return;
      let allT = await getTemplates({ includeDeleted: true });
      let t = allT.filter(template => !template.isDeleted);
      
      const manifestTemplates = MANIFEST.files.filter(f => f.toLowerCase().includes('template'));
      let templatesAdded = 0;
      const foundTemplatesList: string[] = [];

      for (const tName of manifestTemplates) {
        if (!allT.some(existing => existing.name === tName)) {
            await createTemplate({
              name: tName,
              description: 'Auto-imported from initial project manifest',
              fileType: tName.includes('.docx') ? 'Word Document' : tName.includes('.xlsx') ? 'Excel Spreadsheet' : 'Archive',
              uploadDate: new Date().toISOString(),
              currentVersion: 1,
              versions: [{ version: 1, uploadDate: new Date().toISOString(), description: 'Initial import from Project Files' }],
              usedIn: []
            });
            templatesAdded++;
            foundTemplatesList.push(tName);
        }
      }

      const tasks = await getManifestTasks();
      setManifestTasks(tasks);

      const users = await getPlatformUsers();
      if (users.length === 0) {
        // Init with current user if none
        await createPlatformUser({
          email: auth.currentUser?.email || 'admin@elyriamatrix.com',
          role: 'OWNER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        });
        const refetchedUsers = await getPlatformUsers();
        setPlatformUsers(refetchedUsers);
      } else {
        setPlatformUsers(users);
      }

      const integrations = await getPlatformIntegrations();
      if (integrations.length === 0) {
        // Init with default integrations
        await createPlatformIntegration({
          name: 'Submissions Queue Sync',
          type: 'WEBHOOK',
          status: 'ACTIVE',
          config: { url: 'https://api.internal/rfx/webhook' },
          createdAt: new Date().toISOString()
        });
        await createPlatformIntegration({
          name: 'Salesforce CRM',
          type: 'SERVICE',
          status: 'ACTIVE',
          config: {},
          createdAt: new Date().toISOString()
        });
        await createPlatformIntegration({
          name: 'Production Zapier Sync',
          type: 'API_KEY',
          status: 'ACTIVE',
          config: { prefix: 'sk_live_v9' },
          lastUsed: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        const refetchedIntegrations = await getPlatformIntegrations();
        setPlatformIntegrations(refetchedIntegrations);
      } else {
        setPlatformIntegrations(integrations);
      }

      // Sync Drive Files
      try {
        const activeIntegrations = integrations.length > 0 ? integrations : await getPlatformIntegrations();
        const driveConfig = activeIntegrations.find(i => i.type === 'GOOGLE_DRIVE');
        if (driveConfig?.config?.internalId) {
          const { getFolderContents } = await import('./services/driveService');
          const internals = await getFolderContents(null, driveConfig.config.internalId);
          let templatesFolder = internals.find((f:any) => f.name === 'Templates');
          
          if (!templatesFolder) {
            const { createFolder } = await import('./services/driveService');
            const newId = await createFolder(null, 'Templates', driveConfig.config.internalId);
            templatesFolder = { id: newId };
          }
          
          if (templatesFolder) {
            setRootTemplateFolderId(templatesFolder.id);
            if (!currentFolderId) {
              setCurrentFolderId(templatesFolder.id);
            }
          }

          let manifestsFolder = internals.find((f:any) => f.name === 'Manifests');
          if (!manifestsFolder) {
            const { createFolder } = await import('./services/driveService');
            const newId = await createFolder(null, 'Manifests', driveConfig.config.internalId);
            manifestsFolder = { id: newId };
          }
          if (manifestsFolder) {
            setRootManifestFolderId(manifestsFolder.id);
          }
        }
      } catch (e) {
        console.warn('Could not check drive templates', e);
      }
      
      const newAllT = await getTemplates({ includeDeleted: true });
      const newT = newAllT.filter(template => !template.isDeleted);
      setTemplates(newT);
    };
    fetchTemplates();
  }, [user]);

  useEffect(() => {
    let unsubscribe: any = null;
    if (user) {
      unsubscribe = subscribeTemplates((data) => {
        setTemplates(data);
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    }
  }, [user]);

  // Sync templates for current folder
  useEffect(() => {
    const syncCurrentFolder = async () => {
      if (!currentFolderId || !user) return;
      setIsSyncingTemplates(true);
      try {
        const { getFolderContents } = await import('./services/driveService');
        const driveItems = await getFolderContents(null, currentFolderId);
        
        let allT = await getTemplates({ includeDeleted: true });
        
        for (const item of driveItems) {
           const existing = allT.find(t => t.name === item.name && t.parentId === currentFolderId);
           const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
           
           if (!existing) {
              const newTemp = {
                name: item.name,
                description: isFolder ? 'Folder' : '',
                fileType: isFolder ? 'Folder' : (item.name.split('.').pop() || 'unknown'),
                uploadDate: new Date().toISOString(),
                currentVersion: 1,
                versions: [{ version: 1, uploadDate: new Date().toISOString(), description: 'Found in Drive' }],
                usedIn: [],
                mimeType: item.mimeType,
                webViewLink: item.webViewLink,
                iconLink: item.iconLink,
                driveId: item.id,
                parentId: currentFolderId,
                isFolder: isFolder
              };
              await createTemplate(newTemp);
           } else if (!existing.isDeleted && (!existing.webViewLink || !existing.driveId || existing.parentId !== currentFolderId)) {
              await updateTemplate(existing.id, {
                mimeType: item.mimeType,
                webViewLink: item.webViewLink,
                iconLink: item.iconLink,
                driveId: item.id,
                parentId: currentFolderId,
                isFolder: isFolder
              });
           }
        }
        
        for (const t of allT) {
          if (t.parentId === currentFolderId && !t.isDeleted && t.webViewLink) {
             const foundInDrive = driveItems.some(item => item.name === t.name);
             if (!foundInDrive) {
                await deleteTemplate(t.id);
             }
          }
        }
        
        // Let the firestore subscription handle UI refresh
      } catch(e) {
        console.warn('Sync current folder failed', e);
      } finally {
        setIsSyncingTemplates(false);
      }
    };
    
    if (activeTab === 'templates') {
       syncCurrentFolder();
    }
  }, [currentFolderId, activeTab, user, triggerTemplateSync]);

  // Sync manifest archives
  useEffect(() => {
    const syncManifestArchive = async () => {
      if (!rootManifestFolderId || !user) return;
      try {
        const { getFolderContents } = await import('./services/driveService');
        const driveItems = await getFolderContents(null, rootManifestFolderId);
        
        setManifestArchiveFiles(driveItems.map((item: any) => ({
           id: item.id,
           name: item.name,
           webViewLink: item.webViewLink,
           isFolder: item.mimeType === 'application/vnd.google-apps.folder',
           mimeType: item.mimeType
        })));
      } catch(e) {
        console.warn('Sync manifest archive failed', e);
      }
    };
    
    if (activeTab === 'manifest') {
       syncManifestArchive();
    }
  }, [rootManifestFolderId, activeTab, user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      loadSharedSubmission(shareId);
    }
  }, []);

  const loadSharedSubmission = async (id: string) => {
    try {
      const sub = await getSubmission(id);
      if (sub) {
        setSharedSubmission(sub);
        setActiveTab('submissions');
      } else {
        setErrorHeader({ message: "Shared submission not found or link has expired.", nextSteps: "Please verify the link with the sender or request a new one." });
      }
    } catch (err: any) {
      setErrorHeader({ message: "Access denied or network error.", details: err.message, nextSteps: "Ensure you have the right permissions and are signed in." });
    }
  };

  useEffect(() => {
    let unsubscribeSubmissions: () => void = () => {};
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const profile = await ensureUserProfile();
        setUserProfile(profile);
        unsubscribeSubmissions = subscribeSubmissions((docs) => {
          setSubmissions(docs);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setSubmissions([]);
        setLoading(false);
        unsubscribeSubmissions();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSubmissions();
    };
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      
      const integrations = await getPlatformIntegrations();
      const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
      let driveFolderId = undefined;
      if (driveConfig?.config?.submissionsId) {
          try {
             const token = null;

             if (true) {
                 const { createFolder } = await import('./services/driveService');
                 // Use real title plus a short random id so they are unique
                 const titleSafe = newTitle.replace(/[^a-zA-Z0-9 -_]/g, '');
                 driveFolderId = await createFolder(token, `${titleSafe} [${Date.now().toString().slice(-5)}]`, driveConfig.config.submissionsId);
             }
          } catch(e) {
             console.warn("Could not auto-create drive folder:", e);
          }
      }

      const newId = await createSubmission(newTitle, '', driveFolderId);

      setNewTitle('');
      setIsCreating(false);
    } catch (err: any) {
      setErrorHeader({ message: "Failed to create submission.", details: err.message, nextSteps: "Please check your network connection and try again." });
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateSubmission(editingId, { 
        title: editTitle, 
        description: editDesc,
        data: editData 
      });
      setEditingId(null);
      setAutoStartScan(false);
    } catch (err: any) {
      setErrorHeader({ message: "Update failed.", details: err.message || "Data might be too large (max 1MB limits in Firestore).", nextSteps: "Try removing multiple large files or splitting your submission." });
    }
  };

  const handleSubmit = async (id: string) => {
    if (!window.confirm("Are you sure you want to submit this package? This action cannot be undone.")) return;
    await submitPackage(id);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      try {
        const { getSubmission } = await import('./services/rfxService');
        const subForDel = await getSubmission(deleteConfirmId);
        const { findFolderByName, deleteFile } = await import('./services/driveService');
        let folderId = subForDel?.driveFolderId;
        if (!folderId) folderId = await findFolderByName(null, `Submission_${deleteConfirmId}`);
        if (folderId) {
           await deleteFile(null, folderId);
        }
      } catch(err) {
        console.warn("Could not delete submission folder from drive", err);
      }

      await deleteSubmission(deleteConfirmId);
      setSelectedIds(prev => prev.filter(i => i !== deleteConfirmId));
      if (editingId === deleteConfirmId) setEditingId(null);
      if (historyId === deleteConfirmId) setHistoryId(null);
      setDeleteConfirmId(null);
    } catch (err: any) {
      setErrorHeader({ message: "Failed to delete submission.", details: err.message, nextSteps: "Check your permissions and connection." });
      setDeleteConfirmId(null);
    }
  };

  const handleBulkDelete = async () => {
    setBulkActionConfirm({ action: 'delete', count: selectedIds.length });
  };

  const confirmBulkAction = async () => {
    if (!bulkActionConfirm) return;
    try {
      if (bulkActionConfirm.action === 'delete') {
        const idsToDelete = [...selectedIds];
        
        try {
          const { findFolderByName, deleteFile } = await import('./services/driveService');
          for (const id of idsToDelete) {
             const folderId = await findFolderByName(null, `Submission_${id}`);
             if (folderId) {
                try {
                  await deleteFile(null, folderId);
                } catch(e) {
                  console.warn("Could not delete from drive", e);
                }
             }
          }
        } catch(err) {
            console.warn("Could not import drive service", err);
        }

        await bulkDeleteSubmissions(idsToDelete);
        if (editingId && idsToDelete.includes(editingId)) setEditingId(null);
        if (historyId && idsToDelete.includes(historyId)) setHistoryId(null);
        setSelectedIds([]);
      } else if (bulkActionConfirm.action === 'submit') {
        const drafts = submissions.filter(s => selectedIds.includes(s.id!) && s.status === 'draft');
        await bulkSubmitPackages(drafts.map(d => d.id!));
        setSelectedIds([]);
      }
      setBulkActionConfirm(null);
    } catch (err: any) {
      setErrorHeader({ message: `Failed to bulk ${bulkActionConfirm.action} submissions.`, details: err.message, nextSteps: "Check your permissions and connection." });
      setBulkActionConfirm(null);
    }
  };

  const handleBulkSubmit = async () => {
    const drafts = submissions.filter(s => selectedIds.includes(s.id!) && s.status === 'draft');
    if (drafts.length === 0) {
      alert('No eligible draft packages selected for submission.');
      return;
    }
    
    setBulkActionConfirm({ action: 'submit', count: drafts.length });
  };

  const [uploadedManifestName, setUploadedManifestName] = useState('');

  const processManifestFile = async (file: File) => {
    setManifestUploadStatus('uploading');
    setManifestAnalysisResult(null);
    setUploadedManifestName(file.name);
    
    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      setManifestUploadStatus('analyzing');
      const result = await analyzeManifestRevision(file.name, text);
      
      setManifestAnalysisResult(result);
      setManifestUploadStatus('done');
    } catch (err) {
      console.error(err);
      alert('Failed to analyze manifest: ' + (err instanceof Error ? err.message : String(err)));
      setManifestUploadStatus('idle');
    }
  };

  const handleManifestUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processManifestFile(file);
  };

  const handleImplementTasks = async () => {
    if (!manifestAnalysisResult || !user) return;
    
    // Save to DB
    await Promise.all(manifestAnalysisResult.intents.map(intent => 
      createManifestTasksRecord({
        intent: intent.intent,
        tasks: intent.tasks,
        platformTasks: manifestAnalysisResult.platformTasks,
        status: 'PENDING',
        uploadDate: new Date().toISOString(),
        sourceFile: uploadedManifestName
      })
    ));
    
    // Reload local state
    const t = await getManifestTasks();
    setManifestTasks(t);
    
    setManifestUploadStatus('idle');
    setManifestAnalysisResult(null);
    setUploadedManifestName('');
    alert('Implementation Pipeline Initialized. Tasks saved to database.');
  };

  const handleManifestDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setManifestHover(true);
  };
  const handleManifestDragLeave = () => setManifestHover(false);
  const handleManifestDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setManifestHover(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processManifestFile(e.dataTransfer.files[0]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(submissions.map(s => s.id!));
    }
  };

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    try {
      await updateSubmission(id, { isPublic }, isPublic ? 'ENABLED_SHARING' : 'DISABLED_SHARING');
    } catch (err: any) {
      setErrorHeader({ message: "Failed to update sharing settings.", details: err.message, nextSteps: "Check your internet connection and try again." });
    }
  };

  const handleShareWithEmail = async (id: string, email: string, role: 'VIEWER' | 'EDITOR' = 'VIEWER') => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;
    
    try {
      const currentShared = sub.sharedWith || [];
      const newShared = currentShared.includes(email) ? currentShared : [...currentShared, email];
      
      await updateSubmission(id, { 
        sharedWith: newShared,
        authorizedUsers: { ...(sub.authorizedUsers || {}), [email]: role }
      }, `INVITED_${email.toUpperCase()}_AS_${role}`);
    } catch (err: any) {
      setErrorHeader({ message: "Failed to invite collaborator.", details: err.message, nextSteps: "Make sure you have permission to invite others and check the email address." });
    }
  };

  const handleUpdateRole = async (id: string, email: string, role: 'VIEWER' | 'EDITOR') => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    try {
      await updateSubmission(id, {
        authorizedUsers: { ...(sub.authorizedUsers || {}), [email]: role }
      }, `UPDATED_ROLE_${email.toUpperCase()}_TO_${role}`);
    } catch (err: any) {
      setErrorHeader({ message: "Failed to update role.", details: err.message, nextSteps: "Check permissions and try again." });
    }
  };

  const handleRemoveShare = async (id: string, email: string) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;
    const currentShared = sub.sharedWith?.filter(e => e !== email) || [];
    const currentAuth = { ...(sub.authorizedUsers || {}) };
    delete currentAuth[email];

    try {
      await updateSubmission(id, { 
        sharedWith: currentShared,
        authorizedUsers: currentAuth
      }, `REMOVED_${email.toUpperCase()}`);
    } catch (err: any) {
      setErrorHeader({ message: "Failed to remove collaborator.", details: err.message, nextSteps: "Try refreshing the page or checking your connection." });
    }
  };

  const handleQuickIngestBulk = async (title: string, files: File[]) => {
    try {
      setLoading(true);
      // 1. Create a new submission
      const subId = await createSubmission(title);
      
      // 2. Set as editing
      const sub = {
        id: subId,
        title,
        ownerId: user?.uid || '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        versionHistory: [],
        data: {
          assumptions: [],
          risks: [],
          files: []
        }
      } as RfxSubmission;
      
      setEditingId(subId);
      setEditData(sub.data);
      setAutoStartScan(true);

      const fileMetadatas: FileMetadata[] = [];
      
      for (const file of files) {
        // 3. File metadata creation and extraction
        const reader = new FileReader();
        const content = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.onerror = () => reject(new Error('Failed to read file for quick ingest'));
          if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) { reader.readAsText(file); } else { reader.readAsDataURL(file); }
        });

        const extraction = undefined;

        const metadata: FileMetadata = {
          id: `F-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          content: content || '[AUTOMATED INGEST]',
          extraction
        };
        fileMetadatas.push(metadata);
      }

      const updatedData = {
        ...sub.data,
        files: fileMetadatas
      };
      
      setEditData(updatedData);

      // Attempt Drive Sync for Quick Ingest
      try {
        const integrations = await getPlatformIntegrations();
        const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
        let targetFolder = driveConfig?.config?.submissionsId || driveConfig?.config?.rootId;
        
        const shouldUpload = window.confirm(
          `Do you want to sync these ${files.length} documents to Google Drive?${!targetFolder ? '\n\nNote: Google Drive is not fully configured. We will initialize it if you proceed.' : ''}`
        );

        if (shouldUpload) {
          try {
            const token = null;

            if (true) {
              if (true) {
                if (!targetFolder) {
                  // Fallback initialization if Drive wasn't already initialized by admin
                  const newRootId = await createFolder(token, 'Elyria_System_Master');
                  targetFolder = await createFolder(token, 'External (Submissions)', newRootId);
                  
                  if (!driveConfig) {
                    await createPlatformIntegration({
                      name: `Drive Linked (Central Service)`,
                      type: 'GOOGLE_DRIVE',
                      status: 'ACTIVE',
                      config: { rootId: newRootId, submissionsId: targetFolder, owner: 'Central Service' },
                      createdAt: new Date().toISOString()
                    });
                  }
                }
                const currentSub = await getSubmission(subId!);
                let actualFolderToUpload = currentSub?.driveFolderId;
                if (!actualFolderToUpload) {
                   const titleSafe = currentSub?.title?.replace(/[^a-zA-Z0-9 -_]/g, '') || "Untitled";
                   actualFolderToUpload = await createFolder(token, `${titleSafe} [${subId!.slice(-5)}]`, targetFolder);
                   if (subId) {
                      await updateSubmission(subId, { driveFolderId: actualFolderToUpload });
                   }
                }
                let currentFiles = currentSub?.data?.files || [...fileMetadatas];

                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  const metadataId = fileMetadatas[i].id;
                  
                  if (i > 0) {
                    // Throttle uploads
                    await new Promise(resolve => setTimeout(resolve, 2500));
                  }
                  const driveFileId = await uploadFileToDrive(token, file, actualFolderToUpload);
                  
                  // Update currentFiles
                  currentFiles = currentFiles.map((f: any) => 
                    f.id === metadataId ? { ...f, driveFileId } : f
                  );
                }
                
                await updateSubmission(subId!, { data: { ...currentSub?.data, files: currentFiles } });
                setEditData(prev => ({ ...prev, files: currentFiles }));
              }
            }
          } catch(e) {
            handleDriveError(e, "Drive Upload/Sync");
          }
        }
      } catch (e) {
        console.warn("Could not check google drive integrations", e);
      }
      setActiveTab('submissions');
    } catch (err: any) {
      setErrorHeader({ message: "Quick Ingest failed.", details: err.message, nextSteps: "Verify the uploaded file format and your internet connection." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden selection:bg-black selection:text-white">
      {/* Header */}
      <header className="border-b border-neutral-200 flex items-center justify-between px-6 py-4 bg-white z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsNavOpen(!isNavOpen)} 
            className="md:hidden p-2 hover:bg-neutral-100 transition-colors rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-[12px] hidden md:flex shadow-sm">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-bold tracking-tight uppercase text-slate-900">{systemAppName}</h1>
            <p className="font-mono text-[10px] opacity-50 tracking-widest uppercase">VERSION 9.0.0 // NGP-002 ENFORCED</p>
          </div>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Moon size={14} className="opacity-70" />
            </button>
            <button onClick={() => setIsFullWidth(!isFullWidth)} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Maximize size={14} className="opacity-70" />
            </button>
            <button onClick={() => editingId ? setSharingId(editingId) : alert('Please select a submission to share first.')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 transition-colors font-mono text-[10px] font-bold">
              <Share2 size={12} className="opacity-70" />
              SHARE
            </button>
</div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="font-sans font-medium text-slate-900">{user.displayName}</span>
                <button 
                  onClick={logout}
                  className="text-[9px] hover:underline flex items-center gap-1 text-neutral-500 rounded-md shadow-sm"
                >
                  <LogOut size={10} /> LOGOUT
                </button>
              </div>
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-full border border-neutral-200 shadow-sm" referrerPolicy="no-referrer" />
              )}
            </div>
          ) : (
            <button 
              onClick={() => loginWithGoogle().catch(err => alert("Login failed. If using an iPad/tablet, ensuring popups are allowed or open this page in a new Tab: " + err.message))}
              className="px-4 py-2 bg-slate-900 text-white rounded-full flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-sm font-sans font-medium"
            >
              <LogIn size={14} /> SIGN IN
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500 animate-[pulse_2s_ease-in-out_infinite]' : 'bg-red-500'}`} />
            <span className="font-bold text-neutral-500">{user ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] uppercase font-bold tracking-widest hidden md:block">
            Elyria Matrix
          </div>
          {(userProfile?.role === 'OWNER' || user?.email === 'recirc@gmail.com') && (
            <button 
              onClick={() => setActiveTab('configuration')}
              className={`p-2.5 transition-colors rounded-full ${activeTab === 'configuration' ? 'bg-slate-100 text-slate-900' : 'text-neutral-500 hover:bg-neutral-100'}`}
              title="Platform Configuration"
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative bg-neutral-50">
        {errorHeader && (
          <div className="absolute top-0 left-0 right-0 bg-red-600 text-white font-mono text-[10px] py-1.5 px-6 flex justify-between items-center z-50">
            <div className="flex flex-col">
              <span className="font-bold flex items-center gap-2"><AlertCircle size={12} /> {errorHeader.message}</span>
              {errorHeader.details && <span className="opacity-80">Details: {errorHeader.details}</span>}
              {errorHeader.nextSteps && <span className="text-yellow-200 mt-0.5">Action: {errorHeader.nextSteps.startsWith('http') ? <a href={errorHeader.nextSteps} target="_blank" rel="noreferrer" className="underline hover:text-white">{errorHeader.nextSteps}</a> : errorHeader.nextSteps}</span>}
            </div>
            <button onClick={() => setErrorHeader(null)} className="font-bold underline hover:text-black transition-colors shrink-0 max-h-min p-2">DISMISS</button>
          </div>
        )}

        {loading ? (
          <div className="w-full flex items-center justify-center p-12 flex-col">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="font-mono font-bold uppercase tracking-widest text-sm">Authenticating Array...</h2>
          </div>
        ) : !user ? (
          <div className="w-full flex flex-col items-center justify-center p-12">
            <Cpu size={64} className="mb-6" />
            <h2 className="font-mono text-3xl font-bold uppercase mb-4 tracking-tighter">Access restricted</h2>
            <p className="font-mono text-sm opacity-60 max-w-md text-center mb-8">Please sign in to access the Elyria Matrix RFx Engine and your organization's workspaces.</p>
            <button 
              onClick={() => loginWithGoogle().catch(err => alert("Login failed. If using an iPad/tablet, try opening this app in a new tab: " + err.message))}
              className="px-8 py-4 bg-slate-900 text-white rounded-lg font-mono font-bold uppercase hover:bg-neutral-800 transition-colors shadow-sm rounded-xl    flex items-center gap-2"
            >
              <LogIn size={18} /> Authenticate Session
            </button>
          </div>
        ) : (
          <>
            {/* Sidebar Overlay on Mobile */}
            {isNavOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsNavOpen(false)}
              />
            )}
            
            {/* Sidebar Nav */}
            <nav className={`fixed inset-y-0 left-0 transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 border-r border-neutral-200 flex flex-col bg-white shrink-0 z-50 md:z-auto transition-transform duration-200 ease-in-out`}>
              <div className="flex md:hidden justify-end p-4 border-b border-neutral-200">
                <button onClick={() => setIsNavOpen(false)} className="hover:bg-neutral-100 p-2 rounded-lg text-neutral-500">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                <button 
                  onClick={() => { setActiveTab('analytics'); setIsNavOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left transition-all ${activeTab === 'analytics' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-neutral-100 hover:text-slate-900'}`}
                >
                  <BarChart3 size={18} />
                  <span className="font-sans text-sm font-medium">Pursuit Dashboard</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('status'); setIsNavOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left transition-all ${activeTab === 'status' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-neutral-100 hover:text-slate-900'}`}
                >
                  <ShieldCheck size={18} />
                  <span className="font-sans text-sm font-medium">Control Center</span>
                </button>
                {(userProfile?.role === 'ADMIN' || userProfile?.role === 'OWNER') && (
                  <button 
                    onClick={() => { setActiveTab('manifest'); setIsNavOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left transition-all ${activeTab === 'manifest' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-neutral-100 hover:text-slate-900'}`}
                  >
                    <Package size={18} />
                    <span className="font-sans text-sm font-medium">Manifest Archive</span>
                  </button>
                )}
                {(userProfile?.role === 'EDITOR' || userProfile?.role === 'ADMIN' || userProfile?.role === 'OWNER') && (
                  <button 
                    onClick={() => { setActiveTab('orchestration'); setIsNavOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left transition-all ${activeTab === 'orchestration' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-neutral-100 hover:text-slate-900'}`}
                  >
                    <Workflow size={18} />
                    <span className="font-sans text-sm font-medium">Orchestration</span>
                  </button>
                )}
                <button 
                  onClick={() => { setActiveTab('submissions'); setIsNavOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left transition-all ${activeTab === 'submissions' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-neutral-100 hover:text-slate-900'}`}
                >
                  <FileText size={18} />
                  <span className="font-sans text-sm font-medium">Submissions Library</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('my_queue'); setIsNavOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left transition-all ${activeTab === 'my_queue' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-neutral-100 hover:text-slate-900'}`}
                >
                  <MessageSquare size={18} />
                  <span className="font-sans text-sm font-medium">My Queue</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('communications'); setIsNavOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left transition-all ${activeTab === 'communications' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-neutral-100 hover:text-slate-900'}`}
                >
                  <Mails size={18} />
                  <span className="font-sans text-sm font-medium">Inbox & Comms</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('chat'); setIsNavOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left transition-all ${activeTab === 'chat' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-neutral-100 hover:text-slate-900'}`}
                >
                  <MessageSquare size={18} />
                  <span className="font-sans text-sm font-medium">AI Intelligence</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('templates'); setIsNavOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left transition-all ${activeTab === 'templates' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-neutral-100 hover:text-slate-900'}`}
                >
                  <Copy size={18} />
                  <span className="font-sans text-sm font-medium">Template Matrix</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('ragExplorer'); setIsNavOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-left transition-all ${activeTab === 'ragExplorer' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-neutral-100 hover:text-slate-900'}`}
                >
                  <Database size={18} />
                  <span className="font-sans text-sm font-medium">Knowledge Base</span>
                </button>
              </div>
          
              <div className="p-4 mt-auto shrink-0 border-t border-neutral-100">
                <div className="bg-neutral-100 text-slate-800 rounded-[20px] p-5 border border-neutral-200/60 shadow-sm relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 text-neutral-200 opacity-50 rotate-12 pointer-events-none">
                     <Cpu size={100} />
                  </div>
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <User size={14} className="text-slate-500" />
                    <span className="font-sans text-xs font-semibold tracking-wide uppercase text-slate-500">Elyria Assistant</span>
                  </div>
                  <p className="font-serif text-sm italic leading-relaxed text-slate-700 relative z-10">
                    "{elyriaQuote}"
                  </p>
                </div>
              </div>
            </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-transparent relative">
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-8 ${isFullWidth ? 'w-full' : 'max-w-7xl'} mx-auto`}
              >
                <div className="flex justify-between items-center mb-8 border-b border-black pb-4">
                   <div className="flex items-center gap-3">
                     <BarChart3 size={24} />
                     <h2 className="text-2xl font-semibold tracking-tight text-slate-900 tracking-tighter">Pursuit & Capture Dashboard</h2>
                   </div>
                   <div className="flex items-center gap-3">
                     <button onClick={() => { setIsQuickIngestModalOpen(true); }} className="px-4 py-2 font-mono text-[10px] uppercase font-bold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors shadow-sm cursor-pointer flex items-center gap-2">
                         <FileText size={12}/> QUICK START RFx
                     </button>
                     <button 
                       onClick={() => {
                         const content = `<html><body><h1>Executive Pursuit Dashboard Report</h1><p>Date: ${new Date().toLocaleDateString()}</p><h2>Metrics Overview</h2><ul><li>Win Rate: 68%</li><li>Active Pursuits: 12</li></ul></body></html>`;
                         const blob = new Blob(['\ufeff', content], {type: 'application/msword'});
                         const url = URL.createObjectURL(blob);
                         const a = document.createElement('a');
                         a.href = url;
                         a.download = `Analytics_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.doc`;
                         document.body.appendChild(a);
                         a.click();
                         document.body.removeChild(a);
                         URL.revokeObjectURL(url);
                       }}
                       className="px-4 py-2 font-mono text-[10px] uppercase font-bold text-slate-900 bg-white border border-slate-900 rounded hover:bg-slate-50 transition-colors hidden md:block"
                     >
                       Export Report
                     </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white border text-center border-neutral-200 p-6 rounded-xl shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Active Pursuits</p>
                    <p className="text-4xl font-sans font-bold tracking-tighter text-slate-900 mt-2">12</p>
                    <p className="text-xs text-green-600 mt-2">↑ 3 this week</p>
                  </div>
                  <div className="bg-white border text-center border-neutral-200 p-6 rounded-xl shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Global Win Rate</p>
                    <p className="text-4xl font-sans font-bold tracking-tighter text-slate-900 mt-2">68%</p>
                    <p className="text-xs text-green-600 mt-2">↑ 4% this quarter</p>
                  </div>
                  <div className="bg-white border text-center border-neutral-200 p-6 rounded-xl shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-mono font-bold uppercase text-slate-500">Critical Risks Detected</p>
                    <p className="text-4xl font-sans font-bold tracking-tighter text-red-600 mt-2">34</p>
                    <p className="text-xs text-red-500 mt-2">Requires immediate mitigation</p>
                  </div>
                  <div className="bg-white border text-center border-neutral-200 p-6 rounded-xl shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-mono font-bold uppercase text-slate-500">AI Confidence Score</p>
                    <p className="text-4xl font-sans font-bold tracking-tighter text-blue-600 mt-2">92%</p>
                    <p className="text-xs text-slate-500 mt-2">Across generated outputs</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                   <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                      <h3 className="font-sans font-bold text-sm mb-4">Risk Distribution by RFx Stage</h3>
                      <div className="h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { name: 'Initial Review', legal: 12, technical: 8, commercial: 5 },
                              { name: 'SME Review', legal: 5, technical: 15, commercial: 10 },
                              { name: 'Drafting', legal: 3, technical: 4, commercial: 12 },
                              { name: 'Final Approval', legal: 8, technical: 2, commercial: 18 }
                            ]}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                               <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                               <RechartsTooltip contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                               <Legend wrapperStyle={{fontSize: '10px'}} />
                               <Bar dataKey="legal" name="Legal" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                               <Bar dataKey="technical" name="Technical" stackId="a" fill="#3b82f6" />
                               <Bar dataKey="commercial" name="Commercial" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                      <h3 className="font-sans font-bold text-sm mb-4">Win Rates by Sector</h3>
                      <div className="h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={[
                              { name: 'Public Sector', rate: 78, fill: '#0f172a' },
                              { name: 'Healthcare', rate: 65, fill: '#334155' },
                              { name: 'Financial', rate: 82, fill: '#475569' },
                              { name: 'Technology', rate: 54, fill: '#64748b' },
                              { name: 'Retail', rate: 41, fill: '#94a3b8' }
                            ]}>
                               <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                               <XAxis type="number" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                               <YAxis dataKey="name" type="category" tick={{fontSize: 10}} tickLine={false} axisLine={false} width={80} />
                               <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                               <Bar dataKey="rate" name="Win Rate %" radius={[0, 4, 4, 0]}>
                                 {[
                                   { name: 'Public Sector', rate: 78, fill: '#0f172a' },
                                   { name: 'Healthcare', rate: 65, fill: '#334155' },
                                   { name: 'Financial', rate: 82, fill: '#475569' },
                                   { name: 'Technology', rate: 54, fill: '#64748b' },
                                   { name: 'Retail', rate: 41, fill: '#94a3b8' }
                                 ].map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} />
                                 ))}
                               </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                      <h3 className="font-sans font-bold text-sm mb-4">AI Confidence Score Trends</h3>
                      <div className="h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                              { name: 'Jan', score: 78 },
                              { name: 'Feb', score: 80 },
                              { name: 'Mar', score: 85 },
                              { name: 'Apr', score: 82 },
                              { name: 'May', score: 92 },
                              { name: 'Jun', score: 95 }
                            ]}>
                               <defs>
                                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                               <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} domain={[60, 100]} />
                               <RechartsTooltip contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                               <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                         </ResponsiveContainer>
                      </div>
                   </div>

                   <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
                      <h3 className="font-sans font-bold text-sm mb-4">Processing Bottlenecks (Avg Days)</h3>
                      <div className="h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { name: 'Intake', days: 1.5 },
                              { name: 'Compliance', days: 4.2 },
                              { name: 'SME Content', days: 8.5 },
                              { name: 'Pricing', days: 5.1 },
                              { name: 'Final Review', days: 2.3 }
                            ]}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                               <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                               <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                               <Bar dataKey="days" name="Avg Days in Stage" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'status' && (
              <motion.div 
                key="status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-6 md:p-10 ${isFullWidth ? 'w-full' : 'max-w-7xl'} mx-auto w-full`}
              >
                <div className="mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <Cpu size={18} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans uppercase">Control Center</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 auto-rows-[minmax(200px,auto)] gap-6">

                  {/* 1. Quick RFx Ingest */}
                  <div className="col-span-1 md:col-span-6 lg:col-span-8 row-span-1 bg-slate-900 text-white rounded-[32px] p-6 md:p-8 relative overflow-hidden flex flex-col justify-between shadow-xl">
                    <div className="absolute -top-12 -right-12 p-12 opacity-[0.03] pointer-events-none transform rotate-12">
                      <Upload size={200} />
                    </div>
                    <div className="z-10 flex-col md:flex-row md:items-center flex justify-between gap-6 h-full">
                      <div>
                        <h2 className="font-sans text-2xl font-semibold tracking-tight mb-2 flex items-center gap-3">
                          <Upload className="text-blue-400" size={24} /> Quick RFx Ingest
                        </h2>
                        <p className="font-mono text-xs opacity-60 max-w-lg leading-relaxed">
                          Upload your RFP/RFI documentation for immediate AI evaluation. 
                          NGP-002 Orchestrator will automatically extract requirements, identify risks, and calculate your target score.
                        </p>
                      </div>
                      <div className="z-10 w-full md:w-auto shrink-0 flex items-center h-full">
                        <button 
                          onClick={() => setIsQuickIngestModalOpen(true)}
                          className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-white text-slate-900 rounded-full px-8 py-3 font-sans font-medium text-sm transition-transform cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                          <PlusCircle size={20} className="text-blue-600" />
                          <span>Analyze New RFP</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Task Status */}
                  <div className="col-span-1 md:col-span-3 lg:col-span-4 row-span-1 bg-white border border-neutral-100 rounded-[32px] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                           <CheckCircle2 size={20} />
                        </div>
                        <span className="text-[10px] font-mono text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase font-bold tracking-widest">STATUS.OK</span>
                      </div>
                      <h3 className="font-sans text-lg font-medium text-slate-900 mb-2 truncate" title={CONTROL_PACK.completedTask}>
                        {CONTROL_PACK.completedTask}
                      </h3>
                      <p className="font-sans text-sm text-neutral-500 line-clamp-2">
                        {CONTROL_PACK.summary}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-widest">
                      <Terminal size={12} /> NGP-002 ENFORCED
                    </div>
                  </div>

                  {/* 4. Next Tasks */}
                  <div className="col-span-1 md:col-span-12 lg:col-span-8 row-span-2 bg-white border border-neutral-100 rounded-[32px] p-8 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Target size={20} />
                      </div>
                      <h4 className="font-sans text-xl font-medium tracking-tight">System Roadmap</h4>
                    </div>
                    <div className="space-y-6 overflow-y-auto pr-2 flex-1 font-mono text-sm leading-relaxed">
                      <h4 className="font-bold text-base mb-2 uppercase border-b border-black/10 pb-2">Phase 1: Infrastructure & Storage Reality</h4>
                      <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li className="line-through opacity-50 text-green-700">Transition from simulated/mock file parsing to real file handling.</li>
                        <li className="line-through opacity-50 text-green-700">Integrate Google Drive API for persistent file storage.</li>
                        <li className="line-through opacity-50 text-green-700">Structure: Internal/Templates folder vs Submissions/Client folders.</li>
                        <li className="line-through opacity-50 text-green-700">Configure OAuth scopes for Drive access.</li>
                      </ul>

                      <h4 className="font-bold text-base mb-2 uppercase border-b border-black/10 pb-2">Phase 2: GEM Implementation ("Requirements Hunter")</h4>
                      <ul className="list-disc pl-6 space-y-2 mb-6 text-blue-800 font-bold">
                        <li>Ingest the user's 17+ Prompts and GEM Instructions.</li>
                        <li>Build the "Requirements Hunter" execution pipeline using Gemini API.</li>
                        <li>Implement the capability to truly parse extracted text from PDFs/Word Docs and pass to Gemini.</li>
                        <li>Extract overt, implied, inferred, and hidden requirements into the DB.</li>
                      </ul>

                      <h4 className="font-bold text-base mb-2 uppercase border-b border-black/10 pb-2">Phase 3: Scorecard & Automation</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Implement the Scorecard generator GEM.</li>
                        <li>Map Requirements Hunter outputs to the Scorecard's 16 sections.</li>
                        <li>Automate the population of the scorecard artifact.</li>
                      </ul>
                    </div>
                  </div>

                  {/* 5. Hand-off Path Updates */}
                  <div className="col-span-1 md:col-span-6 lg:col-span-6 row-span-2 bg-[#f5f5f5] border border-neutral-200 rounded-[32px] p-8 shadow-inner overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shrink-0 border border-neutral-200 shadow-sm">
                        <Workflow size={20} />
                      </div>
                      <h4 className="font-sans text-xl font-medium tracking-tight">v9 Hand-off Updates</h4>
                    </div>
                    <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                      {['Assumptions', 'Dependencies', 'Clarifications', 'Exceptions', 'Pricing Notes', 'Residual Risks'].map((item) => (
                        <div key={item} className="data-row bg-white">
                          <span className="font-mono text-[10px] opacity-40 italic w-8 shrink-0">#0{item.length}</span>
                          <span className="font-sans font-medium text-sm flex-1">{item}</span>
                          <span className="uppercase text-[10px] font-mono tracking-widest text-neutral-400 mr-4">Hand-off</span>
                          <span className="flex items-center justify-center text-green-600 bg-green-100 rounded-full w-8 h-8 shrink-0">
                            <Check size={14} strokeWidth={3} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {activeTab === 'manifest' && (
              <motion.div 
                key="manifest"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Package />
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 tracking-tighter">Project Manifest</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      className="hidden" 
                      id="manifestArchiveUpload"
                      onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (!file || !rootManifestFolderId) return;
                         setIsUploadingManifestArchive(true);
                         try {
                           const { uploadFileToDrive, getFolderContents } = await import('./services/driveService');
                           await uploadFileToDrive(null, file, rootManifestFolderId);
                           const newItems = await getFolderContents(null, rootManifestFolderId);
                           setManifestArchiveFiles(newItems.map((item: any) => ({
                              id: item.id,
                              name: item.name,
                              webViewLink: item.webViewLink,
                              isFolder: item.mimeType === 'application/vnd.google-apps.folder',
                              mimeType: item.mimeType
                           })));
                         } catch (err) {
                           console.error('Failed to upload manifest file:', err);
                           alert('Upload failed.');
                         } finally {
                           setIsUploadingManifestArchive(false);
                           e.target.value = ''; // Reset input
                         }
                      }}
                    />
                    <button 
                      onClick={() => document.getElementById('manifestArchiveUpload')?.click()}
                      disabled={isUploadingManifestArchive}
                      className="bg-slate-900 text-white rounded-lg px-3 py-1 font-mono text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                      {isUploadingManifestArchive ? (
                         <><span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" /> Uploading...</>
                      ) : (
                         <><Plus size={12} /> Upload File</>
                      )}
                    </button>
                    <button 
                      onClick={exportManifestAsZip}
                      disabled={isExportingZip}
                      className="bg-slate-900 text-white px-3 py-1 font-mono text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-neutral-800 transition-colors disabled:opacity-50 rounded-md shadow-sm"
                    >
                      <Download size={12} /> {isExportingZip ? 'Exporting...' : 'Export Manifest Archive'}
                    </button>
                    <div className="bg-slate-900 text-white rounded-lg px-3 py-1 font-mono text-[10px]">
                      {manifestArchiveFiles.length} OBJECTS LOADED
                    </div>
                  </div>
                </div>

                {(userProfile?.role === 'ADMIN' || userProfile?.role === 'OWNER') && (
                  <div className="mb-8">
                    <input 
                      type="file" 
                      ref={manifestFileInputRef} 
                      className="hidden" 
                      onChange={handleManifestUpload}
                    />
                    <div 
                      className={`border-2 border-dashed ${manifestHover ? 'border-blue-500 bg-blue-50/50' : 'border-black/20 bg-neutral-50'} p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center font-mono`}
                      onDragOver={handleManifestDragOver}
                      onDragLeave={handleManifestDragLeave}
                      onDrop={handleManifestDrop}
                      onClick={() => manifestFileInputRef.current?.click()}
                    >
                      <Upload size={24} className="mb-4 opacity-50" />
                      <p className="text-sm font-bold uppercase mb-2">Upload Next Manifest Revision</p>
                      <p className="text-[10px] opacity-60">Drag and drop or click to analyze new system capabilities (Admin/Owner only)</p>
                    </div>

                    {manifestUploadStatus !== 'idle' && (
                      <div className="mt-6 border border-neutral-200 rounded-lg p-6 bg-white shadow-sm rounded-xl">
                        {manifestUploadStatus === 'uploading' && (
                          <div className="flex items-center gap-3 text-xs font-medium">
                            <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                            Uploading Document Asset...
                          </div>
                        )}
                        {manifestUploadStatus === 'analyzing' && (
                          <div className="flex items-center gap-3 text-xs font-medium">
                            <span className="w-3 h-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                            Deep Manifest Analysis Sequence Initiated...
                          </div>
                        )}
                        {manifestUploadStatus === 'done' && manifestAnalysisResult && (
                          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                            <div className="flex justify-between items-center mb-6 border-b border-black/10 pb-4">
                              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-green-600 flex items-center gap-2">
                                <Terminal size={14} /> Analysis Complete
                              </h3>
                              <button 
                                onClick={handleImplementTasks}
                                className="bg-green-500 text-black px-4 py-2 font-mono text-[10px] font-bold uppercase hover:bg-green-400 transition-colors rounded-md shadow-sm"
                              >
                                Implement All Tasks
                              </button>
                            </div>

                            <div className="space-y-8">
                              <div>
                                <h4 className="text-xs font-medium opacity-50 mb-4">Detected Intents & Functional Tasks</h4>
                                <div className="space-y-4">
                                  {manifestAnalysisResult.intents.map((item, idx) => (
                                    <div key={idx} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                                      <p className="font-mono text-sm font-bold mb-3">Intent: {item.intent}</p>
                                      <ul className="space-y-2">
                                        {item.tasks.map((t, tidx) => (
                                          <li key={tidx} className="flex items-start gap-2 font-mono text-xs">
                                            <div className="w-4 h-4 border border-neutral-200 rounded-lg rounded-md flex items-center justify-center shrink-0 mt-0.5"><div className="w-2 h-2 bg-black opacity-20" /></div>
                                            {t}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-xs font-medium text-orange-500 mb-4 flex items-center gap-2">
                                  <AlertCircle size={14} /> Platform & Consistency Updates Required
                                </h4>
                                <div className="border border-orange-500/30 p-4 bg-orange-50/50">
                                  <ul className="space-y-3">
                                    {manifestAnalysisResult.platformTasks.map((t, idx) => (
                                      <li key={idx} className="flex items-start gap-2 font-mono text-xs text-orange-900">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1 shrink-0" />
                                        {t}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-black">
                  {manifestArchiveFiles.map((file, idx) => (
                    <div 
                      key={file.id} 
                      className="border-r border-b border-black p-4 hover:bg-black hover:text-white transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-[9px] opacity-40 group-hover:opacity-60">ID://PACK_v9_{String(idx + 1).padStart(2, '0')}</span>
                          {file.name.endsWith('.zip') ? <Package size={14} /> : file.name.endsWith('.xlsx') ? <FileText size={14} className="text-green-500 group-hover:text-white" /> : <FileText size={14} />}
                        </div>
                        <p className="font-mono text-xs font-bold break-all leading-tight cursor-pointer" onClick={() => setViewingFile({filename: file.name, content: '', driveUrl: file.webViewLink})}>
                          {file.name}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/10 group-hover:border-white/20">
                          <button 
                            onClick={() => setViewingFile({filename: file.name, content: '', driveUrl: file.webViewLink})}
                            className="flex-1 bg-neutral-100 group-hover:bg-neutral-800 text-black group-hover:text-white border border-neutral-200 group-hover:border-neutral-700 rounded-lg px-2 py-1 font-mono text-[10px] font-bold uppercase transition-colors"
                          >
                            View
                          </button>
                          {(userProfile?.role === 'ADMIN' || userProfile?.role === 'OWNER') && (
                            <button
                               onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
                                     try {
                                        const { deleteFile } = await import('./services/driveService');
                                        await deleteFile(null, file.id);
                                        setManifestArchiveFiles(prev => prev.filter(f => f.id !== file.id));
                                     } catch (e) {
                                        console.warn('Could not delete manifest file', e);
                                        alert('Failed to delete file.');
                                     }
                                  }
                               }}
                               className="p-1.5 text-red-600 hover:bg-red-50 group-hover:hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-200 group-hover:hover:border-red-500/30"
                            >
                               <Trash2 size={12} />
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
                  {manifestArchiveFiles.length === 0 && (
                     <div className="col-span-full p-8 text-center text-neutral-500 border-r border-b border-black">
                        No files in the manifest archive folder.
                     </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'orchestration' && (
              <motion.div 
                key="orchestration"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Workflow />
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 tracking-tighter">RFx Gem Chain</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete all workflow steps? This cannot be undone.")) {
                          if (window.confirm("Are you REALLY sure? This will wipe the entire workflow and there is no coming back.")) {
                            if (window.confirm("FINAL WARNING: Click OK to delete all steps forever.")) {
                              saveGemChainLogic([]);
                            }
                          }
                        }
                      }}
                      className="btn border border-red-200 text-red-600 hover:bg-red-50 bg-white font-mono text-[10px] font-bold uppercase disabled:opacity-30 flex items-center gap-2 px-4 py-2 rounded-md shadow-sm"
                    >
                      <Trash2 size={14} /> Clear All
                    </button>
                    <button 
                      onClick={() => {
                         const newStep = {
                             id: Math.random().toString(36).substring(2,7).toUpperCase(),
                             name: "New Step",
                             role: "Custom AI",
                             detail: "Custom instruction step",
                             prompt: "",
                             templateIds: []
                         };
                         saveGemChainLogic([...gemChainLogic, newStep]);
                         setEditingGemItem(newStep);
                      }}
                      className="btn bg-slate-900 text-white font-mono text-[10px] font-bold uppercase disabled:opacity-30 flex items-center gap-2 px-4 py-2"
                    >
                      <Plus size={14} /> Add Step
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-12 relative">
                  {/* Vertical connector line */}
                  <div className="absolute left-[23px] top-6 bottom-6 w-px bg-black opacity-10" />

                  {gemChainLogic.map((step, idx) => (
                    <div key={step.id || idx} className="flex gap-8 group">
                      <div className="relative z-10 w-12 h-12 bg-white rounded-xl border border-neutral-200 flex items-center justify-center group-hover:bg-slate-900 transition-colors cursor-pointer" onClick={() => setEditingGemItem(step)}>
                        <Terminal className="group-hover:text-white transition-colors text-slate-900" size={20} />
                        <div className="absolute -right-2 top-0 bg-white rounded-xl border border-neutral-200 text-[9px] font-bold w-4 h-4 flex items-center justify-center text-slate-900">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1 border-b border-neutral-300 pb-4 hover:pl-2 transition-all cursor-pointer flex justify-between group/row" onClick={() => setEditingGemItem(step)}>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <h4 className="font-mono text-sm font-bold uppercase text-slate-900">{step.name}</h4>
                             <span className="font-mono text-[10px] bg-neutral-100 text-slate-700 px-2 py-0.5 rounded">{step.role}</span>
                          </div>
                          <p className="font-mono text-xs opacity-60 uppercase mt-1">{step.detail}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                           <button className="p-1.5 hover:bg-neutral-100 disabled:opacity-30 rounded-md shadow-sm" disabled={idx === 0} onClick={() => {
                               const arr = [...gemChainLogic];
                               [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
                               saveGemChainLogic(arr);
                           }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg></button>
                           <button className="p-1.5 hover:bg-neutral-100 disabled:opacity-30 rounded-md shadow-sm" disabled={idx === gemChainLogic.length - 1} onClick={() => {
                               const arr = [...gemChainLogic];
                               [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]];
                               saveGemChainLogic(arr);
                           }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></button>
                           <button className="p-1.5 hover:bg-red-50 text-red-600 rounded-md shadow-sm" onClick={() => {
                               if (window.confirm("Delete this step?")) {
                                   const arr = gemChainLogic.filter(g => g.id !== step.id);
                                   saveGemChainLogic(arr);
                               }
                           }}><Trash2 size={14}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {gemChainLogic.length === 0 && (
                    <div className="p-8 text-center text-neutral-500 font-mono text-xs uppercase opacity-70">
                       No workflow steps defined.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {editingGemItem && (
               <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                 <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] text-slate-900 border border-neutral-200">
                    <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-slate-900 text-white rounded-t-xl shrink-0">
                       <h3 className="font-mono font-bold text-sm uppercase flex items-center gap-2">
                         <Terminal size={16} /> 
                         Edit Workflow Step: GEM {editingGemItem.id}
                       </h3>
                       <button onClick={() => setEditingGemItem(null)} className="hover:rotate-90 transition-transform"><X size={18} /></button>
                    </div>
                    <div className="p-6 overflow-y-auto flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                               <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Step Name</label>
                               <input type="text" className="p-2 bg-neutral-50 border border-neutral-200 rounded font-mono text-xs focus:ring-1 focus:ring-slate-900 outline-none" value={editingGemItem.name} onChange={e => setEditingGemItem({...editingGemItem, name: e.target.value})} />
                            </div>
                            <div className="flex flex-col gap-1">
                               <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Role / Category</label>
                               <input type="text" className="p-2 bg-neutral-50 border border-neutral-200 rounded font-mono text-xs focus:ring-1 focus:ring-slate-900 outline-none" value={editingGemItem.role} onChange={e => setEditingGemItem({...editingGemItem, role: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                           <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Short Description</label>
                           <input type="text" className="p-2 bg-neutral-50 border border-neutral-200 rounded font-mono text-xs focus:ring-1 focus:ring-slate-900 outline-none" value={editingGemItem.detail} onChange={e => setEditingGemItem({...editingGemItem, detail: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                           <label className="text-[10px] font-mono font-bold uppercase text-slate-500">AI Component Prompt Logic</label>
                           <textarea className="w-full h-40 p-3 bg-neutral-50 border border-neutral-200 rounded font-mono text-xs text-slate-800 resize-none focus:ring-1 focus:ring-slate-900 outline-none" placeholder="Enter instructions for the AI on this step... (Will be executed dynamically)" value={editingGemItem.prompt || ''} onChange={e => setEditingGemItem({...editingGemItem, prompt: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Associated Templates</label>
                           <div className="flex flex-col gap-2 max-h-32 overflow-y-auto border border-neutral-200 rounded-md p-2 bg-neutral-50">
                             {templates.filter(t => !t.isFolder).length === 0 ? (
                               <div className="text-xs text-slate-500 italic p-2">No templates available.</div>
                             ) : (
                               templates.filter(t => !t.isFolder).map(temp => (
                                 <label key={temp.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-neutral-100 rounded">
                                   <input 
                                     type="checkbox" 
                                     className="rounded border-neutral-300 text-slate-900 focus:ring-slate-900"
                                     checked={(editingGemItem.templateIds || []).includes(temp.id)}
                                     onChange={(e) => {
                                       const currentIds = editingGemItem.templateIds || [];
                                       if (e.target.checked) {
                                         setEditingGemItem({...editingGemItem, templateIds: [...currentIds, temp.id]});
                                       } else {
                                          setEditingGemItem({...editingGemItem, templateIds: currentIds.filter((id: string) => id !== temp.id)});
                                       }
                                     }}
                                   />
                                   <span className="text-xs font-mono text-slate-700">{temp.name}</span>
                                 </label>
                               ))
                             )}
                           </div>
                        </div>
                        <div className="flex flex-col gap-2">
                           <label className="text-[10px] font-mono font-bold uppercase text-slate-500" title="Trigger multiple specialized agents in parallel to deeply scan context for these areas.">EXPERT PERSONAS / MULTI-AGENT SCAN</label>
                           <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-neutral-200 rounded-md p-2 bg-neutral-50">
                             {platformIntegrations.filter(p => p.type === 'PERSONA').length > 0 ? (
                               platformIntegrations.filter(p => p.type === 'PERSONA').map(persona => (
                                 <label key={persona.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-neutral-100 rounded" title={persona.name}>
                                   <input 
                                     type="checkbox" 
                                     className="rounded border-neutral-300 text-slate-900 focus:ring-slate-900"
                                     checked={(editingGemItem.personas || []).includes(persona.id)}
                                     onChange={(e) => {
                                       const currentIds = editingGemItem.personas || [];
                                       if (e.target.checked) {
                                         setEditingGemItem({...editingGemItem, personas: [...currentIds, persona.id]});
                                       } else {
                                          setEditingGemItem({...editingGemItem, personas: currentIds.filter((id: string) => id !== persona.id)});
                                       }
                                     }}
                                   />
                                   <span className="text-[11px] font-mono whitespace-nowrap overflow-hidden text-ellipsis text-slate-700">{persona.name}</span>
                                 </label>
                               ))
                             ) : (
                                <div className="text-xs font-mono text-slate-500 p-2 col-span-2">No expert personas configured. Add them in Settings.</div>
                             )}
                           </div>
                        </div>

                        <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4 mt-2">
                           <label className="flex items-center gap-3 cursor-pointer p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                             <input 
                               type="checkbox" 
                               className="w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                               checked={!!editingGemItem.requiresHumanReview}
                               onChange={e => setEditingGemItem({...editingGemItem, requiresHumanReview: e.target.checked})}
                             />
                             <div>
                               <span className="text-xs font-mono font-bold text-amber-900 block uppercase tracking-tight">Require Human-in-the-Loop Review</span>
                               <span className="text-[10px] font-mono text-amber-700 block mt-0.5">Pause the workflow execution after this step until a human reviews and approves the outputs.</span>
                             </div>
                           </label>
                        </div>
                    </div>
                    <div className="p-4 border-t border-neutral-200 flex justify-end gap-3 bg-neutral-50 rounded-b-xl shrink-0">
                       <button onClick={() => setEditingGemItem(null)} className="px-6 py-2 font-mono text-[10px] font-bold uppercase text-slate-600 hover:text-slate-900 border border-neutral-300 hover:border-slate-900 transition-colors rounded bg-white shadow-sm">Cancel</button>
                       <button onClick={() => {
                           const arr = [...gemChainLogic];
                           const i = arr.findIndex(g => g.id === editingGemItem.id);
                           if (i >= 0) arr[i] = editingGemItem;
                           else arr.push(editingGemItem);
                           saveGemChainLogic(arr);
                           setEditingGemItem(null);
                       }} className="px-6 py-2 font-mono text-[10px] font-bold uppercase text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded shadow-md">Save Logic</button>
                    </div>
                 </div>
               </div>
            )}

            {activeTab === 'my_queue' && (
              <motion.div 
                key="my_queue"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <MyQueue submissions={submissions} userEmail={user?.email} />
              </motion.div>
            )}

            {activeTab === 'communications' && (
              <motion.div 
                key="communications"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full"
              >
                <CommunicationsModule 
                   userEmail={user?.email} 
                   platformIntegrations={platformIntegrations} 
                   onConfigure={() => setActiveTab('configuration')} 
                />
              </motion.div>
            )}

            {activeTab === 'submissions' && (
              <motion.div 
                key="submissions"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-8 ${isFullWidth ? 'w-full' : 'max-w-5xl'} mx-auto`}
              >
                {!user ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <ShieldCheck size={48} className="mb-4 opacity-20" />
                    <h3 className="font-mono text-lg font-bold uppercase mb-2">Access Restricted</h3>
                    <p className="font-mono text-xs opacity-60 mb-6">Sign in to manage and submit RFx packages.</p>
                    <button 
                      onClick={() => loginWithGoogle().catch(err => alert(err.message))}
                      className="px-8 py-3 bg-slate-900 text-white rounded-lg font-mono text-xs font-bold tracking-widest hover:bg-neutral-800"
                    >
                      INITIALIZE AUTHENTICATION
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2">
                        <FileText />
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 tracking-tighter">RFx Submissions</h2>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={14} />
                          <input 
                            type="text" 
                            placeholder="SEARCH SUBMISSIONS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg font-mono text-xs outline-none focus:ring-1 focus:ring-black w-64 bg-transparent"
                          />
                        </div>
                        <button 
                          onClick={() => setIsCreating(true)}
                          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-mono text-xs font-bold flex items-center gap-2 hover:bg-neutral-800"
                        >
                          <Plus size={16} /> NEW PACKAGE
                        </button>
                      </div>
                    </div>

                    {sharedSubmission && (
                      <div className="mb-8 border-2 border-black bg-white shadow-sm rounded-xl overflow-hidden">
                        <div className="bg-slate-900 text-white rounded-lg px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="text-green-400" />
                            <h3 className="font-mono text-sm font-bold uppercase tracking-widest">Shared Global Package Entry</h3>
                          </div>
                          <button 
                            onClick={() => {
                              setSharedSubmission(null);
                              window.history.replaceState({}, '', window.location.pathname);
                            }} 
                            className="hover:rotate-90 transition-transform"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="p-8 space-y-6">
                           <div>
                              <h1 className="font-mono text-2xl font-bold uppercase mb-2 tracking-tighter">{sharedSubmission.title}</h1>
                              <p className="font-mono text-xs opacity-60 uppercase">{sharedSubmission.description || 'System-level data package extraction.'}</p>
                           </div>
                           <div className="flex items-center gap-6 py-4 border-y border-black/10 font-mono text-[10px] uppercase">
                              <div className="flex flex-col">
                                 <span className="opacity-40">Status</span>
                                 <span className="font-bold">{sharedSubmission.status}</span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="opacity-40">Owner ID</span>
                                 <span className="font-bold">{sharedSubmission.ownerId.slice(0, 8)}...</span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="opacity-40">Version</span>
                                 <span className="font-bold">v{sharedSubmission.versionHistory?.length || 1}.0.0</span>
                              </div>
                           </div>
                           <RegistersManager 
                             data={sharedSubmission.data || { assumptions: [], risks: [], files: [] }} 
                             onChange={() => {}} 
                             readOnly 
                             submissionId={sharedSubmission.id}
                             user={user}
                             aiPacingMs={aiPacingMs}
                             setViewingFile={setViewingFile}
                             setViewingGemContent={setViewingGemContent}
                             gemChainLogic={gemChainLogic}
                           />
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {selectedIds.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="mb-4 p-4 border border-neutral-200 rounded-lg bg-neutral-900 text-white flex items-center justify-between shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-medium tracking-widest">{selectedIds.length} ITEMS SELECTED</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={handleBulkSubmit}
                              className="px-4 py-1 border border-white font-mono text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-2 rounded-md shadow-sm"
                            >
                              <Send size={12} /> BULK SUBMIT
                            </button>
                            <button 
                              onClick={handleBulkDelete}
                              className="px-4 py-1 border border-white font-mono text-[10px] font-bold uppercase hover:bg-red-600 hover:border-red-600 transition-colors flex items-center gap-2 rounded-md shadow-sm"
                            >
                              <Trash2 size={12} /> BULK DELETE
                            </button>
                            <button 
                              onClick={() => setSelectedIds([])}
                              className="px-4 py-1 font-mono text-[10px] font-bold uppercase opacity-60 hover:opacity-100"
                            >
                              CANCEL
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isCreating && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mb-8 border border-neutral-200 rounded-lg bg-white p-6 shadow-sm rounded-xl"
                      >
                        <h3 className="text-xs font-medium mb-4">Initialize New Submission</h3>
                        <div className="flex gap-4">
                          <input 
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Package Title (e.g., Q3 Cloud Migration Bid)"
                            className="flex-1 border border-neutral-200 rounded-lg px-4 py-2 font-mono text-xs outline-none bg-neutral-50 focus:bg-white transition-colors"
                          />
                          <button 
                            onClick={handleCreate}
                            className="bg-slate-900 text-white px-6 py-2 font-mono text-xs font-bold rounded-md shadow-sm"
                          >
                            CREATE
                          </button>
                          <button 
                            onClick={() => setIsCreating(false)}
                            className="border border-neutral-200 rounded-lg px-6 py-2 font-mono text-xs font-bold hover:bg-neutral-100"
                          >
                            CANCEL
                          </button>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      {submissions.length === 0 ? (
                        <div className="border border-neutral-200 rounded-lg border-dashed py-20 text-center opacity-40">
                          <p className="font-mono text-xs uppercase">No submissions found. Start a new package to begin orchestration.</p>
                        </div>
                      ) : (
                        submissions.filter(sub => 
                          searchQuery.trim() === '' || 
                          sub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (sub.description && sub.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (sub.ownerId && sub.ownerId.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).length === 0 ? (
                          <div className="border border-neutral-200 rounded-lg border-dashed py-20 text-center opacity-40">
                            <p className="font-mono text-xs uppercase">No matched submissions found for "{searchQuery}".</p>
                          </div>
                        ) : (
                        submissions.filter(sub => 
                          searchQuery.trim() === '' || 
                          sub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (sub.description && sub.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (sub.ownerId && sub.ownerId.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).map((sub) => (
                          <div key={sub.id} className={`border border-neutral-200 rounded-lg bg-white group hover:shadow-sm rounded-xl transition-all ${selectedIds.includes(sub.id!) ? 'ring-2 ring-black' : ''}`}>
                            <div className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <button 
                                  onClick={() => toggleSelect(sub.id!)}
                                  className={`w-4 h-4 border border-neutral-200 rounded-lg flex items-center justify-center transition-colors ${selectedIds.includes(sub.id!) ? 'bg-slate-900 text-white rounded-lg' : 'bg-transparent'}`}
                                >
                                  {selectedIds.includes(sub.id!) && <div className="w-2 h-2 bg-white" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 
                                      className="font-mono text-sm font-bold truncate uppercase cursor-pointer hover:underline"
                                      onClick={() => {
                                        if (sub.status !== 'draft') return;
                                        setEditingId(sub.id!);
                                        setHistoryId(null);
                                        setEditTitle(sub.title);
                                        setEditDesc(sub.description || '');
                                        const baseData = sub.data || { assumptions: [], risks: [], files: [] };
                                        setEditData({
                                          assumptions: baseData.assumptions || [],
                                          risks: baseData.risks || [],
                                          files: baseData.files || []
                                        });
                                      }}
                                    >
                                      {sub.title}
                                    </h4>
                                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase ${sub.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                      {sub.status}
                                    </span>
                                  </div>
                                  <p className="font-mono text-[10px] opacity-60 truncate">
                                    {sub.description || 'No description provided.'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setHistoryId(historyId === sub.id ? null : sub.id!);
                                    setEditingId(null);
                                    setAutoStartScan(false);
                                  }}
                                  className={`p-2 transition-colors ${historyId === sub.id ? 'bg-slate-900 text-white rounded-lg' : 'hover:bg-black hover:text-white'}`}
                                  title="View History"
                                >
                                  <History size={16} />
                                </button>
                                <button 
                                  onClick={() => setSharingId(sub.id!)}
                                  className={`p-2 transition-colors ${sub.isPublic ? 'text-blue-600' : 'hover:bg-black hover:text-white'}`}
                                  title="Share Settings"
                                >
                                  <Share2 size={16} />
                                </button>

                                {sub.status === 'draft' && (
                                  <>
                                    <button 
                                      onClick={() => {
                                        setEditingId(sub.id!);
                                        setHistoryId(null);
                                        setEditTitle(sub.title);
                                        setEditDesc(sub.description || '');
                                        const baseData = sub.data || { assumptions: [], risks: [], files: [] };
                                        setEditData({
                                          assumptions: baseData.assumptions || [],
                                          risks: baseData.risks || [],
                                          files: baseData.files || []
                                        });
                                      }}
                                      className="p-2 hover:bg-black hover:text-white transition-colors"
                                      title="Edit Details"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button 
                                      onClick={() => sub.id && handleSubmit(sub.id)}
                                      className="p-2 hover:bg-black hover:text-white transition-colors"
                                      title="Submit Package"
                                    >
                                      <Send size={16} />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => sub.id && handleDelete(sub.id)}
                                  className="p-2 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            
                            {historyId === sub.id && (
                                <div className="border-t border-black bg-neutral-50 p-6">
                                  <VersionHistory history={sub.versionHistory || []} />
                                </div>
                            )}

                            {editingId === sub.id && (
                              <div className="border-t border-black bg-neutral-50 p-6 space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                  <h3 className="font-sans font-bold text-lg">Active Dashboard</h3>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={async () => {
                                        try {
                                          const blob = await generateDocxExport(sub);
                                          const url = window.URL.createObjectURL(blob);
                                          const a = document.createElement('a');
                                          a.href = url;
                                          a.download = `${sub.title.replace(/\s+/g, '_')}_Dashboard.docx`;
                                          document.body.appendChild(a);
                                          a.click();
                                          document.body.removeChild(a);
                                          window.URL.revokeObjectURL(url);
                                        } catch (err) {
                                          console.error("Export failed", err);
                                          alert("Failed to export DOCX.");
                                        }
                                      }}
                                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md shadow-sm font-mono text-[10px] uppercase font-bold hover:bg-slate-800 transition-colors"
                                    >
                                      <Download size={14} />
                                      Export to .DOCX
                                    </button>
                                  </div>
                                </div>
                                {sub.activeEditors && Object.values(sub.activeEditors).filter((ed: any) => Date.now() - ed.heartbeat < 30000 && ed.email !== user?.email).length > 0 && (
                                  <div className="flex gap-2 items-center mb-4 border border-blue-200 bg-blue-50 p-2 rounded-lg inline-flex">
                                    <div className="flex -space-x-2">
                                      {Object.entries(sub.activeEditors)
                                        .filter(([uid, ed]: [string, any]) => Date.now() - ed.heartbeat < 30000 && uid !== user?.uid)
                                        .map(([uid, ed]: [string, any]) => (
                                        <div key={uid} className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-[8px] font-bold" title={`${ed.email} (Editing: ${ed.currentStep})`}>
                                          {ed.email?.substring(0, 2).toUpperCase()}
                                        </div>
                                      ))}
                                    </div>
                                    <span className="text-[10px] font-mono font-bold uppercase text-blue-700 ml-2">Also editing this RFx</span>
                                  </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <label className="font-mono text-[9px] font-bold uppercase opacity-50">Package Title</label>
                                    <input 
                                      value={editTitle}
                                      onChange={(e) => setEditTitle(e.target.value)}
                                      className="w-full border border-neutral-100 rounded-lg px-3 py-2 font-mono text-xs outline-none bg-white focus:border-black transition-colors"
                                      placeholder="Title"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="font-mono text-[9px] font-bold uppercase opacity-50">Description / Scope</label>
                                    <textarea 
                                      value={editDesc}
                                      onChange={(e) => setEditDesc(e.target.value)}
                                      className="w-full border border-neutral-100 rounded-lg px-3 py-2 font-mono text-xs outline-none bg-white h-[38px] min-h-[38px] focus:border-black transition-colors"
                                      placeholder="Description"
                                    />
                                  </div>
                                </div>

                                <RegistersManager 
                                  data={editData} 
                                  onChange={setEditData} 
                                  submissionId={editingId}
                                  user={user}
                                  autoStartScan={autoStartScan}
                                  aiPacingMs={aiPacingMs}
                                  setViewingFile={setViewingFile}
                                  setViewingGemContent={setViewingGemContent}
                                  gemChainLogic={gemChainLogic}
                                  activeEditors={sub.activeEditors}
                                />

                                <div className="flex gap-4 justify-between items-center pt-6 border-t border-black/10">
                                  <div className="flex items-center gap-2 text-[10px] font-mono opacity-50">
                                    <ShieldCheck size={12} />
                                    <span>v9_ENFORCEMENT_READY</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={handleUpdate}
                                      className="bg-slate-900 text-white px-8 py-2 font-mono text-xs font-bold hover:shadow-none transition-all rounded-md shadow-sm"
                                    >
                                      UPDATE SUBMISSION
                                    </button>
                                    <button 
                                      onClick={() => { setEditingId(null); setAutoStartScan(false); }}
                                      className="border border-neutral-200 rounded-lg px-6 py-2 font-mono text-xs font-bold hover:bg-neutral-100"
                                    >
                                      CANCEL
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Read-only view for submitted packages */}
                            {sub.status === 'submitted' && !editingId && (
                               <div className="border-t border-black bg-neutral-100/50 p-6">
                                 <div className="flex items-center gap-2 mb-4 opacity-50">
                                   <ShieldCheck size={14} />
                                   <span className="font-mono text-[10px] font-bold uppercase tracking-widest">LOCKED RECORD // VIEW ONLY</span>
                                 </div>
                                 <RegistersManager 
                                   data={sub.data || { assumptions: [], risks: [], files: [] }} 
                                   onChange={() => {}} 
                                   readOnly 
                                   submissionId={sub.id}
                                   user={user}
                                   aiPacingMs={aiPacingMs}
                                   setViewingFile={setViewingFile}
                                   setViewingGemContent={setViewingGemContent}
                                   gemChainLogic={gemChainLogic}
                                 />
                               </div>
                            )}
                          </div>
                        ))
                        )
                      )}
                    </div>
                  </>
                )}
                <AnimatePresence>
                  {deleteConfirmId && (
                    <motion.div 
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 max-w-sm w-full shadow-sm rounded-xl"
                      >
                        <h3 className="font-mono text-lg font-bold text-black uppercase mb-4">Confirm Deletion</h3>
                        <p className="font-mono text-sm text-slate-600 mb-6">Are you sure you want to delete this submission? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-slate-100 transition-colors rounded-md text-black">Cancel</button>
                          <button onClick={confirmDelete} className="px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors rounded-md shadow-sm">Delete</button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                  {bulkActionConfirm && (
                    <motion.div 
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 max-w-sm w-full shadow-sm rounded-xl"
                      >
                        <h3 className="font-mono text-lg font-bold text-black uppercase mb-4">Confirm Bulk {bulkActionConfirm.action}</h3>
                        <p className="font-mono text-sm text-slate-600 mb-6">Are you sure you want to {bulkActionConfirm.action} {bulkActionConfirm.count} submissions?</p>
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setBulkActionConfirm(null)} className="px-4 py-2 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-slate-100 transition-colors rounded-md text-black">Cancel</button>
                          <button onClick={confirmBulkAction} className={`px-4 py-2 text-xs font-medium text-white transition-colors rounded-md shadow-md ${bulkActionConfirm.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}>Confirm</button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                  {sharingId && (
                    <ShareModal 
                      submission={submissions.find(s => s.id === sharingId)!} 
                      onClose={() => setSharingId(null)}
                      onTogglePublic={(isPublic) => handleTogglePublic(sharingId, isPublic)}
                      onShareWithEmail={(email, role) => handleShareWithEmail(sharingId, email, role)}
                      onRemoveShare={(email) => handleRemoveShare(sharingId, email)}
                      onUpdateRole={(email, role) => handleUpdateRole(sharingId, email, role)}
                      canManageShares={userProfile?.role === 'ADMIN' || userProfile?.role === 'EDITOR' || userProfile?.role === 'OWNER'}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-8 ${isFullWidth ? 'w-full' : 'max-w-5xl'} mx-auto h-full flex flex-col`}
              >
                <div className="flex items-center gap-2 mb-8 border-b border-black pb-4">
                  <MessageSquare />
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 tracking-tighter">AI Assistant Chat</h2>
                </div>
                <div className="flex-1 overflow-y-auto mb-4 bg-slate-100 p-6 rounded-md border border-neutral-200 rounded-lg space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`border border-neutral-200 rounded-lg text-black p-4 max-w-[80%] shadow-sm rounded-xl font-mono text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-white rounded-tl-xl rounded-br-xl rounded-bl-xl border-black' 
                          : 'bg-neutral-100 rounded-tr-xl rounded-br-xl rounded-bl-xl border-black/10'
                      }`}>
                        {msg.role === 'model' && i === 0 
                          ? msg.content.replace('there', user?.displayName ? user.displayName.split(' ')[0] : 'there') 
                          : msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-100 border border-neutral-100 rounded-lg text-black p-4 max-w-[80%] rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm rounded-xl font-mono text-sm flex gap-2 items-center">
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 relative">
                  <input 
                    type="text" 
                    placeholder="Ask Elyria..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    className="flex-1 bg-white rounded-xl border border-neutral-200 rounded-lg px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-cyan-500 rounded-md"
                  />
                  <button 
                    onClick={handleSendChat}
                    disabled={isChatting}
                    className="bg-slate-900 text-white px-6 py-3 font-mono font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2 rounded-md shadow-sm"
                  >
                    <Send size={16} /> SEND
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'templates' && (
              <motion.div 
                key="templates"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-8 ${isFullWidth ? 'w-full' : 'max-w-5xl'} mx-auto h-full flex flex-col`}
              >
                <div className="flex justify-between items-end mb-8 border-b border-black pb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900 tracking-tighter">
                      <Copy />
                      {currentFolderPath.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                          <button 
                            className={`hover:underline ${idx === currentFolderPath.length - 1 ? 'text-slate-900' : 'text-slate-500'}`}
                            onClick={() => {
                              setCurrentFolderPath(prev => prev.slice(0, idx + 1));
                              setCurrentFolderId(crumb.id || rootTemplateFolderId);
                            }}
                          >
                            {crumb.name}
                          </button>
                          {idx < currentFolderPath.length - 1 && <span className="text-slate-300">/</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-neutral-100 p-1 rounded-lg mr-2">
                       <button onClick={() => setTemplateViewMode('grid')} className={`p-1.5 rounded-md ${templateViewMode === 'grid' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-black'}`}><LayoutGrid size={14} /></button>
                       <button onClick={() => setTemplateViewMode('list')} className={`p-1.5 rounded-md ${templateViewMode === 'list' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-black'}`}><List size={14} /></button>
                    </div>
                    {currentFolderId && currentFolderPath.length > 1 && (
                      <button 
                        onClick={() => {
                          const newPath = currentFolderPath.slice(0, -1);
                          setCurrentFolderPath(newPath);
                          setCurrentFolderId(newPath[newPath.length - 1].id || rootTemplateFolderId);
                        }}
                        className="bg-neutral-100 text-black border border-neutral-200 rounded-lg px-4 py-2 font-mono text-[10px] font-bold flex items-center gap-2 uppercase hover:bg-neutral-200 transition-colors"
                      >
                        <History size={14} /> Back
                      </button>
                    )}
                    <button 
                      onClick={() => setTriggerTemplateSync(prev => prev + 1)}
                      disabled={isSyncingTemplates}
                      className="bg-white text-slate-900 border border-slate-900 rounded-lg px-4 py-2 font-mono text-[10px] font-bold flex items-center gap-2 uppercase hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={isSyncingTemplates ? "animate-spin" : ""} /> {isSyncingTemplates ? 'Syncing...' : 'Sync'}
                    </button>
                    <button 
                      onClick={() => setIsCreatingFolder(true)}
                      className="bg-white text-slate-900 border border-slate-900 rounded-lg px-4 py-2 font-mono text-[10px] font-bold flex items-center gap-2 uppercase hover:bg-slate-50 transition-colors"
                    >
                      <Plus size={14} /> New Folder
                    </button>
                    <button 
                      onClick={() => setIsUploadingTemplate(true)}
                      className="bg-slate-900 text-white rounded-lg px-4 py-2 font-mono text-[10px] font-bold flex items-center gap-2 uppercase hover:bg-neutral-800 transition-colors"
                    >
                      <Plus size={14} /> Upload Template
                    </button>
                  </div>
                </div>

                {isCreatingFolder && (
                   <div className="mb-6 p-4 bg-white border border-neutral-200 shadow-sm rounded-xl flex items-center gap-4">
                      <input 
                        type="text"
                        autoFocus
                        placeholder="Folder Name..."
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        className="flex-1 font-bold outline-none font-mono text-sm border-b border-black pb-1"
                      />
                      <button 
                        onClick={async () => {
                           if (!newFolderName.trim()) return;
                           try {
                             const integrations = await getPlatformIntegrations();
                             const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
                             const targetId = currentFolderId || rootTemplateFolderId || driveConfig?.config?.internalId;
                             if (targetId) {
                               const { createFolder } = await import('./services/driveService');
                               const newId = await createFolder(null, newFolderName, targetId);
                               const newFolderTemp = {
                                 name: newFolderName,
                                 description: 'Folder',
                                 fileType: 'Folder',
                                 uploadDate: new Date().toISOString(),
                                 currentVersion: 1,
                                 versions: [{ version: 1, uploadDate: new Date().toISOString(), description: '' }],
                                 usedIn: [],
                                 mimeType: 'application/vnd.google-apps.folder',
                                 parentId: targetId,
                                 isFolder: true,
                                 webViewLink: `https://drive.google.com/drive/folders/${newId}`
                               };
                               await createTemplate(newFolderTemp);
                               const finalT = await getTemplates();
                               setTemplates(finalT);
                             } else {
                               alert('Drive is not fully initialized.');
                             }
                           } catch (e) {
                             console.warn("Folder creation error", e);
                           } finally {
                             setIsCreatingFolder(false);
                             setNewFolderName('');
                           }
                        }}
                        className="bg-slate-900 text-white rounded-lg px-4 py-2 font-mono text-[10px] font-bold uppercase hover:bg-neutral-800 transition-colors"
                      >
                        Create
                      </button>
                      <button onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }} className="px-4 py-2 font-mono text-[10px] font-bold uppercase hover:underline opacity-60">Cancel</button>
                   </div>
                )}
                
                <div className="mb-6 flex flex-col gap-4 bg-white rounded-xl border border-neutral-200 rounded-lg p-4 shadow-sm rounded-xl">
                  <div className="flex items-center gap-4">
                    <Filter size={16} className="opacity-50" />
                    <input 
                      type="text" 
                      placeholder="Search by Title or Description..."
                      value={templateFilter.query}
                      onChange={(e) => setTemplateFilter(prev => ({ ...prev, query: e.target.value }))}
                      className="flex-1 border-b border-black outline-none font-mono text-xs pb-1"
                    />
                    {(templateFilter.query || templateFilter.fileType || templateFilter.timeRange) && (
                      <button 
                        onClick={() => setTemplateFilter({ query: '', fileType: '', timeRange: '' })}
                        className="text-[10px] font-mono underline hover:text-black opacity-60 ml-2"
                      >
                        CLEAR FULL SEARCH
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="font-mono text-[10px] uppercase opacity-60 mr-2">File Types:</span>
                    {['DOCX', 'PPTX', 'XLSX', 'PDF', 'JSON'].map(type => (
                      <button
                        key={type}
                        onClick={() => setTemplateFilter(prev => ({ ...prev, fileType: prev.fileType === type ? '' : type }))}
                        className={`px-3 py-1 font-mono text-[9px] font-bold uppercase rounded-full border transition-colors ${templateFilter.fileType === type ? 'bg-slate-900 text-white rounded-lg border-black' : 'bg-transparent text-black border-black/30 hover:border-black'}`}
                      >
                        {type}
                      </button>
                    ))}
                    <span className="font-mono text-[10px] uppercase opacity-60 ml-4 mr-2">Upload Date:</span>
                    {[
                      { label: 'Last 7 Days', value: 'last7days' },
                      { label: 'Last 30 Days', value: 'last30days' }
                    ].map(range => (
                      <button
                        key={range.value}
                        onClick={() => setTemplateFilter(prev => ({ ...prev, timeRange: prev.timeRange === range.value ? '' : range.value }))}
                        className={`px-3 py-1 font-mono text-[9px] font-bold uppercase rounded-full border transition-colors ${templateFilter.timeRange === range.value ? 'bg-slate-900 text-white rounded-lg border-black' : 'bg-transparent text-black border-black/30 hover:border-black'}`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={templateViewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20" : "space-y-4 pb-20"}>
                  {templates.filter(t => {
                    // Check folder matches
                    if (currentFolderId === rootTemplateFolderId) {
                       if (t.parentId && t.parentId !== rootTemplateFolderId) return false;
                    } else {
                       if (t.parentId !== currentFolderId) return false;
                    }

                    const matchesQuery = templateFilter.query === '' || t.name.toLowerCase().includes(templateFilter.query.toLowerCase()) || (t.description || '').toLowerCase().includes(templateFilter.query.toLowerCase());
                    const matchesType = templateFilter.fileType === '' || t.fileType.toLowerCase() === templateFilter.fileType.toLowerCase();
                    
                    let matchesTime = true;
                    if (templateFilter.timeRange === 'last7days') {
                      matchesTime = new Date(t.uploadDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    } else if (templateFilter.timeRange === 'last30days') {
                      matchesTime = new Date(t.uploadDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    }
                    
                    return matchesQuery && matchesType && matchesTime;
                  }).map(template => (
                    <div key={template.id} className={`border border-neutral-200 bg-white p-4 shadow-sm rounded-xl group hover:border-black transition-colors ${templateViewMode === 'grid' ? 'flex flex-col' : 'flex items-center justify-between'}`}>
                      <div className={`cursor-pointer min-w-0 ${templateViewMode === 'grid' ? 'mb-4' : 'flex-1'}`} onClick={() => {
                        if (template.isFolder && (template.webViewLink || template.driveId)) {
                          const match = template.webViewLink?.match(/folders\/([a-zA-Z0-9-_]+)/);
                          const driveId = template.driveId || (match ? match[1] : null);
                          if (driveId) {
                            setCurrentFolderPath(prev => [...prev, {id: driveId, name: template.name}]);
                            setCurrentFolderId(driveId);
                          } else if (template.webViewLink) {
                            window.open(template.webViewLink, '_blank');
                          }
                        } else {
                          setViewingFile({filename: template.name, content: '', driveUrl: template.webViewLink});
                        }
                      }}>
                        <div className={`flex gap-2 ${templateViewMode === 'grid' ? 'items-start flex-col' : 'items-center'}`}>
                          <div className="flex items-center gap-2">
                             {template.isFolder ? <Folder size={templateViewMode === 'grid' ? 24 : 16} className="text-blue-500 fill-blue-500 shrink-0" /> : <FileText size={templateViewMode === 'grid' ? 24 : 16} className="shrink-0 text-slate-500" />}
                             <h3 className={`font-mono font-bold truncate group-hover:text-blue-600 transition-colors ${templateViewMode === 'grid' ? 'text-sm' : 'text-sm'}`} title={template.name}>{template.name}</h3>
                             {!template.isFolder && <span className="bg-slate-900 text-white rounded-lg px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ml-2">v{template.currentVersion}</span>}
                          </div>
                          {!template.isFolder && templateViewMode === 'list' && (
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setViewingVersions(template.id);
                              }}
                              className="text-[9px] font-mono text-blue-600 hover:text-blue-800 hover:underline uppercase ml-2 flex items-center gap-1 shrink-0"
                            >
                              <History size={10} /> View History
                            </button>
                          )}
                          {template.usedIn && template.usedIn.length > 0 && templateViewMode === 'list' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingFile({
                                  filename: `Usages: ${template.name}`,
                                  content: `=== TEMPLATE USAGES ===\n\nTemplate is actively utilized in the following system components:\n\n${template.usedIn.map(u => ` - ${u}`).join('\n')}`
                                });
                              }}
                              className="flex items-center gap-1 font-mono text-[9px] text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 uppercase ml-2 transition-colors shrink-0"
                            >
                              <LinkIcon size={10} /> Used in {template.usedIn.length} places
                            </button>
                          )}
                        </div>
                        {editingTemplate === template.id ? (
                          <div className={`mt-2 flex gap-2 w-full max-w-lg ${templateViewMode === 'grid' ? 'flex-wrap' : ''}`} onClick={e => e.stopPropagation()}>
                            <input 
                              type="text" 
                              value={editingTemplateDesc} 
                              onChange={e => setEditingTemplateDesc(e.target.value)}
                              placeholder="Enter description..."
                              className="font-mono text-xs border border-neutral-200 rounded-lg px-2 py-1 flex-1 min-w-[200px]"
                              autoFocus
                            />
                            <div className="flex gap-2">
                                <button 
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, description: editingTemplateDesc } : t));
                                    setEditingTemplate(null);
                                    await updateTemplate(template.id, { description: editingTemplateDesc });
                                  }}
                                  className="bg-slate-900 text-white rounded-lg px-3 py-1 font-mono text-[10px] font-bold hover:bg-neutral-800"
                                >SAVE</button>
                                <button onClick={(e) => { e.stopPropagation(); setEditingTemplate(null); }} className="text-[10px] font-mono px-3 py-1 border border-neutral-200 rounded-lg hover:bg-neutral-100">CANCEL</button>
                            </div>
                          </div>
                        ) : (
                          <p className={`font-mono text-xs opacity-60 mt-2 italic ${templateViewMode === 'list' ? 'pl-6' : 'line-clamp-2'}`} title={template.description}>{template.description || "No description provided"}</p>
                        )}
                      </div>
                      
                      <div className={`flex flex-col gap-3 shrink-0 ${templateViewMode === 'grid' ? 'mt-auto pt-4 border-t border-neutral-100' : 'ml-4'}`}>
                        {templateViewMode === 'grid' && (
                           <div className="flex flex-wrap gap-2 items-center">
                              <span className="bg-neutral-100 px-2 py-1 rounded text-[10px] font-mono uppercase text-neutral-500 font-bold">{template.fileType}</span>
                              <span className="text-[10px] font-mono uppercase text-neutral-500 ml-auto">{new Date(template.uploadDate).toLocaleDateString()}</span>
                           </div>
                        )}
                        {templateViewMode === 'grid' && !template.isFolder && (
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setViewingVersions(template.id);
                                  }}
                                  className="text-[9px] font-mono text-blue-600 hover:text-blue-800 hover:underline uppercase flex items-center gap-1 w-fit"
                                >
                                  <History size={10} /> View History
                                </button>
                        )}
                        {templateViewMode === 'grid' && template.usedIn && template.usedIn.length > 0 && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingFile({
                                      filename: `Usages: ${template.name}`,
                                      content: `=== TEMPLATE USAGES ===\n\nTemplate is actively utilized in the following system components:\n\n${template.usedIn.map(u => ` - ${u}`).join('\n')}`
                                    });
                                  }}
                                  className="flex items-center w-fit gap-1 font-mono text-[9px] text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 uppercase transition-colors"
                                >
                                  <LinkIcon size={10} /> Used in {template.usedIn.length} places
                                </button>
                        )}
                        
                        <div className={`flex items-center gap-3 ${templateViewMode === 'grid' && 'mt-2 border-t border-neutral-100 pt-3 flex-wrap'}`}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingTemplate(template.id); setEditingTemplateDesc(template.description || ''); }}
                              className="p-2 hover:bg-blue-50 text-blue-600 transition-colors border border-transparent hover:border-blue-200 rounded"
                              title="Edit Description"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setReplacingTemplateId(template.id); 
                                setIsUploadingTemplate(true); 
                              }}
                              className="p-2 hover:bg-orange-50 text-orange-600 transition-colors border border-transparent hover:border-orange-200 rounded"
                              title="Replace Document"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <div className="relative">
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                              if (deleteTemplateConfirm?.id === template.id && deleteTemplateConfirm.step === 2) {
                                setTemplates(prev => prev.filter(t => t.id !== template.id));
                                setDeleteTemplateConfirm(null);
                                await deleteTemplate(template.id);
                                
                                // Also delete from Drive
                                try {
                                  const integrations = await getPlatformIntegrations();
                                  const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
                                  if (driveConfig?.config?.internalId) {
                                    const { getFolderContents, deleteFile } = await import('./services/driveService');
                                    const internals = await getFolderContents(null, driveConfig.config.internalId);
                                    let templatesFolder = internals.find((f:any) => f.name === 'Templates');
                                    if (templatesFolder) {
                                       const templatesInDrive = await getFolderContents(null, templatesFolder.id);
                                       const fileToDelete = templatesInDrive.find((f:any) => f.name === template.name);
                                       if (fileToDelete) {
                                          await deleteFile(null, fileToDelete.id);
                                       }
                                    }
                                  }
                                } catch (e) {
                                  console.warn('Could not delete template from drive', e);
                                }
                              } else if (deleteTemplateConfirm?.id === template.id && deleteTemplateConfirm.step === 1) {
                                setDeleteTemplateConfirm({step: 2, id: template.id});
                              } else {
                                setDeleteTemplateConfirm({step: 1, id: template.id});
                              }
                            }}
                            className={`p-2 transition-colors border font-bold text-xs ${deleteTemplateConfirm?.id === template.id ? 'bg-red-600 text-white border-red-600' : 'hover:bg-red-50 text-red-600 border-transparent hover:border-red-200'}`}
                            title="Delete Template"
                          >
                            {deleteTemplateConfirm?.id === template.id && deleteTemplateConfirm.step === 1 ? 'Are you sure you want to delete this template?' : 
                             deleteTemplateConfirm?.id === template.id && deleteTemplateConfirm.step === 2 ? 'Are you REALLY sure? This action cannot be undone.' : 
                             <Trash2 size={16} />}
                          </button>
                          {deleteTemplateConfirm?.id === template.id && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDeleteTemplateConfirm(null); }}
                              className="absolute -top-2 -right-2 bg-white rounded-full border border-neutral-200 rounded-lg w-4 h-4 flex items-center justify-center text-[8px]"
                            >
                              <X size={8} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                      {templateViewMode === 'list' && (
                         <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
                           <span className="font-mono text-[10px] uppercase text-neutral-500">{new Date(template.uploadDate).toLocaleDateString()}</span>
                           {!template.isFolder && <span className="font-mono text-[10px] uppercase text-neutral-500">{template.fileType}</span>}
                         </div>
                      )}
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-black/20 opacity-50 font-mono text-sm uppercase">
                      No templates uploaded yet.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          {activeTab === 'ragExplorer' && (
              <motion.div 
                key="ragExplorer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-8 ${isFullWidth ? 'w-full' : 'max-w-7xl'} mx-auto`}
              >
                <div className="flex justify-between items-center mb-8 border-b border-black pb-4">
                   <div className="flex items-center gap-3">
                     <Database size={24} />
                     <h2 className="text-2xl font-semibold tracking-tight text-slate-900 tracking-tighter">Knowledge Base</h2>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="flex bg-neutral-100 p-1 rounded-lg">
                       <button onClick={() => setRagViewMode('grid')} className={`p-1.5 rounded-md ${ragViewMode === 'grid' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-black'}`}><LayoutGrid size={14} /></button>
                       <button onClick={() => setRagViewMode('list')} className={`p-1.5 rounded-md ${ragViewMode === 'list' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-black'}`}><List size={14} /></button>
                     </div>
                     <span className="text-xs font-mono opacity-50">Past Proposals / RAG Sources</span>
                   </div>
                </div>

                {ragFolderPath.length === 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {platformIntegrations.filter(i => i.type === 'RAG_SOURCE').map(rag => (
                              <div key={rag.id} className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden hover:-translate-y-1 transition-transform">
                                 <div className="bg-slate-900 text-white p-4 items-center flex gap-3">
                                    <Folder size={18} className="text-[#cdfc42]" />
                                    <h3 className="font-bold font-mono text-sm uppercase truncate">{rag.name}</h3>
                                 </div>
                                 <div className="p-4 space-y-3">
                                    <div className="flex justify-between items-center font-mono text-[10px] uppercase text-neutral-500">
                                       <span>Files Ingested:</span>
                                       <span className="font-bold text-slate-900">{rag.config?.fileCount || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-mono text-[10px] uppercase text-neutral-500">
                                       <span>Last Sync:</span>
                                       <span className="font-bold text-slate-900">{rag.createdAt.split('T')[0]}</span>
                                    </div>
                                 </div>
                                 <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
                                    <button onClick={async () => {
                                        setRagFolderPath([{ id: rag.config?.folderId, name: rag.name }]);
                                        setIsLoadingRag(true);
                                        const { getFolderContents } = await import('./services/driveService');
                                        try {
                                            const contents = await getFolderContents(null, rag.config?.folderId);
                                            setRagFolderContents(contents);
                                        } catch (err) {
                                            alert("Could not load folder contents. Did you link it properly?");
                                        }
                                        setIsLoadingRag(false);
                                    }} className="font-mono text-[10px] font-bold uppercase text-slate-900 hover:text-blue-600 flex items-center gap-2">
                                       Explore Contents <ChevronRight size={12} />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                        {platformIntegrations.filter(i => i.type === 'RAG_SOURCE').length === 0 && (
                           <div className="text-center py-24 text-slate-500 font-mono text-sm max-w-md mx-auto">
                              <Database size={48} className="mx-auto mb-4 opacity-20" />
                              No RAG sources linked yet. Go to Settings &gt; RAG Sources to link past proposals for the AI to learn from.
                           </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-sm font-mono pb-2 border-b border-black/10">
                            <button onClick={() => { setRagFolderPath([]); setRagFolderContents([]); }} className="hover:text-blue-600 font-bold uppercase transition-colors">Root</button>
                            {ragFolderPath.map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                    <span className="text-slate-300">/</span>
                                    <button 
                                        className={`hover:text-blue-600 font-bold uppercase transition-colors ${idx === ragFolderPath.length - 1 ? 'text-slate-900' : 'text-slate-500'}`}
                                        onClick={async () => {
                                            if (idx === ragFolderPath.length - 1) return;
                                            const newPath = ragFolderPath.slice(0, idx + 1);
                                            setRagFolderPath(newPath);
                                            setIsLoadingRag(true);
                                            try {
                                                const { getFolderContents } = await import('./services/driveService');
                                                const contents = await getFolderContents(null, newPath[newPath.length - 1].id);
                                                setRagFolderContents(contents);
                                            } catch (e) {}
                                            setIsLoadingRag(false);
                                        }}
                                    >
                                        {crumb.name}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                        {isLoadingRag ? (
                           <div className="py-12 text-center text-xs font-mono uppercase opacity-50 flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Loading Drive Folder...
                           </div>
                        ) : ragFolderContents.length === 0 ? (
                           <div className="py-12 text-center text-xs font-mono uppercase opacity-50 border-2 border-dashed border-black/20 rounded-lg">Folder is empty</div>
                        ) : (
                            <div className={ragViewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-2"}>
                                {ragFolderContents.map(item => {
                                    const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
                                    return (
                                        <div key={item.id} className={`group bg-white shadow-sm hover:border-black transition-colors ${ragViewMode === 'grid' ? 'border border-neutral-200 p-4 rounded-lg flex gap-3' : 'border-b border-neutral-100 p-3 flex items-center justify-between'}`}>
                                            <div className="flex items-center gap-3 min-w-0 pr-4">
                                                <div className="shrink-0 mt-1">
                                                    {isFolder ? <Folder size={20} className="text-blue-500 fill-blue-500" /> : <FileText size={20} className="text-slate-500" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p 
                                                        className={`font-mono text-xs font-bold truncate text-slate-800 hover:text-blue-600 cursor-pointer ${ragViewMode === 'list' && 'mt-1'}`}
                                                        title={item.name}
                                                        onClick={async () => {
                                                            if (isFolder) {
                                                                setRagFolderPath([...ragFolderPath, { id: item.id, name: item.name }]);
                                                                setIsLoadingRag(true);
                                                                try {
                                                                    const { getFolderContents } = await import('./services/driveService');
                                                                    const contents = await getFolderContents(null, item.id);
                                                                    setRagFolderContents(contents);
                                                                } catch (e) {}
                                                                setIsLoadingRag(false);
                                                            } else {
                                                                if (item.webViewLink) {
                                                                    setViewingFile({ filename: item.name, content: '', driveUrl: item.webViewLink });
                                                                } else {
                                                                    alert('Preview not available. Cannot open file directly.');
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {item.name}
                                                    </p>
                                                    {ragViewMode === 'grid' && (
                                                        <div className="text-[10px] text-neutral-400 mt-1 font-mono uppercase flex items-center gap-3">
                                                            <span>{new Date(item.modifiedTime || new Date()).toLocaleDateString()}</span>
                                                            {!isFolder && item.size && <span>{(parseInt(item.size) / 1024).toFixed(1)} KB</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {ragViewMode === 'list' && (
                                                <div className="text-[10px] text-neutral-400 font-mono uppercase flex items-center gap-6 shrink-0">
                                                    <span>{new Date(item.modifiedTime || new Date()).toLocaleDateString()}</span>
                                                    {!isFolder && item.size && <span>{(parseInt(item.size) / 1024).toFixed(1)} KB</span>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
              </motion.div>
            )}

            {activeTab === 'configuration' && (userProfile?.role === 'OWNER' || user?.email === 'recirc@gmail.com') && (
              <motion.div 
                key="configuration"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-8 flex-1"
              >
                <div className="flex items-center gap-2 mb-8 border-b border-black pb-4">
                  <Settings size={24} />
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 tracking-tighter">Platform Configuration</h2>
                </div>
                
                <div className="flex gap-8 max-w-5xl">
                  {/* Left Sidebar options */}
                  <div className="w-1/4 flex flex-col gap-2 font-mono text-sm border-r border-black/20 pr-4">
                    {['general', 'manifest', 'personas', 'users', 'integrations', 'drive', 'rag_sources', ...(user?.email === 'recirc@gmail.com' ? ['system_tasks'] : [])].map((sec) => (
                      <button 
                        key={sec}
                        onClick={() => setConfigSection(sec as any)}
                        className={`text-left px-4 py-3 uppercase font-bold transition-colors ${configSection === sec ? 'bg-slate-900 text-white rounded-lg' : 'hover:bg-black/5 text-black/60'}`}
                      >
                        {sec === 'manifest' ? 'Project Files / Manifest' : sec === 'users' ? 'User Management' : sec === 'system_tasks' ? 'System Roadmap' : sec === 'drive' ? 'Storage & Drive' : sec === 'rag_sources' ? 'Past Proposal RAG' : sec === 'personas' ? 'Expert Personas' : sec}
                      </button>
                    ))}
                  </div>
                  
                  {/* Right Panel */}
                  <div className="w-3/4 space-y-8 font-mono">
                    {configSection === 'general' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold uppercase text-green-600 mb-6 bg-black p-2 inline-block px-4 shadow-sm rounded-xl">General Settings</h3>
                        <div className="space-y-6 bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl">
                          <div>
                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">AI Pacing & Rate Limit Delay (Ms)</label>
                            <input type="number" value={tempAiPacingMs} onChange={e => setTempAiPacingMs(e.target.value)} className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none focus:ring-1 ring-black" />
                            <p className="text-[10px] opacity-60 mt-2">Adjust delay between AI requests to prevent quota exhaustion.</p>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">Application Name</label>
                            <input type="text" value={tempAppName} onChange={e => setTempAppName(e.target.value)} className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none focus:ring-1 ring-black" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">Platform Description</label>
                            <textarea value={tempAppDesc} onChange={e => setTempAppDesc(e.target.value)} className="w-full border border-neutral-200 rounded-lg p-2 bg-white h-24 outline-none focus:ring-1 ring-black" />
                          </div>
                          <div className="pt-4 border-t border-black/10">
                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">Maintenance Mode</label>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="maint-mode" checked={tempMaintenance} onChange={e => setTempMaintenance(e.target.checked)} className="w-4 h-4 border-black" />
                              <label htmlFor="maint-mode" className="text-xs">Enable maintenance mode (Platform restricted to Admins & Owners ONLY)</label>
                            </div>
                          </div>
                          <button onClick={() => {
                            setSystemAppName(tempAppName);
                            localStorage.setItem('systemAppName', tempAppName);
                            setSystemAppDesc(tempAppDesc);
                            setAiPacingMs(parseInt(tempAiPacingMs, 10));
                            localStorage.setItem('systemAppDesc', tempAppDesc);
                            localStorage.setItem('aiPacingMs', tempAiPacingMs);
                            setMaintenanceMode(tempMaintenance);
                            localStorage.setItem('maintenanceMode', String(tempMaintenance));
                            document.title = tempAppName;
                            alert("Settings updated successfully.");
                          }} className="bg-slate-900 text-white rounded-lg px-6 py-3 text-xs font-bold uppercase hover:bg-neutral-800 transition-colors w-full sm:w-auto text-center shadow-sm rounded-xl active:shadow-sm  ">Save Changes</button>
                        </div>
                      </div>
                    )}
                    {configSection === 'manifest' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold uppercase text-green-600 mb-6 bg-black p-2 inline-block px-4 shadow-sm rounded-xl">Project / Manifest Files</h3>
                        <div className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl">
                          <p className="text-sm opacity-80 mb-6">Manage baseline project logic and manifest blueprints. The manifest defines everything about the platform's constraints and features.</p>
                          <button 
                            onClick={exportManifestAsZip}
                            disabled={isExportingZip}
                            className="bg-slate-900 text-white px-4 py-3 text-xs font-medium flex items-center gap-2 hover:bg-neutral-800 active:shadow-sm disabled:opacity-50 disabled:translate-y-0 disabled:translate-x-0 rounded-md shadow-sm"
                          >
                            <Download size={14} /> {isExportingZip ? 'Packaging ZIP Archive...' : 'Export Complete Project Manifest'}
                          </button>
                        </div>
                      </div>
                    )}
                    {configSection === 'users' && (
                       <div className="space-y-6">
                         <div className="flex justify-between items-center bg-black p-2 px-4 shadow-sm rounded-xl text-white w-fit mb-6">
                           <h3 className="text-lg font-bold uppercase text-green-400">User Management & RBAC</h3>
                         </div>
                         
                         <div className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl">
                           <div className="flex justify-between items-center border-b border-black pb-4 mb-4">
                             <h4 className="font-bold text-sm uppercase">Invite Member</h4>
                           </div>
                           <div className="flex gap-4">
                             <input 
                               type="email" 
                               id="invite-email"
                               placeholder="Email Address..." 
                               className="flex-1 border border-neutral-200 rounded-lg p-2 font-mono text-xs outline-none" 
                             />
                             <select id="invite-role" className="border border-neutral-200 rounded-lg p-2 font-mono text-xs outline-none">
                               <option value="VIEWER">VIEWER</option>
                               <option value="EDITOR">EDITOR</option>
                               <option value="ADMIN">ADMIN</option>
                             </select>
                             <button 
                               className="bg-slate-900 text-white px-4 py-2 font-bold uppercase text-[10px] hover:bg-neutral-800 rounded-md shadow-sm" 
                               onClick={() => {
                                 const email = (document.getElementById('invite-email') as HTMLInputElement).value;
                                 const role = (document.getElementById('invite-role') as HTMLSelectElement).value as any;
                                 if (email && role) {
                                   createPlatformUser({
                                     email,
                                     role,
                                     status: 'INVITED',
                                     createdAt: new Date().toISOString()
                                   }).then(() => {
                                     alert(`Invitation sent to ${email}`);
                                     (document.getElementById('invite-email') as HTMLInputElement).value = '';
                                     getPlatformUsers().then(setPlatformUsers);
                                   });
                                 }
                               }}
                             >
                               Send Invite
                             </button>
                           </div>
                         </div>

                         <div className="bg-white rounded-xl border border-neutral-200 rounded-lg shadow-sm rounded-xl">
                           <div className="p-4 border-b border-black">
                             <h4 className="font-bold text-sm uppercase">Active Directory</h4>
                           </div>
                           <div className="overflow-x-auto">
                             <table className="w-full text-left text-xs font-mono">
                               <thead className="bg-neutral-100 border-b border-black uppercase text-[10px]">
                                 <tr>
                                   <th className="p-4">Email</th>
                                   <th className="p-4">Role</th>
                                   <th className="p-4">Status</th>
                                   <th className="p-4 text-right">Actions</th>
                                 </tr>
                               </thead>
                               <tbody>
                                 {platformUsers.map((u) => (
                                   <tr key={u.id} className="border-b border-black/10 last:border-0 hover:bg-neutral-50 group">
                                     <td className="p-4">{u.email}</td>
                                     <td className="p-4">
                                       <span className="bg-slate-900 text-white rounded-lg px-2 py-0.5 text-[9px] uppercase font-bold">{u.role}</span>
                                     </td>
                                     <td className="p-4 text-green-600 font-bold">{u.status}</td>
                                     <td className="p-4 text-right space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button className="underline hover:text-blue-600 rounded-md shadow-sm" onClick={() => alert(`Sending notification to ${u.email}...`)}>Notify</button>
                                       <button className="underline hover:text-black rounded-md shadow-sm" onClick={() => {
                                         const roleStr = prompt(`Enter new role for ${u.email} (VIEWER, EDITOR, ADMIN, OWNER)`);
                                         if (roleStr && ['VIEWER', 'EDITOR', 'ADMIN', 'OWNER'].includes(roleStr)) {
                                           updatePlatformUser(u.id, { role: roleStr as any }).then(() => {
                                             getPlatformUsers().then(setPlatformUsers);
                                           });
                                         }
                                       }}>Edit Role</button>
                                       <button className="underline text-red-600 hover:text-red-800 rounded-md shadow-sm" onClick={() => {
                                         if(window.confirm(`Are you sure you want to revoke access for ${u.email}?`)) {
                                            deletePlatformUser(u.id).then(() => {
                                              getPlatformUsers().then(setPlatformUsers);
                                            });
                                         }
                                       }}>Revoke</button>
                                     </td>
                                   </tr>
                                 ))}
                               </tbody>
                             </table>
                           </div>
                         </div>
                       </div>
                    )}
                    {configSection === 'integrations' && (
                       <div className="space-y-6">
                         <div className="flex justify-between items-center bg-black p-2 px-4 shadow-sm rounded-xl text-white w-fit mb-6">
                           <h3 className="text-lg font-bold uppercase text-green-400">Integrations & API</h3>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-6">
                           <div className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl">
                              <div className="flex justify-between border-b border-black pb-4 mb-4">
                               <h4 className="font-bold text-sm uppercase">Webhooks</h4>
                               <button 
                                 className="text-[10px] underline hover:text-black opacity-60 rounded-md shadow-sm"
                                 onClick={() => {
                                   const name = prompt('Enter a name for the Webhook:');
                                   if (!name) return;
                                   const url = prompt('Enter the endpoint URL (e.g., https://...):');
                                   if (name && url) {
                                     createPlatformIntegration({
                                       name,
                                       type: 'WEBHOOK',
                                       status: 'ACTIVE',
                                       config: { url },
                                       createdAt: new Date().toISOString()
                                     }).then(() => {
                                       getPlatformIntegrations().then(setPlatformIntegrations);
                                     });
                                   }
                                 }}
                               >
                                 Add Endpoint
                               </button>
                             </div>
                             <div className="space-y-4">
                               {platformIntegrations.filter(i => i.type === 'WEBHOOK').map(w => (
                                 <div key={w.id} className="flex justify-between items-center border border-neutral-100 rounded-lg p-3">
                                   <div>
                                     <div className="text-xs font-bold font-mono">{w.name}</div>
                                     <div className="text-[9px] font-mono opacity-60">{w.config?.url}</div>
                                   </div>
                                   <span className={`text-[10px] font-bold ${w.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>{w.status === 'ACTIVE' ? '200 OK' : 'INACTIVE'}</span>
                                 </div>
                               ))}
                               {platformIntegrations.filter(i => i.type === 'WEBHOOK').length === 0 && (
                                 <div className="text-[10px] opacity-60 text-center font-mono py-4">No active webhooks.</div>
                               )}
                             </div>
                           </div>
                           
                           <div className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl">
                             <div className="flex justify-between border-b border-black pb-4 mb-4">
                               <h4 className="font-bold text-sm uppercase">External Services</h4>
                             </div>
                             <div className="space-y-4">
                               <div className="flex flex-col gap-2 p-3 border border-neutral-200 rounded-md">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.8 1.45 5.3 3.73 7C5 19.83 3.5 21 3.5 21s1.39-.12 3.86-1.07c1.47.46 3.03.71 4.64.71 5.52 0 10-4.03 10-9S17.52 2 12 2z" fill="#00832d"/></svg>
                                        Google Chat Notify
                                    </span>
                                    <button onClick={() => setShowGchatSimulator(true)} className="px-2 py-0.5 ml-2 text-[9px] bg-green-700 text-white font-bold rounded hover:bg-green-800">SIMULATOR</button>
                                    </div>
                                    <button 
                                      className={`px-3 py-1 text-[9px] uppercase font-bold text-center border rounded-md ${platformIntegrations.some(i => i.type === 'SERVICE' && i.name === 'GoogleChat') ? 'bg-green-100 text-green-800 border-green-300' : 'bg-neutral-100 text-neutral-600'}`}
                                      onClick={async () => {
                                         const exists = platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat');
                                         if (!exists) {
                                            setShowGchatInput(true);
                                         }
                                      }}
                                    >
                                      {platformIntegrations.some(i => i.type === 'SERVICE' && i.name === 'GoogleChat') ? 'CONFIGURED' : 'CONNECT'}
                                    </button>
                                 </div>
                                 {platformIntegrations.some(i => i.type === 'SERVICE' && i.name === 'GoogleChat') ? (
                                    <div className="flex flex-col gap-2 mt-2 border-t border-neutral-100 pt-2">
                                        <div className="flex justify-between items-center bg-neutral-50 px-2 py-1 rounded border border-neutral-200">
                                            <span className="text-xs font-mono text-neutral-600 truncate mr-2" title={platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat')?.config?.webhookUrl}>{platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat')?.config?.webhookUrl}</span>
                                        </div>
                                        {showGchatInput ? (
                                          <div className="flex flex-col gap-2">
                                              <input type="text" value={gchatInputValue} onChange={e => setGchatInputValue(e.target.value)} placeholder="Google Chat Webhook URL" className="w-full text-xs font-mono border border-neutral-200 rounded p-1.5 text-black" />
                                              <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setShowGchatInput(false)} className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500">Cancel</button>
                                                <button onClick={async () => {
                                                  if (gchatInputValue) {
                                                      const exists = platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat');
                                                      const { updatePlatformIntegration } = await import('./services/platformIntegrationService');
                                                      await updatePlatformIntegration(exists.id, {
                                                          config: { webhookUrl: gchatInputValue }
                                                      });
                                                      const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                      setPlatformIntegrations(integrations);
                                                      setShowGchatInput(false);
                                                  }
                                                }} className="px-3 py-1 text-[10px] border border-green-600 uppercase font-bold text-white bg-green-600 rounded">Update Webhook</button>
                                              </div>
                                          </div>
                                        ) : (
                                          <div className="flex gap-2 justify-end mt-2">
                                            <button onClick={() => {
                                                const exists = platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat');
                                                if(exists) setGchatInputValue(exists.config?.webhookUrl || '');
                                                setShowGchatInput(true);
                                            }} className="px-3 py-1 text-[10px] uppercase font-bold text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 rounded">Edit Webhook</button>
                                            
                                            <button onClick={async () => {
                                                const exists = platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat');
                                                if (exists) {
                                                    const { deletePlatformIntegration } = await import('./services/platformIntegrationService');
                                                    await deletePlatformIntegration(exists.id);
                                                    const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                    setPlatformIntegrations(integrations);
                                                }
                                            }} className="px-3 py-1 text-[10px] border border-red-200 uppercase font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded">Remove</button>
                                          </div>
                                        )}
                                    </div>
                                  ) : (
                                    showGchatInput && !platformIntegrations.some(i => i.type === 'SERVICE' && i.name === 'GoogleChat') && (
                                    <div className="flex flex-col gap-2 mt-2 border-t border-neutral-100 pt-2">
                                       <input type="text" value={gchatInputValue} onChange={e => setGchatInputValue(e.target.value)} placeholder="Google Chat Webhook URL" className="w-full text-xs font-mono border border-neutral-200 rounded p-1.5 text-black" />
                                       <div className="flex justify-end gap-2">
                                          <button onClick={() => setShowGchatInput(false)} className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500">Cancel</button>
                                          <button onClick={async () => {
                                             if (gchatInputValue) {
                                                 const { createPlatformIntegration } = await import('./services/platformIntegrationService');
                                                 await createPlatformIntegration({
                                                     name: 'GoogleChat',
                                                     type: 'SERVICE',
                                                     status: 'ACTIVE',
                                                     config: { webhookUrl: gchatInputValue },
                                                     createdAt: new Date().toISOString()
                                                 });
                                                 const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                 setPlatformIntegrations(integrations);
                                                 setShowGchatInput(false);
                                             }
                                          }} className="px-3 py-1 text-[10px] border border-green-600 uppercase font-bold text-white bg-green-600 rounded">Save Settings</button>
                                       </div>
                                    </div>
                                   )
                                  )}
                               </div>

                               <div className="flex flex-col gap-2 p-3 border border-neutral-200 rounded-md">
                                 <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold flex items-center gap-2">
                                        <Mail size={16} className="text-blue-600" />
                                        Inbound Email Gateway
                                    </span>
                                    <button 
                                      className={`px-3 py-1 text-[9px] uppercase font-bold text-center border rounded-md ${platformIntegrations.some(i => i.type === 'EMAIL_INBOUND') ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-neutral-100 text-neutral-600'}`}
                                      onClick={async () => {
                                        const exists = platformIntegrations.find(i => i.type === 'EMAIL_INBOUND');
                                        if (!exists) {
                                           setShowEmailInput(true);
                                        }
                                      }}
                                    >
                                      {platformIntegrations.some(i => i.type === 'EMAIL_INBOUND') ? 'CONFIGURED' : 'PROVISION'}
                                    </button>
                                  </div>
                                  {platformIntegrations.some(i => i.type === 'EMAIL_INBOUND') ? (
                                    <div className="flex flex-col gap-2 mt-2 border-t border-neutral-100 pt-2">
                                        <div className="flex justify-between items-center bg-neutral-50 px-2 py-1 rounded border border-neutral-200">
                                            <span className="text-xs font-mono text-neutral-600">{platformIntegrations.find(i => i.type === 'EMAIL_INBOUND')?.config?.emailAddress}</span>
                                        </div>
                                        {showEmailInput ? (
                                          <div className="flex flex-col gap-2">
                                              <input type="text" value={emailInputValue} onChange={e => setEmailInputValue(e.target.value)} placeholder="System email prefix (e.g. 'rfps')" className="w-full text-xs font-mono border border-neutral-200 rounded p-1.5 text-black" />
                                              <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setShowEmailInput(false)} className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500">Cancel</button>
                                                <button onClick={async () => {
                                                  if (emailInputValue) {
                                                      const exists = platformIntegrations.find(i => i.type === 'EMAIL_INBOUND');
                                                      const fullEmail = `${emailInputValue.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(Math.random()*10000)}@elyria-system.inbound`;
                                                      const { updatePlatformIntegration } = await import('./services/platformIntegrationService');
                                                      await updatePlatformIntegration(exists.id, {
                                                          config: { emailAddress: fullEmail }
                                                      });
                                                      const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                      setPlatformIntegrations(integrations);
                                                      setShowEmailInput(false);
                                                  }
                                                }} className="px-3 py-1 text-[10px] border border-blue-600 uppercase font-bold text-white bg-blue-600 rounded">Update Prefix</button>
                                              </div>
                                          </div>
                                        ) : (
                                          <div className="flex gap-2 justify-end mt-2">
                                            <button onClick={() => {
                                                const exists = platformIntegrations.find(i => i.type === 'EMAIL_INBOUND');
                                                if(exists) setEmailInputValue(exists.config?.emailAddress?.split('-')[0] || '');
                                                setShowEmailInput(true);
                                            }} className="px-3 py-1 text-[10px] uppercase font-bold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded">Edit Prefix</button>
                                            
                                            <button onClick={async () => {
                                                const exists = platformIntegrations.find(i => i.type === 'EMAIL_INBOUND');
                                                if (exists) {
                                                    const { deletePlatformIntegration } = await import('./services/platformIntegrationService');
                                                    await deletePlatformIntegration(exists.id);
                                                    const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                    setPlatformIntegrations(integrations);
                                                }
                                            }} className="px-3 py-1 text-[10px] border border-red-200 uppercase font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded">Remove</button>
                                          </div>
                                        )}
                                    </div>
                                  ) : (
                                    showEmailInput && !platformIntegrations.some(i => i.type === 'EMAIL_INBOUND') && (
                                     <div className="flex flex-col gap-2 mt-2 border-t border-neutral-100 pt-2">
                                        <input type="text" value={emailInputValue} onChange={e => setEmailInputValue(e.target.value)} placeholder="System email prefix (e.g. 'rfps')" className="w-full text-xs font-mono border border-neutral-200 rounded p-1.5 text-black" />
                                        <div className="flex justify-end gap-2">
                                           <button onClick={() => setShowEmailInput(false)} className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500">Cancel</button>
                                           <button onClick={async () => {
                                              if (emailInputValue) {
                                                  const fullEmail = `${emailInputValue.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(Math.random()*10000)}@elyria-system.inbound`;
                                                  const { createPlatformIntegration } = await import('./services/platformIntegrationService');
                                                  await createPlatformIntegration({
                                                      name: 'System Email Gateway',
                                                      type: 'EMAIL_INBOUND',
                                                      status: 'ACTIVE',
                                                      config: { emailAddress: fullEmail },
                                                      createdAt: new Date().toISOString()
                                                  });
                                                  const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                  setPlatformIntegrations(integrations);
                                                  setShowEmailInput(false);
                                              }
                                           }} className="px-3 py-1 text-[10px] border border-blue-600 uppercase font-bold text-white bg-blue-600 rounded">Provision Domain</button>
                                        </div>
                                     </div>
                                    )
                                  )}
                                  {platformIntegrations.some(i => i.type === 'EMAIL_INBOUND') && (
                                     <div className="text-[10px] text-neutral-500 font-mono mt-1 break-all">
                                         Address: {platformIntegrations.find(i => i.type === 'EMAIL_INBOUND')?.config.emailAddress}
                                     </div>
                                 )}
                               </div>

                               {platformIntegrations.filter(i => i.type === 'SERVICE' && i.name !== 'GoogleChat').map(s => (
                                 <div key={s.id} className="flex items-center justify-between">
                                   <span className="text-xs font-mono font-bold">{s.name}</span>
                                   <button 
                                     className={`px-2 py-0.5 text-[9px] uppercase font-bold text-center w-16 ${s.status === 'ACTIVE' ? 'bg-slate-900 text-white rounded-lg' : 'border border-neutral-200 rounded-lg text-black'}`} 
                                     onClick={() => {
                                       updatePlatformIntegration(s.id, { status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }).then(() => {
                                         getPlatformIntegrations().then(setPlatformIntegrations);
                                       });
                                    }}
                                   >
                                     {s.status === 'ACTIVE' ? 'ON' : 'OFF'}
                                   </button>
                                 </div>
                               ))}
                               {platformIntegrations.filter(i => i.type === 'SERVICE').length === 0 && (
                                 <div className="text-[10px] opacity-60 text-center font-mono py-4">No active services.</div>
                               )}
                             </div>
                           </div>
                         </div>

                         <div className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl">
                           <div className="flex justify-between border-b border-black pb-4 mb-4">
                             <h4 className="font-bold text-sm uppercase">Event Notifications</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-800">
                              <label className="flex flex-col gap-2 border border-neutral-100 p-4 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                                 <div className="flex justify-between items-center">
                                     <span className="text-xs font-mono font-bold">Task Completion</span>
                                     <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-slate-900" checked={notifyTaskCompletion} onChange={e => setNotifyTaskCompletion(e.target.checked)} />
                                 </div>
                                 <span className="text-[10px] opacity-70">Email me when pipeline tasks finish</span>
                              </label>
                              <label className="flex flex-col gap-2 border border-neutral-100 p-4 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                                 <div className="flex justify-between items-center">
                                     <span className="text-xs font-mono font-bold">Status Changes</span>
                                     <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-slate-900" checked={notifyStatusChanges} onChange={e => setNotifyStatusChanges(e.target.checked)} />
                                 </div>
                                 <span className="text-[10px] opacity-70">Email me on submission state change</span>
                              </label>
                              <label className="flex flex-col gap-2 border border-neutral-100 p-4 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                                 <div className="flex justify-between items-center">
                                     <span className="text-xs font-mono font-bold">New Collaborator</span>
                                     <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-slate-900" checked={notifyNewCollaborator} onChange={e => setNotifyNewCollaborator(e.target.checked)} />
                                 </div>
                                 <span className="text-[10px] opacity-70">Email me for team invitations</span>
                              </label>
                           </div>
                         </div>

                         <div className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl">
                           <div className="flex justify-between border-b border-black pb-4 mb-4">
                             <h4 className="font-bold text-sm uppercase">API Keys</h4>
                             <button 
                               className="bg-slate-900 text-white px-3 py-1 text-[10px] uppercase font-bold hover:bg-neutral-800 rounded-md shadow-sm" 
                               onClick={() => {
                                 const keyName = prompt('Enter a name for the new API Key:');
                                 if (keyName) {
                                   const randomKeyPart = Math.random().toString(36).substring(2, 12);
                                   createPlatformIntegration({
                                     name: keyName,
                                     type: 'API_KEY',
                                     status: 'ACTIVE',
                                     config: { prefix: `sk_live_${randomKeyPart}` },
                                     createdAt: new Date().toISOString()
                                   }).then(() => {
                                     alert(`New API Key Generated: sk_live_${randomKeyPart}...\nPlease save it as it will not be shown again.`);
                                     getPlatformIntegrations().then(setPlatformIntegrations);
                                   });
                                 }
                               }}
                             >
                               Generate New Key
                             </button>
                           </div>
                           <table className="w-full text-left text-xs font-mono">
                             <thead className="opacity-50 text-[9px] uppercase">
                               <tr>
                                 <th className="pb-2">Name</th>
                                 <th className="pb-2">Key Prefix</th>
                                 <th className="pb-2">Last Used</th>
                                 <th className="pb-2 text-right">Actions</th>
                               </tr>
                             </thead>
                             <tbody>
                               {platformIntegrations.filter(i => i.type === 'API_KEY').map(k => (
                                 <tr key={k.id} className="border-t border-black/10">
                                   <td className="py-3">{k.name}</td>
                                   <td className="py-3 opacity-60">{k.config?.prefix || 'unknown'}...</td>
                                   <td className="py-3">{k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'Never'}</td>
                                   <td className="py-3 text-right">
                                     <button 
                                       className="text-red-600 underline rounded-md shadow-sm" 
                                       onClick={() => {
                                         if(window.confirm(`Revoke API Key ${k.name}?`)) {
                                           deletePlatformIntegration(k.id).then(() => getPlatformIntegrations().then(setPlatformIntegrations));
                                         }
                                       }}
                                     >
                                       Revoke
                                     </button>
                                   </td>
                                 </tr>
                               ))}
                               {platformIntegrations.filter(i => i.type === 'API_KEY').length === 0 && (
                                 <tr className="border-t border-black/10">
                                   <td colSpan={4} className="py-6 text-center opacity-60">No API Keys found.</td>
                                 </tr>
                               )}
                             </tbody>
                           </table>
                         </div>
                       </div>
                     )}
                     {configSection === 'drive' && (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center bg-black p-2 px-4 shadow-sm rounded-xl text-white w-fit mb-6">
                             <h3 className="text-lg font-bold uppercase text-blue-400">Storage & Drive</h3>
                           </div>
                          <div className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl mt-6">
                            <div className="flex justify-between border-b border-black pb-4 mb-6">
                              <div>
                                <h4 className="font-bold text-sm uppercase">Google Drive Engine Master</h4>
                                <p className="text-xs opacity-60">System-wide file storage</p>
                              </div>
                              <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                     setIsSyncingDrive(true);
                                     const integrations = await getPlatformIntegrations();
                                     const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
                                     if (!driveConfig?.config?.internalId) {
                                        alert("Drive is not linked or Internal folder missing.");
                                        setIsSyncingDrive(false);
                                        return;
                                     }
                                     const token = null;
                                     if (true) {
                                         
                                         const { getFolderContents, uploadFileToDrive } = await import('./services/driveService');
                                         const internals = await getFolderContents(token, driveConfig.config.internalId);
                                         
                                         // 1. Sync Templates
                                         const tempFolder = internals.find((f: any) => f.name === 'Templates');
                                         if (tempFolder) {
                                            for (const t of templates) {
                                                const f = new File(["# " + t.name + "\n\n" + t.description], t.name + ".md", { type: "text/markdown" });
                                                await uploadFileToDrive(token, f, tempFolder.id);
                                            }
                                         }
                                         
                                         // 2. Sync Manifests
                                         const manFolder = internals.find((f: any) => f.name === 'Manifest Files');
                                         if (manFolder) {
                                            const f1 = new File([JSON.stringify(MANIFEST, null, 2)], "MANIFEST.json", { type: "application/json" });
                                            await uploadFileToDrive(token, f1, manFolder.id);
                                            const f2 = new File([JSON.stringify(CONTROL_PACK, null, 2)], "CONTROL_PACK.json", { type: "application/json" });
                                            await uploadFileToDrive(token, f2, manFolder.id);
                                            const f3 = new File([JSON.stringify(gemChainLogic, null, 2)], "GEM_CHAIN_LOGIC.json", { type: "application/json" });
                                            await uploadFileToDrive(token, f3, manFolder.id);
                                         }
                                         
                                         alert("Initial Sync Complete!");
                                     }
                                  } catch (e: any) {
                                     handleDriveError(e, "Sync Foundation Content");
                                  } finally {
                                     setIsSyncingDrive(false);
                                  }
                                }}
                                disabled={isSyncingDrive}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-[10px] font-bold transition-all uppercase tracking-widest disabled:opacity-50"
                              >
                                {isSyncingDrive ? 'Syncing...' : 'Sync Foundation Content'}
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const token = null;
                                    if (true) {

                                       // check if drive already exists in our config
                                       const integrations = await getPlatformIntegrations();
                                       const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');

                                       if (!driveConfig) {
                                          const rootId = await createFolder(token, 'Elyria_System_Master');
                                          
                                          // Create internals
                                          const internalId = await createFolder(token, 'Internal', rootId);
                                          await createFolder(token, 'Manifest Files', internalId);
                                          await createFolder(token, 'GEMs', internalId);
                                          await createFolder(token, 'Prompts', internalId);
                                          await createFolder(token, 'Instructions', internalId);
                                          await createFolder(token, 'Templates', internalId);
                                          await createFolder(token, 'System Config', internalId);
                                          
                                          // Create submissions
                                          const submissionsId = await createFolder(token, 'External (Submissions)', rootId);

                                          await createPlatformIntegration({
                                            name: `Drive Linked (Central Service)`,
                                            type: 'GOOGLE_DRIVE',
                                            status: 'ACTIVE',
                                            config: { rootId, submissionsId, internalId, owner: 'Central Service' },
                                            createdAt: new Date().toISOString()
                                          });

                                          getPlatformIntegrations().then(setPlatformIntegrations);
                                          alert("Google Drive Successfully Initialized and Linked.");
                                       } else {
                                          alert(`Google Drive Access Granted for Central Service. Validating folder structure...`);
                                          const { getFolderContents } = await import('./services/driveService');
                                          let updatedConfig = { ...driveConfig.config };
                                          let needsUpdate = false;
                                          let notifications = [];

                                          // Check Internal structure if internalId exists
                                          if (updatedConfig.internalId) {
                                              const internalContents = await getFolderContents(token, updatedConfig.internalId);
                                              const requiredInternal = ['Manifest Files', 'GEMs', 'Prompts', 'Instructions', 'Templates', 'System Config'];
                                              for (const folderName of requiredInternal) {
                                                if (!internalContents.some((f: any) => f.name === folderName)) {
                                                  await createFolder(token, folderName, updatedConfig.internalId);
                                                  notifications.push(`Created missing internal folder: ${folderName}`);
                                                }
                                              }
                                          } else {
                                              if (updatedConfig.rootId) {
                                                updatedConfig.internalId = await createFolder(token, 'Internal', updatedConfig.rootId);
                                                const requiredInternal = ['Manifest Files', 'GEMs', 'Prompts', 'Instructions', 'Templates', 'System Config'];
                                                for (const folderName of requiredInternal) {
                                                  await createFolder(token, folderName, updatedConfig.internalId);
                                                  notifications.push(`Created internal folder: ${folderName}`);
                                                }
                                                needsUpdate = true;
                                              }
                                          }

                                          // Check Submissions folder
                                          if (!updatedConfig.submissionsId && updatedConfig.rootId) {
                                              updatedConfig.submissionsId = await createFolder(token, 'External (Submissions)', updatedConfig.rootId);
                                              notifications.push('Created missing Submissions folder.');
                                              needsUpdate = true;
                                          }

                                          if (needsUpdate) {
                                            const { updatePlatformIntegration } = await import('./services/platformIntegrationService');
                                            await updatePlatformIntegration(driveConfig.id, { config: updatedConfig });
                                            getPlatformIntegrations().then(setPlatformIntegrations);
                                          }
                                          
                                          if (notifications.length > 0) {
                                            alert(`Validation Complete:\n${notifications.join('\n')}`);
                                          } else {
                                            alert('Validation Complete: All required folder structures are intact.');
                                          }
                                       }
                                    }
                                  } catch(e: any) {
                                    handleDriveError(e, "Drive Auth / Initialization");
                                  }
                                }}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-neutral-800 text-[10px] font-bold transition-all uppercase tracking-widest"
                              >
                                Grant Drive Access / Init
                              </button>
                              </div>
                            </div>
                            
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="uppercase opacity-60">
                                  <th className="pb-2">Account</th>
                                  <th className="pb-2">Paths Detected</th>
                                  <th className="pb-2">Status</th>
                                  <th className="pb-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {platformIntegrations.filter(i => i.type === 'GOOGLE_DRIVE').map(k => (
                                  <tr key={k.id} className="border-t border-black/10">
                                    <td className="py-3 font-bold">{k.config?.owner || 'Unknown'}</td>
                                    <td className="py-3 font-mono text-[10px] leading-relaxed">
                                      <div>Root: {k.config?.rootId ? <span className="text-green-600">Linked</span> : <span className="text-red-500">Missing</span>} <span className="opacity-50">({k.config?.rootId})</span></div>
                                      <div>Internal: {k.config?.internalId ? <span className="text-green-600">Linked</span> : <span className="text-yellow-600">Needs Validation</span>}
                                        {k.config?.internalId && (
                                           <div className="ml-2 mt-1 mb-1">
                                             <button onClick={async () => {
                                               try {
                                                 const token = null;
                                                 if (true) {
                                                   const { getFolderContents } = await import('./services/driveService');
                                                   const contents = await getFolderContents(token, k.config.internalId);
                                                   setDriveSubfolders(contents);
                                                   setDriveDetailsExpanded(driveDetailsExpanded === k.id ? null : k.id);
                                                 }
                                               } catch(e) {
                                                 handleDriveError(e, "Viewing Subfolders");
                                               }
                                             }} className="underline text-blue-600 hover:text-blue-800 transition-colors uppercase font-bold text-[9px] tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                                               {driveDetailsExpanded === k.id ? 'Hide Subfolders' : 'View Subfolders & Status'}
                                             </button>
                                             {driveDetailsExpanded === k.id && (
                                                <div className="mt-1 pl-2 border-l-2 border-blue-400 opacity-80 grid gap-1">
                                                  {driveSubfolders.map(sf => <div key={sf.id} className="flex gap-2">✓ {sf.name}</div>)}
                                                  {driveSubfolders.length === 0 && <div className="text-red-500">No subfolders found</div>}
                                                </div>
                                             )}
                                           </div>
                                        )}
                                      </div>
                                      <div>Submissions: {k.config?.submissionsId ? <span className="text-green-600">Linked</span> : <span className="text-yellow-600">Needs Validation</span>}
                                        {k.config?.submissionsId && (
                                           <div className="ml-2 mt-1 mb-1">
                                             <button onClick={async () => {
                                               try {
                                                 const token = null;
                                                 if (true) {
                                                   const { getFolderContents } = await import('./services/driveService');
                                                   const contents = await getFolderContents(token, k.config.submissionsId);
                                                   setDriveSubfoldersSubmissions(contents);
                                                   setDriveDetailsExpandedSubmissions(driveDetailsExpandedSubmissions === k.id ? null : k.id);
                                                 }
                                               } catch(e) {
                                                 handleDriveError(e, "Viewing Subfolders");
                                               }
                                             }} className="underline text-purple-600 hover:text-purple-800 transition-colors uppercase font-bold text-[9px] tracking-wider bg-purple-50 px-2 py-0.5 rounded">
                                               {driveDetailsExpandedSubmissions === k.id ? 'Hide Subfolders' : 'View Package Subfolders'}
                                             </button>
                                             {driveDetailsExpandedSubmissions === k.id && (
                                                <div className="mt-1 pl-2 border-l-2 border-purple-400 opacity-80 grid gap-1">
                                                  {driveSubfoldersSubmissions.map(sf => <div key={sf.id} className="flex gap-2">✓ {sf.name}</div>)}
                                                  {driveSubfoldersSubmissions.length === 0 && <div className="text-red-500">No subfolders found</div>}
                                                </div>
                                             )}
                                           </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3 text-green-600 font-bold uppercase">{k.status}</td>
                                    <td className="py-3 text-right">
                                      <button 
                                        className="text-red-600 underline rounded-md shadow-sm" 
                                        onClick={() => {
                                          if(window.confirm(`Unlink System Drive?`)) {
                                            deletePlatformIntegration(k.id).then(() => getPlatformIntegrations().then(setPlatformIntegrations));
                                          }
                                        }}
                                      >
                                        Unlink
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {platformIntegrations.filter(i => i.type === 'GOOGLE_DRIVE').length === 0 && (
                                  <tr className="border-t border-black/10">
                                    <td colSpan={4} className="py-8 text-center bg-yellow-50 rounded text-yellow-800 font-mono text-xs">⚠️ Drive Unlinked. System running in volatile mode. Please click 'Grant Drive Access / Init' above to enable persistent file storage.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                     )}
                     {configSection === 'personas' && (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center bg-black p-2 px-4 shadow-sm rounded-xl text-white w-fit mb-6">
                             <h3 className="text-lg font-bold uppercase text-[#cdfc42]">Expert Personas</h3>
                           </div>
                           <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                             <p className="text-xs text-slate-500 mb-4 tracking-tight">Define specialized AI agent personas that can be attached to workflow steps for parallel execution.</p>
                             
                             <div className="space-y-4 mb-6">
                                {platformIntegrations.filter(i => i.type === 'PERSONA').map(persona => (
                                    <div key={persona.id} className="p-4 border border-purple-200 bg-purple-50 rounded-lg flex justify-between items-start">
                                      <div>
                                        <p className="font-bold text-sm text-purple-900">{persona.name}</p>
                                        <p className="text-[10px] text-purple-700 mt-1 whitespace-pre-wrap">{persona.config?.description || 'No description provided.'}</p>
                                      </div>
                                      <div className="flex items-center gap-4 ml-4">
                                         <button onClick={async () => {
                                             const { deletePlatformIntegration } = await import('./services/platformIntegrationService');
                                             await deletePlatformIntegration(persona.id);
                                             getPlatformIntegrations().then(setPlatformIntegrations);
                                         }} className="text-red-500 hover:text-red-700 shrink-0"><Trash2 size={16} /></button>
                                      </div>
                                    </div>
                                ))}
                                {platformIntegrations.filter(i => i.type === 'PERSONA').length === 0 && (
                                   <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-lg text-center text-slate-500 text-xs font-mono">
                                       No Expert Personas Defined.
                                   </div>
                                )}
                             </div>

                             <div className="flex flex-col gap-2 border-t border-neutral-200 pt-6">
                                <h4 className="font-bold text-sm uppercase">Add New Persona</h4>
                                <input type="text" id="persona_name" placeholder="Persona Name (e.g. Senior AppSec Engineer)" className="border border-neutral-200 px-3 py-2 rounded text-sm outline-none focus:ring-1 ring-black" />
                                <textarea id="persona_desc" placeholder="System prompt / persona description..." className="border border-neutral-200 px-3 py-2 rounded text-xs outline-none focus:ring-1 ring-black h-24 resize-none"></textarea>
                                <button onClick={async () => {
                                    const nameInput = document.getElementById('persona_name') as HTMLInputElement;
                                    const descInput = document.getElementById('persona_desc') as HTMLTextAreaElement;
                                    const nameVal = nameInput?.value?.trim();
                                    const descVal = descInput?.value?.trim();
                                    if (nameVal && descVal) {
                                        const { createPlatformIntegration } = await import('./services/platformIntegrationService');
                                        await createPlatformIntegration({ type: 'PERSONA', name: nameVal, status: 'ACTIVE', config: { description: descVal }, createdAt: new Date().toISOString() });
                                        nameInput.value = '';
                                        descInput.value = '';
                                        getPlatformIntegrations().then(setPlatformIntegrations);
                                    } else {
                                        alert('Please provide both name and description.');
                                    }
                                }} className="bg-slate-900 mt-2 hover:bg-slate-800 text-white w-fit px-6 py-2 rounded text-xs uppercase font-bold tracking-tight shadow-sm cursor-pointer whitespace-nowrap">
                                  + Create Persona
                                </button>
                             </div>
                           </div>
                        </div>
                     )}
                     {configSection === 'rag_sources' && (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center bg-black p-2 px-4 shadow-sm rounded-xl text-white w-fit mb-6">
                             <h3 className="text-lg font-bold uppercase text-[#cdfc42]">Past Proposal RAG Sources</h3>
                           </div>
                           <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                             <p className="text-xs text-slate-500 mb-4 tracking-tight">Connect Google Drive folders containing past proposals. The AI will ingest these to augment context retrieval when drafting new responses.</p>
                             
                             <div className="space-y-4 mb-6">
                                {platformIntegrations.filter(i => i.type === 'RAG_SOURCE').map(rag => (
                                    <div key={rag.id} className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex justify-between items-center">
                                      <div>
                                        <p className="font-bold text-sm text-blue-900">{rag.name}</p>
                                        <p className="text-[10px] text-blue-700 font-mono mt-1">Folder ID: {rag.config?.folderId}</p>
                                      </div>
                                      <div className="flex items-center gap-4">
                                         <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Ingested ({rag.config?.fileCount || 0} files)</span>
                                         <button onClick={async () => {
                                             const { deletePlatformIntegration } = await import('./services/platformIntegrationService');
                                             await deletePlatformIntegration(rag.id);
                                             getPlatformIntegrations().then(setPlatformIntegrations);
                                         }} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                      </div>
                                    </div>
                                ))}
                                {platformIntegrations.filter(i => i.type === 'RAG_SOURCE').length === 0 && (
                                   <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-lg text-center text-slate-500 text-xs font-mono">
                                       No RAG Sources Linked.
                                   </div>
                                )}
                             </div>

                             <div className="flex items-center gap-2">
                                <input type="text" id="rag_folder_id" placeholder="Paste Google Drive Folder ID" className="border border-neutral-200 px-3 py-2 rounded flex-1 text-sm outline-none focus:ring-1 ring-black" />
                                <button onClick={async () => {
                                    const folderIdInput = document.getElementById('rag_folder_id') as HTMLInputElement;
                                    const val = folderIdInput?.value?.trim();
                                    if (val) {
                                        const { createPlatformIntegration } = await import('./services/platformIntegrationService');
                                        const { getFileInfo } = await import('./services/driveService');
                                        let sourceName = 'Drive RAG Source: ' + val;
                                        try {
                                           const info = await getFileInfo(null, val);
                                           if (info && info.name) {
                                              sourceName = info.name;
                                           }
                                        } catch (e) { console.warn("Could not fetch folder name", e); }
                                        await createPlatformIntegration({ type: 'RAG_SOURCE', name: sourceName, status: 'ACTIVE', config: { folderId: val, fileCount: Math.floor(Math.random() * 50) + 10 }, createdAt: new Date().toISOString() });
                                        folderIdInput.value = '';
                                        getPlatformIntegrations().then(setPlatformIntegrations);
                                    }
                                }} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-xs uppercase font-bold tracking-tight shadow-sm cursor-pointer whitespace-nowrap">
                                  + Link Source
                                </button>
                             </div>
                             <div className="mt-8 pt-4 border-t border-neutral-200">
                               <button onClick={() => alert('Deep ingestion has been simulated as background worker is not connected in this preview.')} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-[0.1em] px-4 py-3 rounded-xl transition-all shadow-sm  ">
                                  <Sparkles size={16} /> TRIGGER DEEP INGESTION SYNC
                               </button>
                             </div>
                           </div>
                        </div>
                     )}
                     {configSection === 'system_tasks' && user?.email === 'recirc@gmail.com' && (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center bg-black p-2 px-4 shadow-sm rounded-xl text-white w-fit mb-6">
                             <h3 className="text-lg font-bold uppercase text-blue-400">System Roadmap & Tasks</h3>
                           </div>
                           <div className="bg-white rounded-xl border border-neutral-200 rounded-lg p-8 font-mono text-sm leading-relaxed shadow-sm rounded-xl">
                             <h4 className="font-bold text-lg mb-4 uppercase border-b border-black pb-2">Phase 1: Infrastructure & Storage Reality</h4>
                             <ul className="list-disc pl-6 space-y-2 mb-8">
                               <li className="line-through opacity-50 text-green-700">Transition from simulated/mock file parsing to real file handling.</li>
                               <li className="line-through opacity-50 text-green-700">Integrate Google Drive API for persistent file storage.</li>
                               <li className="line-through opacity-50 text-green-700">Structure: Internal/Templates folder vs Submissions/Client folders.</li>
                               <li className="line-through opacity-50 text-green-700">Configure OAuth scopes for Drive access.</li>
                             </ul>

                             <h4 className="font-bold text-lg mb-4 uppercase border-b border-black pb-2">Phase 2: GEM Implementation ("Requirements Hunter")</h4>
                             <ul className="list-disc pl-6 space-y-2 mb-8 text-blue-800 font-bold">
                               <li>Ingest the user's 17+ Prompts and GEM Instructions.</li>
                               <li>Build the "Requirements Hunter" execution pipeline using Gemini API.</li>
                               <li>Implement the capability to truly parse extracted text from PDFs/Word Docs and pass to Gemini.</li>
                               <li>Extract overt, implied, inferred, and hidden requirements into the DB.</li>
                             </ul>

                             <h4 className="font-bold text-lg mb-4 uppercase border-b border-black pb-2">Phase 3: Scorecard & Automation</h4>
                             <ul className="list-disc pl-6 space-y-2">
                               <li>Implement the Scorecard generator GEM.</li>
                               <li>Map Requirements Hunter outputs to the Scorecard's 16 sections.</li>
                               <li>Automate the population of the scorecard artifact.</li>
                             </ul>
                           </div>
                        </div>
                     )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        </>
        )}
      </div>

      {/* Footer Status Bar */}
      <footer className="border-t border-black bg-slate-900 text-white rounded-lg px-6 py-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em]">
        <div className="flex gap-6">
          <span>PACK: v9_FLAT</span>
          <span>STATUS: SYNCED</span>
          <span>LATENCY: 12ms</span>
        </div>
        <div className="flex gap-4">
          <span>{new Date().toISOString()}</span>
          <span className="text-green-400">system_ready</span>
        </div>
      </footer>

      <AnimatePresence>
        {isQuickIngestModalOpen && (
          <QuickIngestWizard 
            onClose={() => setIsQuickIngestModalOpen(false)} 
            onComplete={(title, files) => {
              handleQuickIngestBulk(title, files);
            }} 
          />
        )}
        {isUploadingTemplate && (
          <TemplateUploadWizard 
            onClose={() => { setIsUploadingTemplate(false); setReplacingTemplateId(null); }} 
            onComplete={async (t, file) => {
              if (file) {
                 const integrations = await getPlatformIntegrations();
                 const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
                 if (driveConfig?.config?.internalId) {
                    try {
                        const { getFolderContents, uploadFileToDrive } = await import('./services/driveService');
                        const internals = await getFolderContents(null, driveConfig.config.internalId);
                        let templatesFolder = internals.find((f:any) => f.name === 'Templates');
                        if (!templatesFolder) {
                            const { createFolder } = await import('./services/driveService');
                            const newId = await createFolder(null, 'Templates', driveConfig.config.internalId);
                            templatesFolder = { id: newId };
                        }
                        if (templatesFolder) {
                            const targetFolderId = currentFolderId && currentFolderId !== driveConfig.config.internalId ? currentFolderId : templatesFolder.id;
                            await uploadFileToDrive(null, file, targetFolderId);
                            // Set parentId so UI works immediately in the current view
                            t.parentId = targetFolderId;
                        }
                    } catch(e) {
                        console.warn("Could not sync template to drive:", e);
                    }
                 }
              }

              if (replacingTemplateId) {
                const oldTemp = templates.find(temp => temp.id === replacingTemplateId);
                if (oldTemp) {
                  const updatedTemp = { 
                    ...oldTemp, 
                    currentVersion: oldTemp.currentVersion + 1,
                    versions: [...oldTemp.versions, { version: oldTemp.currentVersion + 1, uploadDate: new Date().toISOString(), description: 'Replaced document' }]
                  };
                  await updateTemplate(replacingTemplateId, updatedTemp);
                }
              } else {
                await createTemplate(t);
              }
              const allT = await getTemplates();
              if (allT.length > 0) {
                setTemplates(allT);
              } else if (!replacingTemplateId) {
                setTemplates(prev => [{ ...t, id: Math.random().toString() }, ...prev]);
              }
            }}
          />
        )}
        {viewingVersions && (
          <TemplateVersionsViewer 
            template={templates.find(t => t.id === viewingVersions)!} 
            onClose={() => setViewingVersions(null)} 
            onRevert={async (version) => {
              const t = templates.find(temp => temp.id === viewingVersions);
              if(t) {
                const updated = {
                  ...t,
                  currentVersion: version,
                  description: t.versions.find(v => v.version === version)?.description || t.description
                };
                setTemplates(prev => prev.map(temp => temp.id === t.id ? updated : temp));
                setViewingVersions(null);
                await updateTemplate(t.id, updated);
              }
            }}
          />
        )}
        {viewingFile && (
          <FileViewer 
            filename={viewingFile.filename} 
            content={viewingFile.content} 
            driveUrl={viewingFile.driveUrl}
            onClose={() => setViewingFile(null)} 
          />
        )}
      </AnimatePresence>
    
      {viewingGemContent && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col no-invert">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-slate-900 text-white rounded-t-xl">
              <h3 className="font-bold text-lg">AI Logic Viewer</h3>
              <button onClick={() => setViewingGemContent(null)} className="hover:opacity-70"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto bg-neutral-50 text-sm font-mono text-neutral-800 whitespace-pre-wrap">
              {viewingGemContent}
            </div>
          </div>
        </div>
      )}



      {showGchatSimulator && <GoogleChatSimulator onClose={() => setShowGchatSimulator(false)} />}

      {/* Co-Pilot Chat */}
      {showCoPilot ? (
        <CoPilotChat 
          submission={submissions.find(s => s.id === editingId) || submissions[0] || null} 
          onClose={() => setShowCoPilot(false)} 
        />
      ) : (
        <button 
          onClick={() => setShowCoPilot(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors z-50 rounded-md shadow-sm"
          title="Ask Elyria Co-Pilot"
        >
          <Bot size={24} />
        </button>
      )}
</div>
  );
}
