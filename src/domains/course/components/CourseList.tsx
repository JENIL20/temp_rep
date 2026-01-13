import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { Search, Filter, ArrowUpDown, LayoutGrid } from "lucide-react";
=======
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
import { Course } from "../types/course.types";
import CourseCard from "./CourseCard";
import { LoadingSpinner, Pagination } from "../../../shared/components/common";

interface Category {
    id: number;
    categoryName: string;
}

interface CourseListProps {
    courses: Course[];
    categories: Category[];
    isLoading: boolean;
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSearch: (term: string) => void;
    emptyMessage?: string;
    className?: string;
    gridConfig?: { columns: number; rows: number };
    onGridChange?: (config: { columns: number; rows: number }) => void;
}

const CourseList: React.FC<CourseListProps> = ({
    courses,
    categories,
    isLoading,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    onPageChange,
    onSearch,
    emptyMessage = "Try adjusting your search or filters",
    className = "",
    gridConfig,
    onGridChange
}) => {
    // UI Local State for immediate feedback
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | "all">("all");
    const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
    const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "rating">("newest");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, onSearch]);
<<<<<<< HEAD
=======

    const handlePageChange = (page: number) => {
        onPageChange(page);
        const listElement = document.getElementById('course-list-top');
        if (listElement) {
            listElement.scrollIntoView({ behavior: 'smooth' });
        }
    };
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093

    const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedDifficulty !== "all" || selectedStatus !== "all";

    // Dynamic Grid Class
    const getGridClass = () => {
        if (!gridConfig) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

        switch (gridConfig.columns) {
            case 1: return "grid-cols-1";
            case 2: return "grid-cols-1 sm:grid-cols-2";
            case 3: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
            case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
            case 5: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
            default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
        }
    };

    return (
        <div className={`space-y-6 ${className}`} id="course-list-top">
            {/* Controls Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col xl:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Sort */}
                        <div className="flex items-center gap-2 min-w-[200px] flex-1">
                            <ArrowUpDown size={18} className="text-gray-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as "newest" | "price-low" | "price-high" | "rating")}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent outline-none cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>

                        {/* Grid Settings */}
                        {gridConfig && onGridChange && (
                            <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <LayoutGrid size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">Grid:</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-500 font-medium">Cols:</label>
                                    <select
                                        value={gridConfig.columns}
                                        onChange={(e) => onGridChange({ ...gridConfig, columns: Number(e.target.value) })}
                                        className="text-sm bg-white border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-primary-navy/20 outline-none cursor-pointer"
                                    >
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                        <option value={4}>4</option>
                                    </select>
                                </div>

                                <div className="h-4 w-px bg-gray-300"></div>

                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-500 font-medium">Rows:</label>
                                    <select
                                        value={gridConfig.rows}
                                        onChange={(e) => onGridChange({ ...gridConfig, rows: Number(e.target.value) })}
                                        className="text-sm bg-white border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-primary-navy/20 outline-none cursor-pointer"
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
                        )}
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mr-2">
                        <Filter size={16} />
                        Filters:
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value === "all" ? "all" : Number(e.target.value))}
                        className="text-sm px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary-navy cursor-pointer"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                        ))}
                    </select>

                    <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="text-sm px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary-navy cursor-pointer"
                    >
                        <option value="all">All Difficulties</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as "all" | "active" | "inactive")}
                        className="text-sm px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary-navy cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {hasActiveFilters && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("all");
                                setSelectedDifficulty("all");
                                setSelectedStatus("all");
                            }}
                            className="text-sm text-red-600 hover:text-red-700 font-medium ml-auto"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Pagination Metadata */}
            <div className="flex items-center justify-between px-2 text-sm text-slate-500">
                <p>Showing <span className="font-bold text-slate-700">{courses.length}</span> results of <span className="font-bold text-slate-700">{totalCount}</span> total items</p>
                <p>Page <span className="font-bold text-slate-700">{currentPage}</span> of <span className="font-bold text-slate-700">{totalPages}</span> (Page Size: {pageSize})</p>
            </div>

            {/* Results Section */}
            {isLoading ? (
                <div className="py-12">
                    <LoadingSpinner variant="dots" size="lg" message="Loading courses..." />
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="text-gray-400 mb-4">
                        <Search size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No courses found</h3>
                    <p className="text-gray-500">{emptyMessage}</p>
                </div>
            ) : (
                <>
<<<<<<< HEAD
                    {/* Course Count Metadata */}
                    <div className="flex items-center justify-between px-2 text-sm text-slate-500">
                        <p>Showing <span className="font-bold text-slate-700">{courses.length}</span> of <span className="font-bold text-slate-700">{totalCount}</span> courses</p>
                    </div>

                    <div className={`grid gap-6 ${getGridClass()}`}>
                        {courses.map((course) => (
                            <CourseCard key={course.courseId} course={course} />
=======
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                            pageSize={pageSize}
                            onPageSizeChange={() => { }} // Page size is controlled by grid settings
                            showPageSizeOptions={false} // Hide standard page size selector in favor of grid settings
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default CourseList;
