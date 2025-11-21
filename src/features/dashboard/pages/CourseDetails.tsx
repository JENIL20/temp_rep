/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/course/${id}`);
      setCourse(res.data);
    } catch (err) {
      setError("Failed to load course.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (loading) return <p className="p-4 text-sm text-gray-500">Loading...</p>;
  if (error) return <p className="p-4 text-sm text-red-500">{error}</p>;
  if (!course) return <p className="p-4 text-sm text-gray-600">Course not found.</p>;

  return (
    <div className="p-4">

      {/* Back */}
      <button
        onClick={() => navigate("/courses")}
        className="mb-3 text-xs text-primary-navy underline"
      >
        ← Back
      </button>

      {/* Card */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-lg font-semibold text-primary-navy mb-1">
          {course.title}
        </h1>

        <p className="text-sm text-gray-600 mb-3">{course.description}</p>

        <div className="text-xs space-y-1 mb-3">
          <p><span className="font-semibold">Instructor:</span> {course.instructor}</p>
          <p><span className="font-semibold">Difficulty:</span> {course.difficulty}</p>
          <p><span className="font-semibold">Duration:</span> {course.durationHours} hrs</p>
          <p><span className="font-semibold">Rating:</span> ⭐ {course.rating}</p>
          <p><span className="font-semibold">Price:</span> ₹{course.price}</p>
        </div>

        {/* Status */}
        <span
          className={`inline-block px-2 py-0.5 text-[10px] rounded-full font-medium ${course.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }`}
        >
          {course.isActive ? "Active" : "Inactive"}
        </span>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => navigate(`/courses/update/${course.id}`)}
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
          >
            Update
          </button>

          <button
            onClick={() => navigate(`/courses/delete/${course.id}`)}
            className="px-3 py-1.5 text-xs bg-red-500 text-white rounded shadow-sm hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
