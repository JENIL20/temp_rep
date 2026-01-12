import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courseApi, courseVideoApi, CourseVideoRequest } from "../api/courseApi";
import { categoryApi } from "../../category/api/categoryApi";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Upload,
    Video,
    FileText,
    Settings,
    Eye,
    X,
    GripVertical,
    Clock,
    DollarSign,
    Award,
    BookOpen,
    Image as ImageIcon,
    Play
} from "lucide-react";
import VideoUploadModal from "./VideoUploadModal";

type StepType = 'basic' | 'details' | 'videos' | 'preview';

interface VideoFormData {
    id?: number;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
    thumbnailUrl: string;
    isActive: boolean;
}


const CourseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [activeStep, setActiveStep] = useState<StepType>('basic');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Course form data
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        instructor: "",
        difficulty: "beginner",
        durationHours: 0,
        price: 0,
        categoryId: 1,
        thumbnailUrl: "",
        isActive: true,
    });

    // Videos data
    const [videos, setVideos] = useState<VideoFormData[]>([]);
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
    const [videoFormData, setVideoFormData] = useState<VideoFormData>({
        title: "",
        description: "",
        videoUrl: "",
        duration: 0,
        order: 1,
        thumbnailUrl: "",
        isActive: true,
    });

    // Video upload modal
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Categories for dropdown
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

    // Fetch course data if editing
    useEffect(() => {
        if (isEditMode) {
            fetchCourseData();
        }
        fetchCategories();
    }, [id]);

    const fetchCourseData = async () => {
        setLoading(true);
        try {
            if (!id) return;

            const courseId = parseInt(id);
            const courseRes = await courseApi.getById(courseId);
            setCourseData({
                ...courseRes,
                categoryId: courseRes.categoryId || 1,
                thumbnailUrl: courseRes.thumbnailUrl || ""
            });

            const videosRes = await courseVideoApi.listByCourse(courseId);
            console.log("COURSE VIDEOS FORM", videosRes);
            setVideos(videosRes.map((v: any, index: number) => ({
                id: v.id,
                title: v.title,
                description: v.description || '',
                videoUrl: v.videoUrl,
                duration: v.duration || 0,
                order: v.orderIndex || index + 1,
                thumbnailUrl: v.thumbnailUrl || '',
                isActive: v.isPreview || true,
            })));
        } catch (error) {
            console.error("Failed to fetch course data:", error);
            // Use sample data for demo
            setCourseData({
                title: "Sample Course",
                description: "This is a sample course description",
                instructor: "John Doe",
                difficulty: "intermediate",
                durationHours: 10,
                price: 999,
                categoryId: 1,
                thumbnailUrl: "",
                isActive: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const result = await categoryApi.list();
            const categoryList = Array.isArray(result) ? result : [];
            setCategories(categoryList.map((c: any) => ({
                id: Number(c.id),
                name: c.categoryName
            })));
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setCourseData({
            ...courseData,
            [name]: type === 'number' ? parseFloat(value) : value,
        });
    };

    const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setVideoFormData({
            ...videoFormData,
            [name]: type === 'number' ? parseFloat(value) : value,
        });
    };

    const handleAddVideo = () => {
        if (!videoFormData.title || !videoFormData.videoUrl) {
            alert("Please fill in video title and URL");
            return;
        }

        if (editingVideoIndex !== null) {
            // Update existing video
            const updatedVideos = [...videos];
            updatedVideos[editingVideoIndex] = videoFormData;
            setVideos(updatedVideos);
            setEditingVideoIndex(null);
        } else {
            // Add new video
            setVideos([...videos, { ...videoFormData, order: videos.length + 1 }]);
        }

        // Reset form
        setVideoFormData({
            title: "",
            description: "",
            videoUrl: "",
            duration: 0,
            order: videos.length + 2,
            thumbnailUrl: "",
            isActive: true,
        });
        setShowVideoForm(false);
    };

    const handleEditVideo = (index: number) => {
        setVideoFormData(videos[index]);
        setEditingVideoIndex(index);
        setShowVideoForm(true);
    };

    const handleDeleteVideo = (index: number) => {
        if (confirm("Are you sure you want to delete this video?")) {
            setVideos(videos.filter((_, i) => i !== index));
        }
    };

    const handleReorderVideo = (index: number, direction: 'up' | 'down') => {
        const newVideos = [...videos];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newVideos.length) return;

        [newVideos[index], newVideos[targetIndex]] = [newVideos[targetIndex], newVideos[index]];

        // Update order numbers
        newVideos.forEach((video, idx) => {
            video.order = idx + 1;
        });

        setVideos(newVideos);
    };

    const handleSaveCourse = async () => {
        if (!courseData.title || !courseData.description) {
            alert("Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            let courseId = id ? parseInt(id) : null;

            if (isEditMode && courseId) {
                // Update existing course
                await courseApi.update(courseId, courseData);
            } else {
                // Create new course
                const res: any = await courseApi.create(courseData);
                courseId = res.data.id || res.data.courseId;
            }

            // Save videos using the new CourseVideo API
            if (videos.length > 0 && courseId) {
                // Process each video
                for (const video of videos) {
                    const videoData: CourseVideoRequest = {
                        courseId: courseId,
                        title: video.title,
                        description: video.description || '',
                        // videoUrl: video.videoUrl,
                        // duration: video.duration || 0,
                        // orderIndex: video.order,
                        // thumbnailUrl: video.thumbnailUrl || '',
                        // isPreview: video.isActive,
                    };

                    if (video.id) {
                        // Update existing video
                        await courseVideoApi.update(video.id, videoData);
                    } else {
                        // Create new video
                        await courseVideoApi.create(videoData);
                    }
                }
            }

            alert(`Course ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/courses');
        } catch (error) {
            console.error("Failed to save course:", error);
            alert(`Failed to ${isEditMode ? 'update' : 'create'} course. Please check the console for details.`);
        } finally {
            setSaving(false);
        }
    };

    const steps = [
        { id: 'basic', label: 'Basic Info', icon: FileText },
        { id: 'details', label: 'Details', icon: Settings },
        { id: 'videos', label: 'Videos', icon: Video },
        { id: 'preview', label: 'Preview', icon: Eye },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-gray-600">Loading course...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-navy via-primary-navy-light to-primary-navy-dark text-white shadow-xl">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <button
                        onClick={() => navigate("/courses")}
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Courses</span>
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {isEditMode ? 'Edit Course' : 'Create New Course'}
                    </h1>
                    <p className="text-white/90">
                        {isEditMode ? 'Update your course information and content' : 'Fill in the details to create a new course'}
                    </p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="max-w-7xl mx-auto px-6 -mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = activeStep === step.id;
                            const isCompleted = steps.findIndex(s => s.id === activeStep) > index;

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <button
                                        onClick={() => setActiveStep(step.id as StepType)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-primary-navy text-white shadow-lg'
                                            : isCompleted
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium hidden md:inline">{step.label}</span>
                                    </button>
                                    {index < steps.length - 1 && (
                                        <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        {/* Basic Info Step */}
                        {activeStep === 'basic' && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Course Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={courseData.title}
                                            onChange={handleCourseInputChange}
                                            placeholder="e.g., Complete Web Development Bootcamp"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={courseData.description}
                                            onChange={handleCourseInputChange}
                                            rows={4}
                                            placeholder="Provide a detailed description of what students will learn..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Instructor Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="instructor"
                                            value={courseData.instructor}
                                            onChange={handleCourseInputChange}
                                            placeholder="e.g., Dr. Sarah Johnson"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="categoryId"
                                            value={courseData.categoryId}
                                            onChange={handleCourseInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Thumbnail URL
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                name="thumbnailUrl"
                                                value={courseData.thumbnailUrl}
                                                onChange={handleCourseInputChange}
                                                placeholder="https://example.com/image.jpg"
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                            />
                                            <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                <Upload size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={courseData.isActive}
                                                onChange={(e) => setCourseData({ ...courseData, isActive: e.target.checked })}
                                                className="w-5 h-5 text-primary-navy rounded focus:ring-2 focus:ring-primary-navy"
                                            />
                                            <span className="text-sm font-semibold text-gray-700">Active Course</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1 ml-7">
                                            Make this course visible to students
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t">
                                    <button
                                        onClick={() => navigate('/courses')}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setActiveStep('details')}
                                        className="px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
                                    >
                                        Next: Details
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Details Step */}
                        {activeStep === 'details' && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Details</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Award size={16} />
                                                Difficulty Level
                                            </div>
                                        </label>
                                        <select
                                            name="difficulty"
                                            value={courseData.difficulty}
                                            onChange={handleCourseInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} />
                                                Duration (Hours)
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="durationHours"
                                            value={courseData.durationHours}
                                            onChange={handleCourseInputChange}
                                            min="0"
                                            step="0.5"
                                            placeholder="e.g., 10"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} />
                                                Price (₹)
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={courseData.price}
                                            onChange={handleCourseInputChange}
                                            min="0"
                                            placeholder="e.g., 2999"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                        <BookOpen size={20} />
                                        Course Summary
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
                                        <div>
                                            <span className="font-medium">Duration:</span> {courseData.durationHours} hours
                                        </div>
                                        <div>
                                            <span className="font-medium">Price:</span> ₹{courseData.price}
                                        </div>
                                        <div>
                                            <span className="font-medium">Level:</span> {courseData.difficulty}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between gap-3 pt-6 border-t">
                                    <button
                                        onClick={() => setActiveStep('basic')}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setActiveStep('videos')}
                                        className="px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
                                    >
                                        Next: Add Videos
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Videos Step */}
                        {activeStep === 'videos' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Course asdfVideos</h2>
                                    <button
                                        onClick={() => {
                                            setShowVideoForm(true);
                                            setEditingVideoIndex(null);
                                            setVideoFormData({
                                                title: "",
                                                description: "",
                                                videoUrl: "",
                                                duration: 0,
                                                order: videos.length + 1,
                                                thumbnailUrl: "",
                                                isActive: true,
                                            });
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
                                    >
                                        <Plus size={20} />
                                        Add Video
                                    </button>
                                </div>

                                {/* Video Form Modal */}
                                {showVideoForm && (
                                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                            <div className="sticky top-0 bg-gradient-to-r from-primary-navy to-primary-navy-light text-white px-6 py-4 flex items-center justify-between">
                                                <h3 className="text-xl font-bold">
                                                    {editingVideoIndex !== null ? 'Edit Video' : 'Add New Video'}
                                                </h3>
                                                <button
                                                    onClick={() => {
                                                        setShowVideoForm(false);
                                                        setEditingVideoIndex(null);
                                                    }}
                                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                                >
                                                    <X size={24} />
                                                </button>
                                            </div>

                                            <div className="p-6 space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Video Title <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={videoFormData.title}
                                                        onChange={handleVideoInputChange}
                                                        placeholder="e.g., Introduction to React"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        name="description"
                                                        value={videoFormData.description}
                                                        onChange={handleVideoInputChange}
                                                        rows={3}
                                                        placeholder="Brief description of the video content..."
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent resize-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Video URL <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="url"
                                                            name="videoUrl"
                                                            value={videoFormData.videoUrl}
                                                            onChange={handleVideoInputChange}
                                                            placeholder="https://www.youtube.com/watch?v=... or upload a file"
                                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowUploadModal(true)}
                                                            className="px-4 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors flex items-center gap-2"
                                                        >
                                                            <Upload size={20} />
                                                            <span className="hidden sm:inline">Upload</span>
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Paste a YouTube/Vimeo URL or upload your own video file
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Duration (seconds)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="duration"
                                                            value={videoFormData.duration}
                                                            onChange={handleVideoInputChange}
                                                            min="0"
                                                            placeholder="e.g., 1200"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                            Order
                                                        </label>
                                                        <input
                                                            type="number"
                                                            name="order"
                                                            value={videoFormData.order}
                                                            onChange={handleVideoInputChange}
                                                            min="1"
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Thumbnail URL
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="url"
                                                            name="thumbnailUrl"
                                                            value={videoFormData.thumbnailUrl}
                                                            onChange={handleVideoInputChange}
                                                            placeholder="https://example.com/thumbnail.jpg"
                                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                                        />
                                                        <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                            <ImageIcon size={20} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={videoFormData.isActive}
                                                            onChange={(e) => setVideoFormData({ ...videoFormData, isActive: e.target.checked })}
                                                            className="w-5 h-5 text-primary-navy rounded focus:ring-2 focus:ring-primary-navy"
                                                        />
                                                        <span className="text-sm font-semibold text-gray-700">Published</span>
                                                    </label>
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4 border-t">
                                                    <button
                                                        onClick={() => {
                                                            setShowVideoForm(false);
                                                            setEditingVideoIndex(null);
                                                        }}
                                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleAddVideo}
                                                        className="px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
                                                    >
                                                        {editingVideoIndex !== null ? 'Update Video' : 'Add Video'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Videos List */}
                                {videos.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <Video className="mx-auto text-gray-400 mb-4" size={48} />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos added yet</h3>
                                        <p className="text-gray-600 mb-4">Start by adding your first video to the course</p>
                                        <button
                                            onClick={() => setShowVideoForm(true)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
                                        >
                                            <Plus size={20} />
                                            Add First Video
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {videos.map((video, index) => (
                                            <div
                                                key={index}
                                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => handleReorderVideo(index, 'up')}
                                                            disabled={index === 0}
                                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <GripVertical size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReorderVideo(index, 'down')}
                                                            disabled={index === videos.length - 1}
                                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <GripVertical size={20} />
                                                        </button>
                                                    </div>

                                                    <div className="w-16 h-16 bg-gradient-to-br from-primary-navy to-primary-navy-light rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                                        {video.thumbnailUrl ? (
                                                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover rounded-lg" />
                                                        ) : (
                                                            <Play size={24} />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                                    {video.order}. {video.title}
                                                                </h4>
                                                                {video.description && (
                                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{video.description}</p>
                                                                )}
                                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock size={14} />
                                                                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                                                    </span>
                                                                    <span className={`px-2 py-0.5 rounded-full ${video.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                        {video.isActive ? 'Published' : 'Draft'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleEditVideo(index)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                >
                                                                    <FileText size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteVideo(index)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-between gap-3 pt-6 border-t">
                                    <button
                                        onClick={() => setActiveStep('details')}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setActiveStep('preview')}
                                        className="px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
                                    >
                                        Next: Preview
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Preview Step */}
                        {activeStep === 'preview' && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Preview</h2>

                                <div className="bg-gradient-to-br from-primary-navy to-primary-navy-dark text-white rounded-xl p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <h3 className="text-3xl font-bold">{courseData.title || 'Course Title'}</h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${courseData.isActive ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                                            {courseData.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-white/90 text-lg mb-6">{courseData.description || 'Course description will appear here'}</p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                            <p className="text-white/70 text-sm mb-1">Instructor</p>
                                            <p className="font-semibold">{courseData.instructor || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                            <p className="text-white/70 text-sm mb-1">Duration</p>
                                            <p className="font-semibold">{courseData.durationHours} hours</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                            <p className="text-white/70 text-sm mb-1">Price</p>
                                            <p className="font-semibold">₹{courseData.price}</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                            <p className="text-white/70 text-sm mb-1">Level</p>
                                            <p className="font-semibold capitalize">{courseData.difficulty}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Video size={20} className="text-primary-navy" />
                                        Course Content ({videos.length} videos)
                                    </h4>
                                    {videos.length === 0 ? (
                                        <p className="text-gray-600 text-center py-4">No videos added yet</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {videos.map((video, index) => (
                                                <div key={index} className="bg-white rounded-lg p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-primary-navy/10 rounded-lg flex items-center justify-center text-primary-navy font-bold">
                                                            {video.order}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{video.title}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${video.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {video.isActive ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between gap-3 pt-6 border-t">
                                    <button
                                        onClick={() => setActiveStep('videos')}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleSaveCourse}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={20} />
                                        {saving ? 'Saving...' : (isEditMode ? 'Update Course' : 'Create Course')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Video Upload Modal */}
            <VideoUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUploadComplete={(videoUrl) => {
                    setVideoFormData({ ...videoFormData, videoUrl });
                    setShowUploadModal(false);
                }}
            />
        </div>
    );
};

export default CourseForm;
