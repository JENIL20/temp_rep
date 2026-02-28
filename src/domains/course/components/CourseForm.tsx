import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courseApi, courseVideoApi, CourseVideoRequest } from "../api/courseApi";
import { categoryApi } from "../../category/api/categoryApi";
import {
    ArrowLeft, Save, Plus, Trash2, Upload, Video, FileText, Settings,
    X, GripVertical, Clock, DollarSign, Award, BookOpen,
    Play, Tag, HardDrive
} from "lucide-react";
import { toast } from "react-toastify";
import { confirmToast } from "@/shared/utils/confirmToast";

interface VideoFormData {
    id?: number;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
    thumbnailUrl: string;
    isActive: boolean;
    file?: File;
}

const CourseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

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
        lectures: 0,
        materials: "",
        tags: "",
        imageFile: undefined as File | undefined,
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

    // Categories for dropdown
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

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
            const courseRes: any = await courseApi.getById(courseId);
            setCourseData({
                ...courseRes,
                title: courseRes.title || "",
                description: courseRes.description || "",
                instructor: courseRes.instructor || "",
                difficulty: courseRes.difficulty || "beginner",
                durationHours: courseRes.durationHours || 0,
                price: courseRes.price || 0,
                categoryId: courseRes.categoryId || 1,
                thumbnailUrl: courseRes.thumbnailUrl || "",
                isActive: courseRes.isActive ?? true,
                lectures: courseRes.lectures || 0,
                materials: courseRes.materials || "",
                tags: courseRes.tags || "",
            });

            const videosRes = await courseVideoApi.listByCourse(courseId);
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
            if (categoryList.length > 0 && !isEditMode) {
                setCourseData(prev => ({ ...prev, categoryId: Number(categoryList[0].id) }));
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === "categoryId" || name === "lectures") {
            setCourseData({ ...courseData, [name]: parseInt(value) || 0 });
        } else if (type === "number") {
            setCourseData({ ...courseData, [name]: parseFloat(value) || 0 });
        } else {
            setCourseData({ ...courseData, [name]: value });
        }
    };

    const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setVideoFormData({
            ...videoFormData,
            [name]: type === 'number' ? parseFloat(value) : value,
        });
    };

    const handleAddVideo = () => {
        if (!videoFormData.title || (!videoFormData.videoUrl && !videoFormData.file)) {
            toast.error("Please provide a video title and either a URL or upload a file");
            return;
        }

        if (editingVideoIndex !== null) {
            const updatedVideos = [...videos];
            updatedVideos[editingVideoIndex] = videoFormData;
            setVideos(updatedVideos);
            setEditingVideoIndex(null);
        } else {
            setVideos([...videos, { ...videoFormData, order: videos.length + 1 }]);
        }

        setVideoFormData({
            title: "",
            description: "",
            videoUrl: "",
            duration: 0,
            order: videos.length + 2,
            thumbnailUrl: "",
            isActive: true,
            file: undefined
        });
        setShowVideoForm(false);
    };

    const handleEditVideo = (index: number) => {
        setVideoFormData(videos[index]);
        setEditingVideoIndex(index);
        setShowVideoForm(true);
    };

    const handleDeleteVideo = (index: number) => {
        confirmToast({
            title: "Delete video?",
            message: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            toastOptions: { type: "warning" },
        }).then((ok) => {
            if (!ok) return;
            setVideos(videos.filter((_, i) => i !== index));
            toast.info("Video removed");
        });
    };

    const handleReorderVideo = (index: number, direction: 'up' | 'down') => {
        const newVideos = [...videos];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newVideos.length) return;

        [newVideos[index], newVideos[targetIndex]] = [newVideos[targetIndex], newVideos[index]];
        newVideos.forEach((video, idx) => { video.order = idx + 1; });
        setVideos(newVideos);
    };

    const handleSaveCourse = async () => {
        if (!courseData.title || !courseData.description || !courseData.categoryId) {
            toast.error("Please fill in all required fields (Title, Description, Category)");
            return;
        }

        setSaving(true);
        try {
            let courseId = id ? parseInt(id) : null;

            const formData = new FormData();
            formData.append('Title', courseData.title);
            formData.append('Description', courseData.description);
            formData.append('CategoryId', courseData.categoryId.toString());
            formData.append('Instructor', courseData.instructor);
            formData.append('Difficulty', courseData.difficulty);
            formData.append('DurationHours', courseData.durationHours.toString());
            formData.append('Price', courseData.price.toString());
            formData.append('Lectures', courseData.lectures.toString());
            formData.append('Materials', courseData.materials);
            formData.append('Tags', courseData.tags);
            formData.append('IsActive', String(courseData.isActive));

            if (courseData.imageFile) {
                formData.append('ImageFile', courseData.imageFile);
            }

            if (isEditMode && courseId) {
                await courseApi.update(courseId, formData);
            } else {
                const res: any = await courseApi.create(formData);
                courseId = res.id || res.courseId || res.data?.id || res.data?.courseId;
            }

            if (videos.length > 0 && courseId) {
                for (const video of videos) {
                    const videoData: CourseVideoRequest = {
                        courseId: courseId,
                        title: video.title,
                        description: video.description || '',
                        videoUrl: video.videoUrl,
                        duration: video.duration || 0,
                        orderIndex: video.order,
                        thumbnailUrl: video.thumbnailUrl || '',
                        isPreview: video.isActive,
                        file: video.file
                    };

                    if (video.id) {
                        await courseVideoApi.update(video.id, videoData);
                    } else {
                        await courseVideoApi.create(videoData);
                    }
                }
            }

            toast.success(`Course ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/courses');
        } catch (error) {
            console.error("Failed to save course:", error);
            toast.error(`Failed to ${isEditMode ? 'update' : 'create'} course. Please check the console for details.`);
        } finally {
            setSaving(false);
        }
    };

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

            {/* Form Content */}
            <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
                {/* Basic Info Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FileText className="text-primary-navy" /> Basic Information
                    </h2>

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

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Course Thumbnail (Image File)
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border border-gray-300 w-full">
                                    <Upload size={20} className="mr-2" />
                                    <span>{courseData.imageFile ? courseData.imageFile.name : 'Upload Image'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setCourseData(prev => ({ ...prev, imageFile: e.target.files![0] }));
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            {courseData.thumbnailUrl && !courseData.imageFile && (
                                <p className="text-sm text-gray-500 mt-2">Current image URL: {courseData.thumbnailUrl}</p>
                            )}
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
                </div>

                {/* Details Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Settings className="text-primary-navy" /> Course Details & Metadata
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
                                <div className="flex items-center gap-2"><Award size={16} /> Difficulty Level</div>
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
                                <div className="flex items-center gap-2"><Clock size={16} /> Duration (Hours)</div>
                            </label>
                            <input
                                type="number"
                                name="durationHours"
                                value={courseData.durationHours}
                                onChange={handleCourseInputChange}
                                min="0" step="0.5" placeholder="e.g., 10"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
                                <div className="flex items-center gap-2"><DollarSign size={16} /> Price (₹)</div>
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={courseData.price}
                                onChange={handleCourseInputChange}
                                min="0" placeholder="e.g., 2999"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
                                <div className="flex items-center gap-2"><HardDrive size={16} /> Total Lectures</div>
                            </label>
                            <input
                                type="number"
                                name="lectures"
                                value={courseData.lectures}
                                onChange={handleCourseInputChange}
                                min="0" placeholder="e.g., 25"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
                                <div className="flex items-center gap-2"><Tag size={16} /> Tags</div>
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={courseData.tags}
                                onChange={handleCourseInputChange}
                                placeholder="Comma separated tags e.g., React, Frontend, Web"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
                                <div className="flex items-center gap-2"><BookOpen size={16} /> Materials</div>
                            </label>
                            <textarea
                                name="materials"
                                value={courseData.materials}
                                onChange={handleCourseInputChange}
                                rows={2}
                                placeholder="List of materials required for this course..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Videos Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-8 animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Video className="text-primary-navy" /> Course Videos
                        </h2>
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
                                    file: undefined
                                });
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
                        >
                            <Plus size={20} /> Add Video
                        </button>
                    </div>

                    {showVideoForm && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="sticky top-0 bg-gradient-to-r from-primary-navy to-primary-navy-light text-white px-6 py-4 flex items-center justify-between">
                                    <h3 className="text-xl font-bold">{editingVideoIndex !== null ? 'Edit Video' : 'Add New Video'}</h3>
                                    <button onClick={() => { setShowVideoForm(false); setEditingVideoIndex(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Video Title <span className="text-red-500">*</span></label>
                                        <input type="text" name="title" value={videoFormData.title} onChange={handleVideoInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                        <textarea name="description" value={videoFormData.description} onChange={handleVideoInputChange} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Video Source <span className="text-red-500">*</span></label>
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <input type="url" name="videoUrl" value={videoFormData.videoUrl} onChange={handleVideoInputChange} placeholder="URL" disabled={!!videoFormData.file} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent ${videoFormData.file ? 'bg-gray-100 text-gray-400' : 'border-gray-300'}`} />
                                            </div>
                                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center group cursor-pointer" onClick={() => document.getElementById('video-upload-input')?.click()}>
                                                <input id="video-upload-input" type="file" accept="video/*" className="hidden" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setVideoFormData({ ...videoFormData, file: file, videoUrl: '', title: videoFormData.title || file.name.replace(/\.[^/.]+$/, "") });
                                                }} />
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`p-3 rounded-full ${videoFormData.file ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform'}`}>
                                                        {videoFormData.file ? <Video size={24} /> : <Upload size={24} />}
                                                    </div>
                                                    {videoFormData.file ? (
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{videoFormData.file.name}</p>
                                                            <button onClick={(e) => { e.stopPropagation(); setVideoFormData({ ...videoFormData, file: undefined }); }} className="text-xs text-red-500 hover:underline mt-2">Remove file</button>
                                                        </div>
                                                    ) : (
                                                        <div><p className="font-medium text-gray-700">Click to upload video file</p></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (secs)</label>
                                            <input type="number" name="duration" value={videoFormData.duration} onChange={handleVideoInputChange} min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Order</label>
                                            <input type="number" name="order" value={videoFormData.order} onChange={handleVideoInputChange} min="1" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <button onClick={() => { setShowVideoForm(false); setEditingVideoIndex(null); }} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                        <button onClick={handleAddVideo} className="px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors">{editingVideoIndex !== null ? 'Update' : 'Add'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {videos.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <Video className="mx-auto text-gray-400 mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos added yet</h3>
                            <button onClick={() => setShowVideoForm(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors mt-4">
                                <Plus size={20} /> Add First Video
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {videos.map((video, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col gap-2">
                                            <button onClick={() => handleReorderVideo(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"><GripVertical size={20} /></button>
                                            <button onClick={() => handleReorderVideo(index, 'down')} disabled={index === videos.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"><GripVertical size={20} /></button>
                                        </div>
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary-navy to-primary-navy-light rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                            {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover rounded-lg" /> : <Play size={24} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-1">{video.order}. {video.title}</h4>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className={`px-2 py-0.5 rounded-full ${video.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{video.isActive ? 'Published' : 'Draft'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleEditVideo(index)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FileText size={18} /></button>
                                                    <button onClick={() => handleDeleteVideo(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Save Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-6 flex justify-end gap-4 static bottom-0 sticky-container">
                    <button
                        onClick={() => navigate('/courses')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveCourse}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : (isEditMode ? 'Update Course' : 'Create Course')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseForm;
