import { useState, useRef } from 'react';
import { Upload, X, Video, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

interface VideoFile {
    id: string;
    file: File;
    name: string;
    size: number;
    preview?: string;
}

const VideoUploadApp = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const handleVideoUpload = (file: File) => {
        const videoFile: VideoFile = {
            id: Date.now().toString(),
            file: file,
            name: file.name,
            size: file.size,
        };

        // Create preview URL for video
        const previewUrl = URL.createObjectURL(file);
        videoFile.preview = previewUrl;

        setVideoFiles(prev => [...prev, videoFile]);
    };

    const handleRemoveVideo = (id: string) => {
        setVideoFiles(prev => {
            const video = prev.find(v => v.id === id);
            if (video?.preview) {
                URL.revokeObjectURL(video.preview);
            }
            return prev.filter(v => v.id !== id);
        });
    };

    const handleSaveAllVideos = async () => {
        if (videoFiles.length === 0) {
            alert('No videos to save!');
            return;
        }

        setSaving(true);
        setSaveStatus('saving');

        try {
            // Create FormData with all video files
            const formData = new FormData();

            videoFiles.forEach((videoFile, index) => {
                formData.append(`video_${index}`, videoFile.file);
                formData.append(`video_${index}_name`, videoFile.name);
            });

            // Simulate API call (replace with your actual API endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Example of actual upload:
            // const response = await fetch('/api/save-videos', {
            //   method: 'POST',
            //   body: formData
            // });
            // const result = await response.json();

            setSaveStatus('success');

            // Clear videos after successful save
            setTimeout(() => {
                videoFiles.forEach(v => {
                    if (v.preview) URL.revokeObjectURL(v.preview);
                });
                setVideoFiles([]);
                setSaveStatus('idle');
            }, 2000);

        } catch (error) {
            console.error('Save failed:', error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Video Upload Manager</h1>
                    <p className="text-gray-600">Upload and manage your video files</p>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Videos ({videoFiles.length})</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Total size: {(videoFiles.reduce((acc, v) => acc + v.size, 0) / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                            >
                                <Upload size={20} />
                                Add Video
                            </button>
                            {videoFiles.length > 0 && (
                                <button
                                    onClick={handleSaveAllVideos}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            Save All Videos
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Save Status */}
                    {saveStatus === 'success' && (
                        <div className="mt-4 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                            <CheckCircle size={20} />
                            <span className="font-medium">All videos saved successfully!</span>
                        </div>
                    )}
                    {saveStatus === 'error' && (
                        <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            <AlertCircle size={20} />
                            <span className="font-medium">Failed to save videos. Please try again.</span>
                        </div>
                    )}
                </div>

                {/* Video List */}
                <div className="space-y-4">
                    {videoFiles.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                            <Video size={64} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos uploaded yet</h3>
                            <p className="text-gray-600 mb-6">Click "Add Video" to start uploading</p>
                        </div>
                    ) : (
                        videoFiles.map((videoFile) => (
                            <div key={videoFile.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-6">
                                    {/* Video Preview */}
                                    <div className="flex-shrink-0">
                                        {videoFile.preview ? (
                                            <video
                                                src={videoFile.preview}
                                                className="w-32 h-20 object-cover rounded-lg bg-gray-900"
                                                controls={false}
                                            />
                                        ) : (
                                            <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <Video size={32} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Video Info */}
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-900 mb-1">{videoFile.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={() => handleRemoveVideo(videoFile.id)}
                                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        disabled={saving}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <VideoUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUploadComplete={handleVideoUpload}
            />
        </div>
    );
};

interface VideoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: (file: File) => void;
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
            const maxSize = 500 * 1024 * 1024;
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
            // Simulate validation/processing progress
            const simulateProcessing = () => {
                return new Promise<void>((resolve) => {
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 10;
                        setUploadProgress(progress);

                        if (progress >= 100) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 300);
                });
            };

            await simulateProcessing();

            setUploadStatus('success');
            setTimeout(() => {
                onUploadComplete(selectedFile);
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
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
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
                                : 'border-gray-300 hover:border-blue-600 hover:bg-blue-50'
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
                                <span className="text-gray-700">Processing...</span>
                                <span className="font-semibold text-blue-600">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {uploadStatus === 'success' && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                            <CheckCircle size={20} />
                            <span className="font-medium">Video ready!</span>
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
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Add Video
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