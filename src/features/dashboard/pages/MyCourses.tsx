import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userCourseApi } from '../../../api/userCourseApi';
import { EnrolledCourse } from '../../../types/enrollment.types';
import { BookOpen, Clock, TrendingUp, Award, Calendar, PlayCircle } from 'lucide-react';

const MyCourses: React.FC = () => {
    const [courses, setCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            setLoading(true);
            const data = await userCourseApi.getMyCourses();
            setCourses(data);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching enrolled courses:', err);
            setError(err.response?.data?.message || 'Failed to load your courses');
            // Use sample data as fallback
            setCourses(getSampleCourses());
        } finally {
            setLoading(false);
        }
    };

    const getSampleCourses = (): EnrolledCourse[] => [
        {
            id: 1,
            courseId: 1,
            userId: 1,
            enrolledAt: '2024-01-15T10:00:00Z',
            progress: 65,
            status: 'Active',
            course: {
                id: 1,
                title: 'Complete Web Development Bootcamp',
                description: 'Master modern web development from scratch',
                instructor: 'Dr. Sarah Johnson',
                thumbnailUrl: '',
                difficulty: 'Intermediate',
                durationHours: 40,
                price: 99.99,
                rating: 4.8,
            },
        },
        {
            id: 2,
            courseId: 2,
            userId: 1,
            enrolledAt: '2024-02-01T10:00:00Z',
            completedAt: '2024-03-15T10:00:00Z',
            progress: 100,
            status: 'Completed',
            course: {
                id: 2,
                title: 'Python for Data Science',
                description: 'Learn Python programming for data analysis',
                instructor: 'Prof. Michael Chen',
                thumbnailUrl: '',
                difficulty: 'Beginner',
                durationHours: 25,
                price: 79.99,
                rating: 4.9,
            },
        },
        {
            id: 3,
            courseId: 3,
            userId: 1,
            enrolledAt: '2024-03-10T10:00:00Z',
            progress: 30,
            status: 'Active',
            course: {
                id: 3,
                title: 'Advanced React Patterns',
                description: 'Deep dive into React best practices',
                instructor: 'Emily Rodriguez',
                thumbnailUrl: '',
                difficulty: 'Advanced',
                durationHours: 30,
                price: 129.99,
                rating: 4.7,
            },
        },
    ];

    const filteredCourses = courses.filter((enrollment) => {
        if (filter === 'all') return true;
        if (filter === 'active') return enrollment.status === 'Active';
        if (filter === 'completed') return enrollment.status === 'Completed';
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-blue-100 text-blue-800';
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'Dropped':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner':
                return 'text-green-600';
            case 'intermediate':
                return 'text-yellow-600';
            case 'advanced':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">My Learning Journey</h1>
                            <p className="text-gray-200">Track your progress and continue learning</p>
                        </div>
                        <div className="hidden md:block">
                            <BookOpen className="w-20 h-20 opacity-20" />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-8 h-8" />
                                <div>
                                    <p className="text-sm text-gray-200">Total Courses</p>
                                    <p className="text-2xl font-bold">{courses.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-8 h-8" />
                                <div>
                                    <p className="text-sm text-gray-200">In Progress</p>
                                    <p className="text-2xl font-bold">
                                        {courses.filter((c) => c.status === 'Active').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Award className="w-8 h-8" />
                                <div>
                                    <p className="text-sm text-gray-200">Completed</p>
                                    <p className="text-2xl font-bold">
                                        {courses.filter((c) => c.status === 'Completed').length}
                                    </p>
                                </div>
                            </div>
                        </div>
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

            {/* Filter Tabs */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="bg-white rounded-lg shadow-md p-2 inline-flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${filter === 'all'
                                ? 'bg-primary-navy text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        All Courses
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${filter === 'active'
                                ? 'bg-primary-navy text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        In Progress
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${filter === 'completed'
                                ? 'bg-primary-navy text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="max-w-7xl mx-auto">
                {filteredCourses.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No courses found
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'all'
                                ? "You haven't enrolled in any courses yet"
                                : `No ${filter} courses found`}
                        </p>
                        <Link
                            to="/courses"
                            className="inline-block bg-primary-navy text-white px-6 py-3 rounded-lg hover:bg-primary-navy-dark transition-colors"
                        >
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((enrollment) => (
                            <div
                                key={enrollment.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {/* Thumbnail */}
                                <div className="relative h-48 bg-gradient-to-br from-primary-navy to-primary-navy-light">
                                    {enrollment.course.thumbnailUrl ? (
                                        <img
                                            src={enrollment.course.thumbnailUrl}
                                            alt={enrollment.course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <BookOpen className="w-16 h-16 text-white opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                enrollment.status
                                            )}`}
                                        >
                                            {enrollment.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                        {enrollment.course.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {enrollment.course.description}
                                    </p>

                                    {/* Instructor & Difficulty */}
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm text-gray-600">
                                            {enrollment.course.instructor}
                                        </p>
                                        <span
                                            className={`text-sm font-semibold ${getDifficultyColor(
                                                enrollment.course.difficulty
                                            )}`}
                                        >
                                            {enrollment.course.difficulty}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Progress
                                            </span>
                                            <span className="text-sm font-bold text-primary-navy">
                                                {enrollment.progress}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-secondary-gold to-secondary-gold-light h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${enrollment.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{enrollment.course.durationHours}h</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(enrollment.enrolledAt)}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link
                                        to={`/courses/${enrollment.courseId}`}
                                        className="block w-full bg-primary-navy text-white text-center py-3 rounded-lg hover:bg-primary-navy-dark transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <PlayCircle className="w-5 h-5" />
                                        {enrollment.status === 'Completed' ? 'Review Course' : 'Continue Learning'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
