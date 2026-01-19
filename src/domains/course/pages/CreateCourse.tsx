import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courseApi } from "../api/courseApi";
import {
    ArrowLeft,
    Save,
    BookOpen,
    Clock,
    DollarSign,
    Award,
    Upload,
    Check,
    ChevronRight
} from "lucide-react";
import { categoryApi } from "@/domains/category/api/categoryApi";

interface CourseFormData {
    title: string;
    description: string;
    instructor: string;
    difficulty: string;
    durationHours: number;
    price: number;
    categoryId: number;
    thumbnailUrl: string;
    isActive: boolean;
}

const CreateCourse = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [courseData, setCourseData] = useState<CourseFormData>({
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

    const [categories, setCategories] = useState<{ id: number; categoryName: string }[]>([]);

    useEffect(() => {
        if (isEditMode && id) {
            categoryApi.list();
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
        } catch (error) {
            console.error("Failed to fetch course data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const categories = await categoryApi.list();
            console.log("fetched categories =", categories);
            setCategories(categories?.items);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setCourseData({
            ...courseData,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        });
    };

    const validateStep1 = () => {
        if (!courseData.title.trim()) {
            alert("Please enter a course title");
            return false;
        }
        if (!courseData.description.trim()) {
            alert("Please enter a course description");
            return false;
        }
        if (!courseData.instructor.trim()) {
            alert("Please enter an instructor name");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (courseData.durationHours <= 0) {
            alert("Please enter a valid duration");
            return false;
        }
        if (courseData.price < 0) {
            alert("Please enter a valid price");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        setCurrentStep(currentStep + 1);
    };

    const handleSaveCourse = async () => {
        if (!validateStep1() || !validateStep2()) return;

        setSaving(true);
        try {
            let courseId = id ? parseInt(id) : null;

            if (isEditMode && courseId) {
                await courseApi.update(courseId, courseData);
                alert("Course updated successfully!");
                navigate(`/courses/${courseId}/videos`);
            } else {
                console.log("Creating course with data =", courseData);
                // return
                const res = await courseApi.create(courseData);
                console.log("Create course response =", res);
                courseId = res[0]?.courseId || res?.courseId;
                alert("Course created successfully! Now add videos to your course.");
                navigate(`/courses/${courseId}/videos`);
            }
        } catch (error) {
            console.error("Failed to save course:", error);
            alert(`Failed to ${isEditMode ? 'update' : 'create'} course. Please try again.`);
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
                <div className="max-w-4xl mx-auto px-6 py-8">
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
                        {isEditMode ? 'Update your course information' : 'Set up your course details, then add videos'}
                    </p>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="max-w-4xl mx-auto px-6 -mt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        {[
                            { num: 1, label: "Basic Info" },
                            { num: 2, label: "Details" },
                            { num: 3, label: "Review" }
                        ].map((step, index) => (
                            <div key={step.num} className="flex items-center flex-1">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep > step.num
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.num
                                            ? 'bg-primary-navy text-white shadow-lg'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {currentStep > step.num ? <Check size={20} /> : step.num}
                                    </div>
                                    <span className={`font-medium hidden md:inline ${currentStep >= step.num ? 'text-gray-900' : 'text-gray-500'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < 2 && (
                                    <div className={`flex-1 h-1 mx-4 ${currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-6 mt-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                                    <p className="text-gray-600">Let's start with the essential details about your course</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Course Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={courseData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Complete Web Development Bootcamp"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={courseData.description}
                                            onChange={handleInputChange}
                                            rows={6}
                                            placeholder="Provide a detailed description of what students will learn in this course..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent resize-none transition-all"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Instructor Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="instructor"
                                                value={courseData.instructor}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Dr. Sarah Johnson"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Category <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="categoryId"
                                                value={courseData.categoryId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                                                ))}
                                            </select>
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
                                                value={courseData.thumbnailUrl}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com/image.jpg"
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                                            />
                                            <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                <Upload size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Course Details */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Details</h2>
                                    <p className="text-gray-600">Configure pricing, duration, and difficulty level</p>
                                </div>

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
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
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
                                                Duration (Hours) <span className="text-red-500">*</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="durationHours"
                                            value={courseData.durationHours}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.5"
                                            placeholder="e.g., 10"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} />
                                                Price (₹) <span className="text-red-500">*</span>
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={courseData.price}
                                            onChange={handleInputChange}
                                            min="0"
                                            placeholder="e.g., 2999"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={courseData.isActive}
                                                onChange={(e) => setCourseData({ ...courseData, isActive: e.target.checked })}
                                                className="w-5 h-5 text-primary-navy rounded focus:ring-2 focus:ring-primary-navy"
                                            />
                                            <div>
                                                <span className="text-sm font-semibold text-gray-700 block">Active Course</span>
                                                <span className="text-xs text-gray-500">Make this course visible to students</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
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
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Confirm</h2>
                                    <p className="text-gray-600">Please review your course details before saving</p>
                                </div>

                                <div className="bg-gradient-to-br from-primary-navy to-primary-navy-dark text-white rounded-xl p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <h3 className="text-3xl font-bold">{courseData.title || 'Course Title'}</h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${courseData.isActive ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
                                            }`}>
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

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                        <ChevronRight size={20} />
                                        Next Steps
                                    </h4>
                                    <p className="text-amber-800 text-sm">
                                        After saving this course, you'll be redirected to add videos and course content.
                                        You can manage videos separately in the course videos section.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between gap-3 pt-6 border-t mt-8">
                            <button
                                onClick={() => {
                                    if (currentStep === 1) {
                                        navigate('/courses');
                                    } else {
                                        setCurrentStep(currentStep - 1);
                                    }
                                }}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {currentStep === 1 ? 'Cancel' : 'Previous'}
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSaveCourse}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={20} />
                                    {saving ? 'Saving...' : (isEditMode ? 'Update & Continue' : 'Create & Add Videos')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
