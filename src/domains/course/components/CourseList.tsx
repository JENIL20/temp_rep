import React, { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Course } from "../types/course.types";
import CourseCard from "./CourseCard";
import { LoadingSpinner } from "../../../shared/components/common";

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
    className = ""
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

    const handlePageChange = (page: number) => {
        onPageChange(page);
        const listElement = document.getElementById('course-list-top');
        if (listElement) {
            listElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedDifficulty !== "all" || selectedStatus !== "all";

    return (
        <div className={`space-y-6 ${className}`} id="course-list-top">
            {/* Controls Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2 min-w-[200px]">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {/* Simple Page Numbers */}
                            <div className="flex gap-1 overflow-x-auto max-w-[200px] md:max-w-none">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-colors flex-shrink-0 ${currentPage === page
                                            ? "bg-primary-navy text-white shadow-md"
                                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CourseList;
