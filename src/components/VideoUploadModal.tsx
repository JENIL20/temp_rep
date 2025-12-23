import { useState, useRef } from 'react';
import { Upload, X, Video, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: (videoUrl: string) => void;
}

const VideoUploadModal = ({ isOpen, onClose, onUploadComplete }: VideoUploadModalProps) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
            if (!validTypes.includes(file.type)) {
                setErrorMessage('Please select a valid video file (MP4, WebM, OGG, or MOV)');
                setUploadStatus('error');
                return;
            }

            // Validate file size (max 500MB)
            const maxSize = 500 * 1024 * 1024; // 500MB
            if (file.size > maxSize) {
                setErrorMessage('File size must be less than 500MB');
                setUploadStatus('error');
                return;
            }

            setSelectedFile(file);
            setUploadStatus('idle');
            setErrorMessage('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setErrorMessage('Please select a file first');
            setUploadStatus('error');
            return;
        }

        setUploading(true);
        setUploadStatus('uploading');
        setUploadProgress(0);

        try {
            // Simulate upload progress (replace with actual upload logic)
            const formData = new FormData();
            formData.append('file', selectedFile);

            // For demo purposes, we'll simulate an upload
            // In production, you would upload to your backend or cloud storage
            const simulateUpload = () => {
                return new Promise<string>((resolve) => {
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 10;
                        setUploadProgress(progress);

                        if (progress >= 100) {
                            clearInterval(interval);
                            // Return a mock URL (in production, this would be the actual uploaded URL)
                            const mockUrl = `https://storage.example.com/videos/${Date.now()}_${selectedFile.name}`;
                            resolve(mockUrl);
                        }
                    }, 300);
                });
            };

            const videoUrl = await simulateUpload();

            setUploadStatus('success');
            setTimeout(() => {
                onUploadComplete(videoUrl);
                handleClose();
            }, 1000);

        } catch (error) {
            console.error('Upload failed:', error);
            setErrorMessage('Upload failed. Please try again.');
            setUploadStatus('error');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
        setErrorMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-navy-light text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Upload size={24} />
                        Upload Video
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        disabled={uploading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* File Input */}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />

                        <div
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${selectedFile
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300 hover:border-primary-navy hover:bg-blue-50'
                                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Video className={`mx-auto mb-4 ${selectedFile ? 'text-green-600' : 'text-gray-400'}`} size={48} />

                            {selectedFile ? (
                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                    {!uploading && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                                setUploadStatus('idle');
                                            }}
                                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                                        >
                                            Remove file
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <p className="font-semibold text-gray-900 mb-1">Click to select a video file</p>
                                    <p className="text-sm text-gray-600">
                                        Supports MP4, WebM, OGG, MOV (max 500MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {uploadStatus === 'uploading' && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">Uploading...</span>
                                <span className="font-semibold text-primary-navy">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-primary-navy to-blue-500 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {uploadStatus === 'success' && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                            <CheckCircle size={20} />
                            <span className="font-medium">Upload successful!</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {uploadStatus === 'error' && errorMessage && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <AlertCircle size={20} />
                            <span className="font-medium">{errorMessage}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading || uploadStatus === 'success'}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Upload Video
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoUploadModal;
