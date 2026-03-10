import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText, Upload, Trash2, ArrowLeft, Calendar,
    File, Shield, Eye, X, Loader2, FileUp, ShieldCheck
} from 'lucide-react';
import { courseApi } from '../api/courseApi';
import { toast } from 'react-toastify';
import { confirmToast } from '@/shared/utils/confirmToast';
import PermissionGate from '@/shared/components/auth/PermissionGate';

interface CourseDocument {
    id: number;
    courseId: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
    uploadedBy?: string;
}

// ─── Privacy-Hardened Document Viewer ─────────────────────────────────────────
const SecureDocumentViewer = ({ doc, onClose }: { doc: CourseDocument; onClose: () => void }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // Disable keyboard shortcuts for print / save
        const handleKeyDown = (e: KeyboardEvent) => {
            const blocked = (
                (e.ctrlKey || e.metaKey) && ['p', 's', 'u', 'c', 'a'].includes(e.key.toLowerCase())
            ) || e.key === 'PrintScreen' || e.key === 'F12';
            if (blocked) {
                e.preventDefault();
                e.stopPropagation();
                toast.warning('⚠️ Saving & printing is disabled for this document.');
            }
        };

        // Block context menu (right-click)
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            toast.warning('⚠️ This document is protected.');
        };

        // Block print via CSS + media query hack
        const style = document.createElement('style');
        style.id = 'secure-doc-style';
        style.textContent = `@media print { body * { visibility: hidden !important; } }`;
        document.head.appendChild(style);

        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.getElementById('secure-doc-style')?.remove();
        };
    }, []);

    // Build a secure URL: for PDF, append #toolbar=0&navpanes=0&scrollbar=0 to disable browser tools
    const getSecureUrl = (url: string) => {
        if (!url) return '';
        const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
        const base = isAbsolute ? url : `${window.location.origin}${url}`;
        if (base.toLowerCase().includes('.pdf') || base.toLowerCase().includes('pdf')) {
            return `${base}#toolbar=0&navpanes=0&scrollbar=0&zoom=100`;
        }
        return base;
    };

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/30 flex items-center justify-center">
                        <FileText className="text-indigo-400" size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm truncate max-w-xs sm:max-w-md">{doc.fileName}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <ShieldCheck size={12} className="text-green-400" />
                            Secure & Protected View
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                    <X size={22} />
                </button>
            </div>

            {/* Viewer Area — stacked layers for protection */}
            <div
                ref={overlayRef}
                className="relative flex-1 overflow-hidden select-none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            >
                {/* Semi-transparent privacy overlay to discourage screen capture */}
                <div
                    className="pointer-events-none absolute inset-0 z-10"
                    style={{
                        background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(99,102,241,0.03) 40px, rgba(99,102,241,0.03) 80px)',
                    }}
                />

                {/* Watermark text overlay */}
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center opacity-[0.05]">
                    <p className="text-white text-8xl font-black rotate-[-30deg] select-none whitespace-nowrap tracking-widest">
                        CONFIDENTIAL
                    </p>
                </div>

                <iframe
                    ref={iframeRef}
                    src={getSecureUrl(doc.fileUrl)}
                    className="w-full h-full border-0"
                    title={doc.fileName}
                    sandbox="allow-same-origin allow-scripts"
                    onContextMenu={(e) => e.preventDefault()}
                />
            </div>

            {/* Footer info bar */}
            <div className="bg-gray-900 border-t border-gray-700 px-6 py-2.5 flex items-center gap-3 flex-shrink-0">
                <Shield size={14} className="text-green-400 flex-shrink-0" />
                <p className="text-xs text-gray-400">
                    This document is protected. Printing, saving, and screenshotting are restricted.
                </p>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const CourseDocuments = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<CourseDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [viewingDoc, setViewingDoc] = useState<CourseDocument | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const courseId = Number(id || '0');

    useEffect(() => {
        fetchDocuments();
    }, [id]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const docs = await courseApi.getDocuments(courseId);
            setDocuments(Array.isArray(docs) ? docs : []);
        } catch (err) {
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    // const handleUpload = async (file: File) => {
    //     if (!file) return;

    //     const allowedTypes = [
    //         'application/pdf',
    //         'application/msword',
    //         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    //         'application/vnd.ms-excel',
    //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //         'application/vnd.ms-powerpoint',
    //         'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    //         'text/plain',
    //         'application/zip',
    //     ];

    //     if (!allowedTypes.includes(file.type)) {
    //         toast.error('Unsupported file type. Please upload PDF, Word, Excel, PowerPoint, or ZIP files.');
    //         return;
    //     }

    //     if (file.size > 50 * 1024 * 1024) {
    //         toast.error('File size exceeds 50MB limit.');
    //         return;
    //     }

    //     try {
    //         setUploading(true);
    //         setUploadProgress(0);
    //         await courseApi.uploadDocument(courseId, file, (p) => setUploadProgress(p));
    //         toast.success(`"${file.name}" uploaded successfully!`);
    //         fetchDocuments();
    //     } catch (err) {
    //         const message = err instanceof Error ? err.message : 'Upload failed';
    //         toast.error(message);
    //     } finally {
    //         setUploading(false);
    //         setUploadProgress(0);
    //         if (fileInputRef.current) fileInputRef.current.value = '';
    //     }
    // };
const handleUpload = async (file: File) => {
    if (!file) return;

    try {
        setUploading(true);
        setUploadProgress(0);

        await courseApi.uploadDocument(courseId, file, (progress) => {
            setUploadProgress(progress);
        });

        toast.success(`"${file.name}" uploaded successfully`);
        await fetchDocuments();

    } catch (err: any) {
        toast.error(err?.message || "Upload failed");
    } finally {
        setUploading(false);
        setUploadProgress(0);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
};

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUpload(file);
    };

    const handleDelete = async (docId: number, fileName: string) => {
        const ok = await confirmToast({
            title: `Delete "${fileName}"?`,
            message: 'This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            toastOptions: { type: 'warning' },
        });
        if (!ok) return;

        try {
            await courseApi.deleteDocument(docId);
            setDocuments(prev => prev.filter(d => d.id !== docId));
            toast.success('Document deleted');
        } catch {
            toast.error('Failed to delete document');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes || bytes === 0) return '—';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    const getFileIcon = (name: string) => {
        const ext = name?.split('.').pop()?.toLowerCase();
        const colorMap: Record<string, string> = {
            pdf: 'text-red-500 bg-red-50',
            doc: 'text-blue-600 bg-blue-50',
            docx: 'text-blue-600 bg-blue-50',
            xls: 'text-green-600 bg-green-50',
            xlsx: 'text-green-600 bg-green-50',
            ppt: 'text-orange-500 bg-orange-50',
            pptx: 'text-orange-500 bg-orange-50',
            zip: 'text-yellow-600 bg-yellow-50',
            txt: 'text-gray-500 bg-gray-100',
        };
        return colorMap[ext || ''] ?? 'text-indigo-500 bg-indigo-50';
    };

    return (
        <>
            {/* Secure viewer overlay */}
            {viewingDoc && (
                <SecureDocumentViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />
            )}

            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Page Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate(`/courses/${id}`)}
                                    className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white flex-shrink-0">
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Course Documents</h1>
                                    <p className="text-sm text-gray-500 font-medium mt-0.5 flex items-center gap-1.5">
                                        <ShieldCheck size={14} className="text-green-500" />
                                        All documents are privacy-protected
                                    </p>
                                </div>
                            </div>

                            <PermissionGate module="COURSE_MANAGEMENT" permission="course_add">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-60"
                                >
                                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    {uploading ? `Uploading ${uploadProgress}%` : 'Upload Document'}
                                </button>
                            </PermissionGate>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                                onChange={handleFileSelect}
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
                    {/* Upload progress bar */}
                    {uploading && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <Loader2 size={18} className="animate-spin text-indigo-600" />
                                <span className="text-sm font-bold text-gray-900">Uploading document...</span>
                                <span className="ml-auto text-sm font-bold text-indigo-600">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Drop Zone */}
                    <PermissionGate module="COURSE_MANAGEMENT" permission="course_add">
                        <div
                            ref={dropZoneRef}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${isDragOver
                                ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                                : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30 bg-white'
                                }`}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                                <FileUp size={28} className="text-indigo-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-900">Drag & drop a file here, or <span className="text-indigo-600">click to browse</span></p>
                                <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint, ZIP — max 50MB</p>
                            </div>
                        </div>
                    </PermissionGate>

                    {/* Documents List */}
                    {loading ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 flex flex-col items-center gap-4">
                            <Loader2 size={36} className="animate-spin text-indigo-500" />
                            <p className="text-sm text-gray-500 font-medium">Loading documents...</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-20 flex flex-col items-center gap-4 text-center px-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <FileText className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No Documents Yet</h3>
                            <p className="text-gray-500 max-w-sm">Upload PDFs, Word docs, or other study materials for this course.</p>
                            <PermissionGate module="COURSE_MANAGEMENT" permission="course_add">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
                                >
                                    <Upload size={18} />
                                    Upload First Document
                                </button>
                            </PermissionGate>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <File size={18} className="text-indigo-600" />
                                    {documents.length} Document{documents.length !== 1 ? 's' : ''}
                                </h2>
                                <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                    <Shield size={12} className="text-green-500" />
                                    Protected
                                </span>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors"
                                    >
                                        {/* File type icon */}
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getFileIcon(doc.fileName)}`}>
                                            <FileText size={22} />
                                        </div>

                                        {/* File info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{doc.fileName}</p>
                                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                                <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
                                                {doc.uploadedAt && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Calendar size={11} />
                                                        {formatDate(doc.uploadedAt)}
                                                    </span>
                                                )}
                                                {doc.uploadedBy && (
                                                    <span className="text-xs text-gray-400">by {doc.uploadedBy}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => setViewingDoc(doc)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs rounded-lg transition-all"
                                                title="View document (secure)"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>

                                            <PermissionGate module="COURSE_MANAGEMENT" permission="course_edit">
                                                <button
                                                    onClick={() => handleDelete(doc.id, doc.fileName)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </PermissionGate>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Privacy Notice */}
                    <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 flex gap-3 items-start">
                        <ShieldCheck className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-green-800">Document Privacy Protection</p>
                            <p className="text-xs text-green-700 mt-1 leading-relaxed">
                                All documents are served in a secure viewer with restricted print, download, right-click, and screenshot protections.
                                Keyboard shortcuts for printing (Ctrl+P) and saving (Ctrl+S) are blocked inside the viewer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseDocuments;
