import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseVideoApi, courseApi } from '../api/courseApi';
import {
    ArrowLeft,
    Upload,
    Video,
    FileVideo,
    Loader2
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
    existingVideoUrl?: string; // For edit mode
    existingThumbnailUrl?: string; // For edit mode
}

const AddCourseVideo: React.FC = () => {
    const { id: courseId, videoId } = useParams<{ id: string; videoId?: string }>();
    const navigate = useNavigate();
    const isEditMode = !!videoId;

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
    const [loading, setLoading] = useState(isEditMode);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);


    // Fetch video details if in edit mode
    useEffect(() => {
        if (isEditMode && videoId) {
            const fetchVideoDetails = async () => {
                setLoading(true);
                try {
                    const video = await courseVideoApi.getById(Number(videoId));
                    // Check if video is array (some APIs return array) or object
                    const videoData = Array.isArray(video) ? video[0] : video;

                    if (videoData) {
                        setFormData({
                            title: videoData.title,
                            description: videoData.description || '',
                            videoFile: null,
                            thumbnailFile: null,
                            duration: videoData.duration || 0,
                            orderIndex: videoData.orderIndex || 1,
                            isPreview: videoData.isPreview,
                            existingVideoUrl: videoData.videoUrl,
                            existingThumbnailUrl: videoData.thumbnailUrl
                        });

                        if (videoData.videoUrl) setVideoPreviewAttribute(videoData.videoUrl);

                    }
                } catch (error) {
                    console.error("Failed to fetch video:", error);
                    toast.error("Failed to load video details");
                    navigate(`/courses/${courseId}/videos`);
                } finally {
                    setLoading(false);
                }
            };
            fetchVideoDetails();
        }
    }, [isEditMode, videoId, courseId, navigate]);

    // Helper to safely set video preview (if URL is valid)
    const setVideoPreviewAttribute = (url: string) => {
        // Just set it, simple validation via browser native behavior
        setVideoPreview(url);
    }

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



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Please enter a video title');
            return;
        }

        // Validate video file: required for create, optional for edit if existing url is present
        if (!isEditMode && !formData.videoFile) {
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
            // If editing and no new file, use update endpoint (if separate) or same endpoint
            // The courseApi.uploadVideo likely maps to /api/Course/{courseId}/upload-video which creates.
            // For update, we probably need courseVideoApi.update

            if (isEditMode && videoId) {
                const requestData = {
                    courseId: Number(courseId),
                    title: formData.title,
                    description: formData.description,
                    duration: formData.duration,
                    orderIndex: formData.orderIndex,
                    isPreview: formData.isPreview,
                    // If we have a new file, we can't easily upload it via simple JSON update usually. 
                    // Assuming update endpoint handles metadata. Re-uploading video might need a different flow or same upload endpoint?
                    // Based on api.json: /api/CourseVideo/update/{id} takes CourseVideoRequest (JSON).
                    // It has videoUrl. So if we uploaded a file, we'd need to upload it first to get a URL... 
                    // OR if the backend supports multipart for update. 
                    // Let's assume for now we only update metadata if no file. 
                    // If file is changed, we might need a specific upload endpoint or assume the backend handles it.
                    // Given the constraint "single video and edit single video page", let's assume we update metadata.
                    // If user wants to change video file, they might need to delete and re-add or we use upload flow.

                    // Actually, let's treat update as metadata update for now. 
                    // If the user selects a new file, we might warn them or try to use upload if supported.
                    // But looking at api.json, update takes JSON. 
                };

                // If a video file is selected during edit, we might be stuck unless there is an upload endpoint for update.
                // Let's proceed with metadata update first.

                if (formData.videoFile) {
                    toast.warning("Changing video file during edit is not fully supported yet. Updating metadata only.");
                }

                await courseVideoApi.update(Number(videoId), requestData);
                toast.success('Video updated successfully!');

            } else {
                // Creation flow (Upload)
                const formDataToSend = new FormData();
                formDataToSend.append('file', formData.videoFile!);
                formDataToSend.append('title', formData.title);
                formDataToSend.append('description', formData.description || '');
                formDataToSend.append('duration', String(formData.duration || 0));
                formDataToSend.append('orderIndex', String(formData.orderIndex || 0));
                formDataToSend.append('isPreview', String(formData.isPreview));

                toast.info('Uploading video...');

                await courseApi.uploadVideo(
                    Number(courseId),
                    formDataToSend,
                    (progress) => {
                        setUploadProgress(progress);
                    }
                );
                toast.success('Video uploaded successfully!');
            }

            navigate(`/courses/${courseId}/videos`);

        } catch (error: any) {
            console.error('Operation error:', error);
            toast.error(error.message || 'Failed to save video');
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-primary-navy animate-spin" />
                <span className="ml-2 text-slate-600">Loading video details...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/courses/${courseId}/videos`)}
                        className="flex items-center gap-2 text-slate-600 hover:text-primary-navy mb-4 transition-colors group"
                        disabled={uploading}
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Videos</span>
                    </button>

                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {isEditMode ? 'Edit' : 'Add New'} <span className="text-primary-navy">Video</span>
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {isEditMode ? 'Update video details' : 'Upload a single video to your course'}
                    </p>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video File Upload - Only show if adding (or maybe allow replacing if backed supported) */}
                    <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <FileVideo className="text-primary-navy" size={24} />
                            Video File
                        </h2>

                        <div className="space-y-4">
                            {/* File Input */}
                            <div className="relative">
                                {/* If in Edit Mode, show existing video info/preview and maybe a notice that file can't be changed easily or require re-upload */}
                                {isEditMode && !formData.videoFile ? (
                                    <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-200 rounded-2xl bg-slate-50">
                                        {videoPreview ? (
                                            <div className="flex flex-col items-center gap-4 p-4 w-full h-full">
                                                <video
                                                    src={videoPreview}
                                                    className="w-full max-w-md h-full object-contain rounded-xl"
                                                    controls
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-slate-500">No video preview available</p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-2 pb-2">To change the video file, please delete this video and upload a new one.</p>
                                    </div>
                                ) : (
                                    <>
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
                                    </>
                                )}
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

                            {/* Thumbnail Upload: Only showing if supported (current update logic is metadata mostly) */}
                            {/* 
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Thumbnail (Optional)
                                </label>
                                {/* ... thumbnail input code ... */}
                            {/* Simplified: reusing same logic if needed, but keeping it simple for now as update doesn't support file upload easily */
                            /* </div>
                             */}

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
                                        {isEditMode ? 'Saving changes...' : `Uploading video... ${uploadProgress}%`}
                                    </p>
                                    {!isEditMode && (
                                        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-gradient-to-r from-primary-navy to-primary-navy-light h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/courses/${courseId}/videos`)}
                            disabled={uploading}
                            className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || (!isEditMode && !formData.videoFile) || !formData.title.trim()}
                            className="flex-1 px-6 py-4 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-2xl shadow-lg shadow-primary-navy/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {isEditMode ? 'Saving...' : 'Uploading...'}
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    {isEditMode ? 'Update Video' : 'Upload Video'}
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
