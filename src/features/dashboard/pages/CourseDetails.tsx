import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import {
  ArrowLeft,
  Play,
  Users,
  BookOpen,
  Clock,
  Star,
  DollarSign,
  Video,
  User,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle
} from "lucide-react";
import type { Course, CourseVideo, EnrolledUser } from "../../../types/course.types";

type TabType = 'details' | 'videos' | 'students';

// Sample data for when API is not available
const getSampleCourse = (courseId: string): Course => ({
  id: parseInt(courseId) || 1,
  title: "Complete Web Development Bootcamp 2024",
  description: "Master modern web development with HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and become a full-stack developer.",
  instructor: "Dr. Sarah Johnson",
  difficulty: "intermediate",
  durationHours: 42,
  price: 2999,
  rating: 4.8,
  isActive: true,
  categoryId: 1,
  thumbnailUrl: "",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-03-20T15:30:00Z"
});

const getSampleVideos = (courseId: string): CourseVideo[] => [
  {
    id: 1,
    courseId: parseInt(courseId) || 1,
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of web development and what you'll build in this course",
    videoUrl: "https://example.com/video1.mp4",
    duration: 1200,
    order: 1,
    thumbnailUrl: "",
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    courseId: parseInt(courseId) || 1,
    title: "HTML Basics and Structure",
    description: "Understanding HTML tags, elements, and document structure",
    videoUrl: "https://example.com/video2.mp4",
    duration: 1800,
    order: 2,
    thumbnailUrl: "",
    isActive: true,
    createdAt: "2024-01-16T10:00:00Z"
  },
  {
    id: 3,
    courseId: parseInt(courseId) || 1,
    title: "CSS Styling and Layouts",
    description: "Master CSS for beautiful and responsive designs",
    videoUrl: "https://example.com/video3.mp4",
    duration: 2400,
    order: 3,
    thumbnailUrl: "",
    isActive: true,
    createdAt: "2024-01-17T10:00:00Z"
  },
  {
    id: 4,
    courseId: parseInt(courseId) || 1,
    title: "JavaScript Fundamentals",
    description: "Learn JavaScript basics including variables, functions, and control flow",
    videoUrl: "https://example.com/video4.mp4",
    duration: 3000,
    order: 4,
    thumbnailUrl: "",
    isActive: true,
    createdAt: "2024-01-18T10:00:00Z"
  },
  {
    id: 5,
    courseId: parseInt(courseId) || 1,
    title: "React Components and Props",
    description: "Building reusable components with React",
    videoUrl: "https://example.com/video5.mp4",
    duration: 2700,
    order: 5,
    thumbnailUrl: "",
    isActive: true,
    createdAt: "2024-01-19T10:00:00Z"
  },
  {
    id: 6,
    courseId: parseInt(courseId) || 1,
    title: "State Management with Redux",
    description: "Managing application state effectively",
    videoUrl: "https://example.com/video6.mp4",
    duration: 3300,
    order: 6,
    thumbnailUrl: "",
    isActive: false,
    createdAt: "2024-01-20T10:00:00Z"
  }
];

