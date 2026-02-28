import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, Upload, Trash2, ArrowLeft, Calendar, FileIcon } from 'lucide-react';
import { courseApi } from '../api/courseApi';
import FileUpload from '../components/FileUpload';
import { toast } from 'react-toastify';
import { confirmToast } from '@/shared/utils/confirmToast';

interface CourseDocument {
    id: number;
    courseId: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
    uploadedBy?: string;
}

const CourseDocuments: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<CourseDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [id]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const docs = await courseApi.getDocuments(Number(id || '1'));
            setDocuments(docs);
            setError(null);
        } catch (err: unknown) {
            console.error('Error fetching documents:', err);
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };



    const handleDownload = async (doc: CourseDocument) => {
        try {
            // Simulate download
            console.log(`Simulating download for ${doc.fileName}`);
            toast.info(`Download started for ${doc.fileName}`);
        } catch (err) {
            console.error('Download error:', err);
            toast.error('Failed to download file. Please try again.');
        }
    };

    const handleDelete = async (docId: number) => {
        const ok = await confirmToast({
            title: "Delete document?",
            message: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            toastOptions: { type: "warning" },
        });
        if (!ok) return;

        try {
            await courseApi.deleteDocument(docId);
            await fetchDocuments();
            toast.success("Document deleted");
        } catch (err: unknown) {
            console.error('Delete error:', err);
            toast.error('Failed to delete document');
        }
    };

    const handleUploadSuccess = () => {
        setShowUpload(false);
        fetchDocuments();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-primary-navy to-primary-navy-light text-white rounded-2xl p-8 shadow-xl">
                    <button
                        onClick={() => navigate(`/courses/${id}`)}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Course</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Course Documents</h1>
                            <p className="text-gray-200">Download study materials and resources</p>
                        </div>
                        <button
                            onClick={() => setShowUpload(!showUpload)}
                            className="bg-white text-primary-navy px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="max-w-7xl mx-auto mb-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                        <p className="text-yellow-800">
                            <strong>Note:</strong> Showing sample data. {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Upload Section */}
            {showUpload && (
                <div className="max-w-7xl mx-auto mb-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Upload New Document</h2>
                        <FileUpload
                            courseId={parseInt(id || '1')}
                            uploadType="document"
                            onUploadSuccess={handleUploadSuccess}
                            maxSizeMB={50}
                        />
                    </div>
                </div>
            )}

            {/* Documents List */}
            <div className="max-w-7xl mx-auto">
                {documents.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No documents available
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Documents for this course will appear here once they are uploaded
                        </p>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="bg-primary-navy text-white px-6 py-3 rounded-lg hover:bg-primary-navy-dark transition-colors font-medium inline-flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Upload First Document
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-navy/5 to-secondary-gold/10 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="text-primary-navy" />
                                Available Documents ({documents.length})
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* File Icon */}
                                            <div className="bg-primary-navy/10 p-3 rounded-lg flex-shrink-0">
                                                <FileIcon className="w-6 h-6 text-primary-navy" />
                                            </div>

                                            {/* File Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                                                    {doc.fileName}
                                                </h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    <span>{formatFileSize(doc.fileSize)}</span>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{formatDate(doc.uploadedAt)}</span>
                                                    </div>
                                                    {doc.uploadedBy && (
                                                        <span>Uploaded by: {doc.uploadedBy}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleDownload(doc)}
                                                className="p-2 text-primary-navy hover:bg-primary-navy/10 rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDocuments;
