import { useEffect, useState, useMemo } from "react";
import { courseApi } from "../api/courseApi";
import { PlusCircle, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../../shared/components/common";
import { Course } from "../types/course.types";



const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "rating">("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [categories, setCategories] = useState<{ id: number; categoryName: string }[]>([]);

  const fetchCourses = async () => {
    console.log("Fetching courses from API...");
    try {
      const data = await courseApi.list();
      const categoriesData = await courseApi.getCategories();
      console.log("Fetched courses:", data);
      setCourses(data);
      setCategories(categoriesData);
      setUsingSampleData(false);
      toast.success(`Loaded ${data.length} courses successfully!`);
    } catch (err: any) {
      console.error("Failed to load courses:", err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Filter and Sort Logic
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query)
      );
    }

    // Filter by Category
    if (selectedCategory !== "all") {
      result = result.filter(course => course.categoryId === selectedCategory);
    }

    // Filter by Difficulty
    if (selectedDifficulty !== "all") {
      result = result.filter(course => course.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
    }

    // Filter by Status
    if (selectedStatus !== "all") {
      result = result.filter(course =>
        selectedStatus === "active" ? course.isActive : !course.isActive
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
        break;
    }

    return result;
  }, [courses, searchQuery, selectedCategory, selectedDifficulty, selectedStatus, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="p-5">
      {/* Sample Data Banner */}
      {usingSampleData && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg mb-4 text-center">
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
        </div>

        <button
          onClick={() => navigate('/courses/create')}
          className="flex items-center gap-2 bg-primary-navy text-white px-4 py-2.5 rounded-lg font-medium shadow-lg hover:bg-primary-navy-light transition-all"
        >
          <PlusCircle size={20} />
          Create New Course
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses by title, instructor..."
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
              onChange={(e) => setSortBy(e.target.value as any)}
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
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="text-sm px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary-navy cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {(searchQuery || selectedCategory !== "all" || selectedDifficulty !== "all" || selectedStatus !== "all") && (
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

      {/* Loading */}
      {loading && (
        <div className="py-12">
          <LoadingSpinner variant="dots" size="lg" message="Loading courses..." />
        </div>
      )}

      {/* Grid */}
      {paginatedCourses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full"
            >
              {/* Thumbnail Area */}
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={course.thumbnailUrl || `https://source.unsplash.com/random/800x600?sig=${course.id}`}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${course.isActive
                      ? "bg-green-500/90 text-white"
                      : "bg-gray-500/90 text-white"
                      }`}
                  >
                    {course.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-xs font-bold text-secondary-gold uppercase tracking-wider">
                    {course.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <span>⭐</span>
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-navy transition-colors">
                  <NavLink to={`/courses/${course?.courseId}`} className="hover:underline">
                    {course.title}
                  </NavLink>
                </h2>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                  {course.description}
                </p>

                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                        {course.instructor.charAt(0)}
                      </span>
                      {course.instructor}
                    </span>
                    <span>{course.durationHours}h</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary-navy">
                      ₹{course.price}
                    </span>
                    {console.log(course.courseId)}
                    <NavLink
                      to={`/courses/${course?.courseId}`}
                      className="text-sm font-semibold text-primary-navy hover:text-secondary-gold transition-colors"
                    >
                      View Details →
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                ? "bg-primary-navy text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}


    </div>
  );
};

export default Courses;
