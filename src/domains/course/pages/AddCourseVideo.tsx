import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseVideoApi, courseApi } from '../api/courseApi';
import {
    ArrowLeft,
    Upload,
    Video,
    FileVideo,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

interface VideoFormData {
    title: string;
    description: string;
    videoFile: File | null;
    thumbnailFile: File | null;
    duration: number;
    orderIndex: number;
    isPreview: boolean;
}

const AddCourseVideo: React.FC = () => {
    const { id: courseId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<VideoFormData>({
        title: '',
        description: '',
        videoFile: null,
        thumbnailFile: null,
        duration: 0,
        orderIndex: 1,
        isPreview: false
    });

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('video/')) {
                toast.error('Please select a valid video file');
                return;
            }

            // Validate file size (max 500MB)
            const maxSize = 500 * 1024 * 1024; // 500MB
            if (file.size > maxSize) {
                toast.error('Video file size must be less than 500MB');
                return;
            }

            setFormData(prev => ({ ...prev, videoFile: file }));

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setVideoPreview(previewUrl);

            // Get video duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                setFormData(prev => ({ ...prev, duration: Math.floor(video.duration) }));
            };
            video.src = previewUrl;
        }
    };

    const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                toast.error('Thumbnail file size must be less than 5MB');
                return;
            }

            setFormData(prev => ({ ...prev, thumbnailFile: file }));

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setThumbnailPreview(previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Please enter a video title');
            return;
        }

        if (!formData.videoFile) {
            toast.error('Please select a video file');
            return;
        }

        if (!courseId) {
            toast.error('Course ID is missing');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const formDataToSend = new FormData();

            // ✅ REQUIRED
            formDataToSend.append('file', formData.videoFile);
            formDataToSend.append('title', formData.title);

            // ✅ OPTIONAL / METADATA
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('duration', String(formData.duration || 0));
            formDataToSend.append('orderIndex', String(formData.orderIndex || 0));
            formDataToSend.append('isPreview', String(formData.isPreview));

            toast.info('Uploading video...');

            const response = await courseApi.uploadVideo(
                Number(courseId),
                formDataToSend,
                (progress) => {
                    setUploadProgress(progress);
                }
            );

            toast.success('Video uploaded successfully!');
            navigate(`/courses/${courseId}`);

        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload video');
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };


    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="flex items-center gap-2 text-slate-600 hover:text-primary-navy mb-4 transition-colors group"
                        disabled={uploading}
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Course Details</span>
                    </button>

                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Add New <span className="text-primary-navy">Video</span>
                    </h1>
                    <p className="text-slate-500 mt-2">Upload a single video to your course</p>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video File Upload */}
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <FileVideo className="text-primary-navy" size={24} />
                            Video File
                        </h2>

                        <div className="space-y-4">
                            {/* File Input */}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoFileChange}
                                    disabled={uploading}
                                    className="hidden"
                                    id="video-file-input"
                                />
                                <label
                                    htmlFor="video-file-input"
                                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${formData.videoFile
                                        ? 'border-primary-navy bg-primary-navy/5'
                                        : 'border-slate-300 hover:border-primary-navy hover:bg-slate-50'
                                        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {videoPreview ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <video
                                                src={videoPreview}
                                                className="w-full max-w-md h-40 object-cover rounded-xl"
                                                controls={false}
                                            />
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {formData.videoFile?.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {formData.videoFile && formatFileSize(formData.videoFile.size)}
                                                    {formData.duration > 0 && ` • ${formatDuration(formData.duration)}`}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-primary-navy/10 rounded-full flex items-center justify-center">
                                                <Upload className="w-8 h-8 text-primary-navy" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    Click to upload video
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    MP4, WebM, or OGG (max 500MB)
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Video Details */}
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Video className="text-primary-navy" size={24} />
                            Video Details
                        </h2>

                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Video Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    disabled={uploading}
                                    placeholder="e.g., Introduction to React Hooks"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-navy/5 focus:border-primary-navy outline-none transition-all"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    disabled={uploading}
                                    placeholder="Describe what students will learn in this video..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-navy/5 focus:border-primary-navy outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Order Index */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Video Order
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.orderIndex}
                                    onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 1 }))}
                                    disabled={uploading}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-navy/5 focus:border-primary-navy outline-none transition-all"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    The order in which this video appears in the course
                                </p>
                            </div>

                            {/* Thumbnail Upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Thumbnail (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailFileChange}
                                    disabled={uploading}
                                    className="hidden"
                                    id="thumbnail-file-input"
                                />
                                <label
                                    htmlFor="thumbnail-file-input"
                                    className={`flex items-center gap-4 w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${thumbnailPreview
                                        ? 'border-primary-navy bg-primary-navy/5'
                                        : 'border-slate-300 hover:border-primary-navy hover:bg-slate-50'
                                        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {thumbnailPreview ? (
                                        <>
                                            <img
                                                src={thumbnailPreview}
                                                alt="Thumbnail preview"
                                                className="w-32 h-20 object-cover rounded-lg"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {formData.thumbnailFile?.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {formData.thumbnailFile && formatFileSize(formData.thumbnailFile.size)}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    Upload thumbnail
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    PNG, JPG, or WebP (max 5MB)
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </label>
                            </div>

                            {/* Is Preview Checkbox */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is-preview"
                                    checked={formData.isPreview}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPreview: e.target.checked }))}
                                    disabled={uploading}
                                    className="w-5 h-5 text-primary-navy border-slate-300 rounded focus:ring-2 focus:ring-primary-navy/20"
                                />
                                <label htmlFor="is-preview" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Make this a preview video (visible to non-enrolled students)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <Loader2 className="w-6 h-6 text-primary-navy animate-spin" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Uploading video... {uploadProgress}%
                                    </p>
                                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-gradient-to-r from-primary-navy to-primary-navy-light h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/courses/${courseId}`)}
                            disabled={uploading}
                            className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !formData.videoFile || !formData.title.trim()}
                            className="flex-1 px-6 py-4 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-2xl shadow-lg shadow-primary-navy/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Upload Video
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCourseVideo;
