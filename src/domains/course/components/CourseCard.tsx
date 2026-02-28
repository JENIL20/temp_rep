import React from "react";
import { NavLink } from "react-router-dom";
import { Course } from "../types/course.types";
import { API_BASE_URL } from "@/shared/config";

interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    // Handle ID mismatch if any (api vs local type)
    const courseId = course.courseId;

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full">
            {/* Thumbnail Area */}
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img
                    src={`${API_BASE_URL}`+course.thumbnailUrl || `https://source.unsplash.com/random/800x600?sig=${courseId}`}
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
                        <span>{course.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-navy transition-colors">
                    <NavLink to={`/courses/${courseId}`} className="hover:underline">
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
                                {(course.instructor || 'I').charAt(0)}
                            </span>
                            {course.instructor}
                        </span>
                        <span>{course.durationHours}h</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary-navy">
                            ₹{course.price}
                        </span>
                        <NavLink
                            to={`/courses/${courseId}`}
                            className="text-sm font-semibold text-primary-navy hover:text-secondary-gold transition-colors"
                        >
                            View Details →
                        </NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
