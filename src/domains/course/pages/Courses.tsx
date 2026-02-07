import { useEffect, useState, useCallback } from "react";
import { courseApi } from "../api/courseApi";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Course } from "../types/course.types";
import CourseList from "../components/CourseList";

const Courses = () => {
  const navigate = useNavigate();

  // Data State
  const [categories, setCategories] = useState<{ id: number; categoryName: string }[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Pagination & Search State
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "rating">("newest");

  // UI State
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  // Grid Configuration
  const [gridConfig, setGridConfig] = useState({
    columns: 3,
    rows: 2
  });

  const handleGridChange = (newConfig: { columns: number; rows: number }) => {
    setGridConfig(newConfig);
    setPageSize(newConfig.columns * newConfig.rows);
    setPageNumber(1);
  };

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await courseApi.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch courses whenever dependencies change
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await courseApi.list({
          searchTerm,
          pageNumber,
          pageSize,
          categoryId: selectedCategory === "all" ? undefined : selectedCategory,
          difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
          status: selectedStatus === "all" ? undefined : selectedStatus,
          sortBy
        });

        console.log("Courses API Response for page:", pageNumber, response);

        setCourses(response.items);
        setTotalCount(response.totalCount);
        setTotalPages(response.totalPages);
        setUsingSampleData(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load courses";
        console.error("Failed to load courses:", err);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchTerm, pageNumber, pageSize, selectedCategory, selectedDifficulty, selectedStatus, sortBy]);

  // Handlers - Memoized to prevent re-renders triggering effects in children
  const handlePageChange = useCallback((newPage: number) => {
    console.log("🔄 Page change requested:", newPage);
    setPageNumber(newPage);
  }, []);

  const handleSearch = useCallback((term: string) => {
    console.log("🔍 Search requested:", term);
    setSearchTerm(term);
    setPageNumber(1);
  }, []);

  const handleCategoryChange = useCallback((category: number | "all") => {
    setSelectedCategory(category);
    setPageNumber(1);
  }, []);

  const handleDifficultyChange = useCallback((difficulty: string | "all") => {
    setSelectedDifficulty(difficulty);
    setPageNumber(1);
  }, []);

  const handleStatusChange = useCallback((status: "all" | "active" | "inactive") => {
    setSelectedStatus(status);
    setPageNumber(1);
  }, []);

  const handleSortChange = useCallback((sort: "newest" | "price-low" | "price-high" | "rating") => {
    setSortBy(sort);
    setPageNumber(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSelectedStatus("all");
    setPageNumber(1);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("📊 Current state:", { pageNumber, pageSize, searchTerm, selectedCategory });
  }, [pageNumber, pageSize, searchTerm, selectedCategory]);

  return (
    <div className="p-5 max-w-7xl mx-auto">
      {/* Sample Data Banner */}
      {usingSampleData && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg mb-4 text-center animate-fade-in">
          <p className="text-sm font-medium">
            ⚠️ API is not available. Displaying sample data for demonstration purposes.
          </p>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary-navy">Courses</h1>
          <p className="text-gray-600 mt-1">Manage and organize your educational content</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Showing {courses.length} of {totalCount} courses
          </p>
        </div>

        <button
          onClick={() => navigate('/courses/create')}
          className="flex items-center gap-2 bg-primary-navy text-white px-4 py-2.5 rounded-lg font-medium shadow-lg hover:bg-primary-navy-light hover:shadow-xl transition-all active:scale-95"
        >
          <PlusCircle size={20} />
          Create New Course
        </button>
      </div>

      {/* Course Listing Component */}
      <CourseList
        courses={courses}
        categories={categories}
        isLoading={loading}
        totalCount={totalCount}
        currentPage={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        gridConfig={gridConfig}
        onGridChange={handleGridChange}

        // Filter Props
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={handleDifficultyChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
};

export default Courses;