const getSampleEnrolledUsers = (courseId: string): EnrolledUser[] => [
  {
    id: 1,
    userId: 101,
    courseId: parseInt(courseId) || 1,
    enrolledAt: "2024-02-01T09:00:00Z",
    progress: 85,
    status: 'active',
    user: {
      id: 101,
      username: "john_doe",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      avatarUrl: ""
    }
  },
  {
    id: 2,
    userId: 102,
    courseId: parseInt(courseId) || 1,
    enrolledAt: "2024-02-05T14:30:00Z",
    progress: 100,
    status: 'completed',
    user: {
      id: 102,
      username: "jane_smith",
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      avatarUrl: ""
    }
  },
  {
    id: 3,
    userId: 103,
    courseId: parseInt(courseId) || 1,
    enrolledAt: "2024-02-10T11:15:00Z",
    progress: 45,
    status: 'active',
    user: {
      id: 103,
      username: "mike_wilson",
      email: "mike.wilson@example.com",
      firstName: "Mike",
      lastName: "Wilson",
      avatarUrl: ""
    }
  },
  {
    id: 4,
    userId: 104,
    courseId: parseInt(courseId) || 1,
    enrolledAt: "2024-02-12T16:45:00Z",
    progress: 62,
    status: 'active',
    user: {
      id: 104,
      username: "sarah_brown",
      email: "sarah.brown@example.com",
      firstName: "Sarah",
      lastName: "Brown",
      avatarUrl: ""
    }
  },
  {
    id: 5,
    userId: 105,
    courseId: parseInt(courseId) || 1,
    enrolledAt: "2024-02-15T10:20:00Z",
    progress: 28,
    status: 'active',
    user: {
      id: 105,
      username: "alex_garcia",
      email: "alex.garcia@example.com",
      firstName: "Alex",
      lastName: "Garcia",
      avatarUrl: ""
    }
  },
  {
    id: 6,
    userId: 106,
    courseId: parseInt(courseId) || 1,
    enrolledAt: "2024-01-28T08:00:00Z",
    progress: 15,
    status: 'dropped',
    user: {
      id: 106,
      username: "chris_lee",
      email: "chris.lee@example.com",
      firstName: "Chris",
      lastName: "Lee",
      avatarUrl: ""
    }
  },
  {
    id: 7,
    userId: 107,
    courseId: parseInt(courseId) || 1,
    enrolledAt: "2024-02-20T13:30:00Z",
    progress: 92,
    status: 'active',
    user: {
      id: 107,
      username: "emma_davis",
      email: "emma.davis@example.com",
      firstName: "Emma",
      lastName: "Davis",
      avatarUrl: ""
    }
  }
];

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [usingSampleData, setUsingSampleData] = useState(false);

  // Fetch course details
  const fetchCourse = async () => {
    try {
      const res = await api.get(`/course/${id}`);
      setCourse(res.data);
      setUsingSampleData(false);
    } catch (err) {
      console.error("Failed to load course, using sample data:", err);
      // Use sample data when API fails
      setCourse(getSampleCourse(id || "1"));
      setUsingSampleData(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch course videos
  const fetchVideos = async () => {
    setVideosLoading(true);
    try {
      const res = await api.get(`/course/${id}/videos`);
      setVideos(res.data);
    } catch (err) {
      console.error("Failed to load videos, using sample data:", err);
      // Use sample data when API fails
      setVideos(getSampleVideos(id || "1"));
    } finally {
      setVideosLoading(false);
    }
  };

  // Fetch enrolled users
  const fetchEnrolledUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get(`/course/${id}/enrollments`);
      setEnrolledUsers(res.data);
    } catch (err) {
      console.error("Failed to load enrolled users, using sample data:", err);
      // Use sample data when API fails
      setEnrolledUsers(getSampleEnrolledUsers(id || "1"));
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'videos' && videos.length === 0) {
      fetchVideos();
    } else if (activeTab === 'students' && enrolledUsers.length === 0) {
      fetchEnrolledUsers();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-600">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          Course not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sample Data Banner */}
      {usingSampleData && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 text-center">
          <p className="text-sm font-medium">
            ⚠️ API is not available. Displaying sample data for demonstration purposes.
          </p>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-navy via-primary-navy-light to-primary-navy-dark text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Courses</span>
          </button>

          {/* Course Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${course.isActive
                    ? "bg-green-400 text-green-900"
                    : "bg-red-400 text-red-900"
                    }`}
                >
                  {course.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-white/90 text-lg mb-4 max-w-3xl">
                {course.description}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <User size={16} />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <Clock size={16} />
                  <span>{course.durationHours} hours</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <Star size={16} className="fill-yellow-300 text-yellow-300" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <DollarSign size={16} />
                  <span>₹{course.price}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <Award size={16} />
                  <span className="capitalize">{course.difficulty}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all relative ${activeTab === 'details'
                ? 'text-primary-navy border-b-2 border-primary-navy'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <BookOpen size={18} />
              Course Details
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all relative ${activeTab === 'videos'
                ? 'text-primary-navy border-b-2 border-primary-navy'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Video size={18} />
              Videos
              {videos.length > 0 && (
                <span className="bg-secondary-gold/20 text-primary-navy px-2 py-0.5 rounded-full text-xs font-semibold">
                  {videos.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all relative ${activeTab === 'students'
                ? 'text-primary-navy border-b-2 border-primary-navy'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Users size={18} />
              Enrolled Students
              {enrolledUsers.length > 0 && (
                <span className="bg-secondary-gold/20 text-primary-navy px-2 py-0.5 rounded-full text-xs font-semibold">
                  {enrolledUsers.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="text-primary-navy" size={28} />
                Course Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary-navy/5 to-primary-navy/10 rounded-xl">
                    <User className="text-primary-navy mt-1" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Instructor</p>
                      <p className="text-base text-gray-900">{course.instructor}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-secondary-gold/10 to-secondary-gold/20 rounded-xl">
                    <Award className="text-secondary-gold-dark mt-1" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Difficulty Level</p>
                      <p className="text-base text-gray-900 capitalize">{course.difficulty}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                    <Clock className="text-amber-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Duration</p>
                      <p className="text-base text-gray-900">{course.durationHours} hours</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <DollarSign className="text-green-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Price</p>
                      <p className="text-base text-gray-900">₹{course.price}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                    <Star className="text-yellow-600 mt-1 fill-yellow-600" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Rating</p>
                      <p className="text-base text-gray-900">{course.rating} / 5.0</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                    {course.isActive ? (
                      <CheckCircle2 className="text-green-600 mt-1" size={20} />
                    ) : (
                      <XCircle className="text-red-600 mt-1" size={20} />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Status</p>
                      <p className="text-base text-gray-900">{course.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="animate-fadeIn">
            {videosLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-gray-600">Loading videos...</div>
              </div>
            ) : videos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <Video className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Videos Available</h3>
                <p className="text-gray-600">Videos for this course will appear here once they are added.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative bg-gradient-to-br from-primary-navy to-primary-navy-light h-48 flex items-center justify-center overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-white/80">
                          <Play size={48} className="group-hover:scale-110 transition-transform" />
                        </div>
                      )}

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white rounded-full p-4">
                          <Play className="text-primary-navy" size={32} fill="currentColor" />
                        </div>
                      </div>

                      {/* Video Number Badge */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Video {video.order || index + 1}
                      </div>

                      {/* Duration Badge */}
                      {video.duration && (
                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-navy transition-colors">
                        {video.title}
                      </h3>

                      {video.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {video.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <button className="text-sm font-medium text-primary-navy hover:text-primary-navy-light flex items-center gap-1 group/btn">
                          <Play size={16} />
                          <span>Watch Now</span>
                        </button>

                        {video.isActive !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${video.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                            }`}>
                            {video.isActive ? 'Published' : 'Draft'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="animate-fadeIn">
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-gray-600">Loading students...</div>
              </div>
            ) : enrolledUsers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <Users className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Enrolled</h3>
                <p className="text-gray-600">Students enrolled in this course will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Students Header */}
                <div className="bg-gradient-to-r from-primary-navy/5 to-secondary-gold/10 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="text-primary-navy" size={24} />
                    Enrolled Students ({enrolledUsers.length})
                  </h2>
                </div>

                {/* Students List */}
                <div className="divide-y divide-gray-100">
                  {enrolledUsers.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {enrollment.user.avatarUrl ? (
                            <img
                              src={enrollment.user.avatarUrl}
                              alt={enrollment.user.username}
                              className="w-14 h-14 rounded-full object-cover border-2 border-secondary-gold"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-navy to-primary-navy-light flex items-center justify-center text-white font-bold text-lg">
                              {enrollment.user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {enrollment.user.firstName && enrollment.user.lastName
                                  ? `${enrollment.user.firstName} ${enrollment.user.lastName}`
                                  : enrollment.user.username}
                              </h3>
                              <p className="text-sm text-gray-600">@{enrollment.user.username}</p>
                            </div>

                            {enrollment.status && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${enrollment.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : enrollment.status === 'active'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                                }`}>
                                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              <span>{enrollment.user.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {enrollment.progress !== undefined && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                  <TrendingUp size={12} />
                                  Progress
                                </span>
                                <span className="text-xs font-semibold text-primary-navy">
                                  {enrollment.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-primary-navy to-secondary-gold h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${enrollment.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
