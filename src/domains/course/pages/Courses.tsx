import { useCallback, useEffect, useState } from "react";
import { courseApi } from "../api/courseApi";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Course, CourseListRequest } from "../types/course.types";
import CourseList from "../components/CourseList";

const Courses = () => {
  const navigate = useNavigate();

  // Data State
  const [categories, setCategories] = useState<{ id: number; categoryName: string }[]>([]);

  // Pagination & Search State
  const [pageState, setPageState] = useState({
    items: [] as Course[],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 6,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

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
    setPageState(prev => ({
      ...prev,
      pageSize: newConfig.columns * newConfig.rows,
      pageNumber: 1 // Reset to first page when grid layout changes
    }));
  };

  const fetchCourses = useCallback(async (requestParams: CourseListRequest) => {
    setLoading(true);
    // console.log("Fetching courses from API with params:", requestParams);
    try {
      const response = await courseApi.list(requestParams);
      console.log("Courses API Response:", response);
      const categoriesData = await courseApi.getCategories();

      setPageState(prev => ({
        ...prev,
        items: response.items,
        totalCount: response.totalCount,
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalPages: response.pageNumber + 1
      }));
      setCategories(categoriesData);
      setUsingSampleData(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load courses";
      console.error("Failed to load courses:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for initial load and changes
  useEffect(() => {
    fetchCourses({
      searchTerm,
      pageNumber: pageState.pageNumber,
      pageSize: pageState.pageSize
    });
  }, [searchTerm, pageState.pageNumber, pageState.pageSize, fetchCourses]);

  const handlePageChange = (newPage: number) => {
    setPageState(prev => ({ ...prev, pageNumber: newPage }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPageState(prev => ({ ...prev, pageNumber: 1 })); // Reset to first page on search
  };

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
            Showing {pageState.items.length} of {pageState.totalCount} courses
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
        courses={pageState.items}
        categories={categories}
        isLoading={loading}
        totalCount={pageState.totalCount}
        currentPage={pageState.pageNumber}
        pageSize={pageState.pageSize}
        totalPages={pageState.totalPages}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        gridConfig={gridConfig}
        onGridChange={handleGridChange}
      />
    </div>
  );
};

export default Courses;
