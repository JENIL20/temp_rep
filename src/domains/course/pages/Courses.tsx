import { useEffect, useState } from "react";
import { courseApi } from "../api/courseApi";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Course } from "../types/course.types";
import CourseList from "../components/CourseList";

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ id: number; categoryName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const fetchCourses = async () => {
    console.log("Fetching courses from API...");
    try {
      const data = await courseApi.list();
      const categoriesData = await courseApi.getCategories();
      console.log("Fetched courses:", data);

      // Ensure data is array
      const courseList = Array.isArray(data) ? data : [];
      setCourses(courseList);
      setCategories(categoriesData);
      setUsingSampleData(false);

      if (courseList.length > 0) {
        toast.success(`Loaded ${courseList.length} courses successfully!`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load courses";
      console.error("Failed to load courses:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
        itemsPerPage={9}
      />
    </div>
  );
};

export default Courses;
