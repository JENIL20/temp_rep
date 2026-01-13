import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userCourseApi } from '../../enrollment/api/userCourseApi';
import { EnrolledCourse } from '../../enrollment/types/enrollment.types';
import { BookOpen, Clock, TrendingUp, Award, Calendar, PlayCircle, LayoutGrid, Grid } from 'lucide-react';
import { Pagination } from '../../../shared/components/common';

const MyCourses: React.FC = () => {
    // Data State
    const [courses, setCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter & Pagination State
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [gridConfig, setGridConfig] = useState({ columns: 3, rows: 2 });
    const [pageSize, setPageSize] = useState(6); // Initial: 3 cols * 2 rows
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Update pageSize when grid changes
    useEffect(() => {
        const newPageSize = gridConfig.columns * gridConfig.rows;
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to page 1 on layout change
    }, [gridConfig]);

    useEffect(() => {
        fetchMyCourses();
    }, [currentPage, pageSize, filter]);

    const fetchMyCourses = async () => {
        try {
            setLoading(true);
            const response = await userCourseApi.getMyCourses({
                pageNumber: currentPage,
                pageSize: pageSize,
                status: filter
            });

            if ('items' in response) {
                setCourses(response.items);
                setTotalCount(response.totalCount);
                setTotalPages(response.totalPages);
            } else {
                // Fallback
                const items = response as EnrolledCourse[];
                setCourses(items);
                setTotalCount(items.length);
                setTotalPages(1);
            }
            setError(null);
        } catch (err: any) {
            console.error('Error fetching enrolled courses:', err);
            setError(err.response?.data?.message || 'Failed to load your courses');
        } finally {
            setLoading(false);
        }
    };

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

    const getGridClass = () => {
        switch (gridConfig.columns) {
            case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
            case 3: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
            case 2: return "grid-cols-1 sm:grid-cols-2";
            case 1: return "grid-cols-1";
            default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
        }
    };

    if (loading && currentPage === 1 && courses.length === 0) {
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
                                    <p className="text-2xl font-bold">{totalCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-8 h-8" />
                                <div>
                                    <p className="text-sm text-gray-200">Active</p>
                                    <p className="text-2xl font-bold">
                                        {/* Status counts are best fetched separately or inferred if all loaded. 
                                            Here we just show the count of current view if filtered, or maybe simplify.
                                            Let's just keep static labels or remove counts if we paginate. 
                                            Pagination makes total stats harder without separate API call. 
                                            I'll leave as placeholder or update if API supported stats. 
                                        */}
                                        -
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Award className="w-8 h-8" />
                                <div>
                                    <p className="text-sm text-gray-200">Completed</p>
                                    <p className="text-2xl font-bold">-</p>
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

            {/* Filter Tabs & Grid Controls */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div className="bg-white rounded-lg shadow-md p-2 inline-flex gap-2">
                    <button
                        onClick={() => { setFilter('all'); setCurrentPage(1); }}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${filter === 'all'
                            ? 'bg-primary-navy text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        All Courses
                    </button>
                    <button
                        onClick={() => { setFilter('active'); setCurrentPage(1); }}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${filter === 'active'
                            ? 'bg-primary-navy text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        In Progress
                    </button>
                    <button
                        onClick={() => { setFilter('completed'); setCurrentPage(1); }}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${filter === 'completed'
                            ? 'bg-primary-navy text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Completed
                    </button>
                </div>

                {/* Grid Settings */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-md">
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                        <div className="flex items-center px-2 py-1 bg-white rounded-md shadow-sm">
                            <LayoutGrid size={16} className="text-primary-navy mr-2" />
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-gray-700">Cols:</span>
                                <select
                                    value={gridConfig.columns}
                                    onChange={(e) => setGridConfig(prev => ({ ...prev, columns: Number(e.target.value) }))}
                                    className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer text-primary-navy p-0 outline-none"
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                </select>
                            </div>
                        </div>

                        <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>

                        <div className="flex items-center px-2 py-1 bg-white rounded-md shadow-sm">
                            <Grid size={16} className="text-primary-navy mr-2" />
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-gray-700">Rows:</span>
                                <select
                                    value={gridConfig.rows}
                                    onChange={(e) => setGridConfig(prev => ({ ...prev, rows: Number(e.target.value) }))}
                                    className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer text-primary-navy p-0 outline-none"
                                >
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                    <option value={6}>6</option>
                                    <option value={8}>8</option>
                                    <option value={10}>10</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="max-w-7xl mx-auto mb-8">
                {courses.length === 0 ? (
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
                    <>
                        <div className="flex items-center justify-between px-2 text-sm text-slate-500 mb-4">
                            <p>Showing <span className="font-bold text-slate-700">{courses.length}</span> of <span className="font-bold text-slate-700">{totalCount}</span> courses</p>
                        </div>
                        <div className={`grid gap-6 ${getGridClass()}`}>
                            {courses.map((enrollment) => (
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
                    </>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="max-w-7xl mx-auto">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    pageSize={pageSize}
                    onPageSizeChange={() => { }} // Page size controlled by grid
                    showPageSizeOptions={false}
                />
            </div>
        </div>
    );
};

export default MyCourses;
