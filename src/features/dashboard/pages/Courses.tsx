import { useEffect, useState, useRef } from "react";
import api from "../../../api/axios";
import { PlusCircle, X } from "lucide-react";
import { NavLink } from "react-router-dom";

// Sample courses data for when API is not available
const getSampleCourses = () => [
  {
    id: 1,
    title: "Complete Web Development Bootcamp 2024",
    description: "Master modern web development with HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and become a full-stack developer.",
    instructor: "Dr. Sarah Johnson",
    difficulty: "intermediate",
    durationHours: 42,
    price: 2999,
    rating: 4.8,
    isActive: true
  },
  {
    id: 2,
    title: "Python for Data Science",
    description: "Learn Python programming and data analysis with pandas, NumPy, and visualization libraries.",
    instructor: "Prof. Michael Chen",
    difficulty: "beginner",
    durationHours: 35,
    price: 2499,
    rating: 4.6,
    isActive: true
  },
  {
    id: 3,
    title: "Advanced React & TypeScript",
    description: "Deep dive into React patterns, hooks, TypeScript integration, and state management.",
    instructor: "Emily Rodriguez",
    difficulty: "advanced",
    durationHours: 28,
    price: 3499,
    rating: 4.9,
    isActive: true
  },
  {
    id: 4,
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile applications for iOS and Android using React Native.",
    instructor: "James Wilson",
    difficulty: "intermediate",
    durationHours: 38,
    price: 3299,
    rating: 4.7,
    isActive: true
  },
  {
    id: 5,
    title: "Machine Learning Fundamentals",
    description: "Introduction to machine learning algorithms, neural networks, and practical applications.",
    instructor: "Dr. Aisha Patel",
    difficulty: "advanced",
    durationHours: 45,
    price: 3999,
    rating: 4.8,
    isActive: false
  }
];

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: "",
    difficulty: "",
    durationHours: "",
    price: "",
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isModalOpen]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/course/list");
      setCourses(res.data);
      setUsingSampleData(false);
    } catch (err) {
      console.error("Failed to load courses, using sample data:", err);
      // Use sample data when API fails
      setCourses(getSampleCourses());
      setUsingSampleData(true);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/course/create", {
        ...form,
        durationHours: Number(form.durationHours),
        price: Number(form.price),
      });

      setIsModalOpen(false);
      setForm({
        title: "",
        description: "",
        instructor: "",
        difficulty: "",
        durationHours: "",
        price: "",
      });

      fetchCourses();
    } catch (error) {
      alert("Failed to create course");
    }
  };

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

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-primary-navy">Courses</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-secondary-gold text-primary-navy
                     px-3 py-1.5 rounded-md text-sm font-medium shadow-sm hover:opacity-90"
        >
          <PlusCircle size={18} />
          Add Course
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-500 text-sm">Loading courses...</p>}

      {/* Error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-primary-navy mb-1">
              <NavLink to={`/courses/${course.id}`}  >

                {course.title}
              </NavLink>
            </h2>

            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
              {course.description}
            </p>

            <div className="text-gray-700 text-xs space-y-1">
              <p><span className="font-semibold">Instructor:</span> {course.instructor}</p>
              <p><span className="font-semibold">Difficulty:</span> {course.difficulty}</p>
              <p><span className="font-semibold">Duration:</span> {course.durationHours} hrs</p>
              <p><span className="font-semibold">Rating:</span> ⭐ {course.rating}</p>
              <p><span className="font-semibold">Price:</span> ₹{course.price}</p>
            </div>

            <span
              className={`mt-3 inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${course.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {course.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ))}
      </div>

      {/* ---------------- MODAL ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md rounded-lg shadow-lg p-6"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary-navy">
                Add Course
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="text-gray-600 hover:text-black" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-3">
              {Object.entries(form).map(([key, value]) => (
                <input
                  key={key}
                  type="text"
                  placeholder={key.replace(/([A-Z])/g, " $1")}
                  value={value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-navy"
                />
              ))}
            </div>

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="px-4 py-1.5 text-sm rounded bg-primary-navy text-white hover:bg-primary-navy-light"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------------- END MODAL ---------------- */}
    </div>
  );
};

export default Courses;
