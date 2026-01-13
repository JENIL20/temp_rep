import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseApi, courseVideoApi, DUMMY_COURSES } from "../api/courseApi";
import {
  ArrowLeft,
  Play,
  Plus,
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
  XCircle,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import ReactPlayer from "react-player";
import { useAppSelector } from "../../../store";
import { userCourseApi } from "../../enrollment/api/userCourseApi";

const Player = ReactPlayer as any;
import type { Course, CourseVideo, EnrolledUser } from "../types/course.types";

type TabType = 'details' | 'videos' | 'students';



const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [checkingSub, setCheckingSub] = useState(false);
  console.log(DUMMY_COURSES)

  // Fetch course details
  const fetchCourse = async () => {
    try {
      const course = await courseApi.getById(Number(id || '1'));
      console.log("Fetched course:", course); // log the fetched course obje  c
      setCourse(course[0] || course);
      setUsingSampleData(false);
    } catch (err) {
      console.error("Failed to load course:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch course videos
  const fetchVideos = async () => {
    setVideosLoading(true);
    try {
      const videos = await courseVideoApi.listByCourse(Number(id || '1'));
      console.log("Fetched videos:", videos);
      setVideos(videos);
    } catch (err) {
      console.error("Failed to load videos:", err);
    } finally {
      setVideosLoading(false);
    }
  };

  // Fetch enrolled users
  const fetchEnrolledUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await courseApi.getEnrollments(Number(id || '1'));
      setEnrolledUsers(users);
    } catch (err) {
      console.error("Failed to load enrolled users:", err);
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

  // Handle escape key to close player
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPlayer(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Check subscription status
  useEffect(() => {
    const checkSub = async () => {
      if (!user || !id) return;
      setCheckingSub(true);
      try {
        const status = await userCourseApi.checkSubscription(Number(id));
        setIsSubscribed(status.isSubscribed);
      } catch (err) {
        console.error("Failed to check subscription:", err);
      } finally {
        setCheckingSub(false);
      }
    };

    checkSub();
  }, [user, id]);

  const handleSubscribe = async () => {
    if (!user || !course) {
      toast.error("Please login to subscribe");
      return;
    }
    setSubLoading(true);
    try {
      await userCourseApi.subscribe({
        userId: Number(user.id),
        courseId: course.courseId
      });
      setIsSubscribed(true);
      toast.success("Successfully subscribed!");
      // Refresh enrollments if on that tab
      if (activeTab === 'students') fetchEnrolledUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to subscribe";
      toast.error(message);
    } finally {
      setSubLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user || !course) return;
    if (!confirm("Are you sure you want to unsubscribe?")) return;

    setSubLoading(true);
    try {
      await userCourseApi.unsubscribe({
        userId: Number(user.id),
        courseId: course.courseId
      });
      setIsSubscribed(false);
      toast.info("Unsubscribed from course");
      // Refresh enrollments if on that tab
      if (activeTab === 'students') fetchEnrolledUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unsubscribe";
      toast.error(message);
    } finally {
      setSubLoading(false);
    }
  };

  console.log("COURSE DETAILS", course);
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

            {/* Action Button Section */}
            <div className="flex flex-col gap-4 min-w-[200px] mt-4 md:mt-0">
              {user ? (
                checkingSub ? (
                  <div className="h-12 w-32 bg-white/20 animate-pulse rounded-lg"></div>
                ) : isSubscribed ? (
                  <button
                    onClick={handleUnsubscribe}
                    disabled={subLoading}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/50 px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {subLoading ? "Processing..." : "Unsubscribe"}
                  </button>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={subLoading}
                    className="bg-secondary-gold hover:bg-secondary-gold-light text-primary-navy px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    {subLoading ? "Enrolling..." : "Enroll Now"}
                  </button>
                )
              ) : (
                <button
                  onClick={() => navigate('/login')} // Assuming login route
                  className="bg-secondary-gold hover:bg-secondary-gold-light text-primary-navy px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Login to Enroll
                </button>
              )}
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
            {/* Add Video Button */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => navigate(`/courses/${id}/add-video`)}
                className="flex items-center gap-2 bg-primary-navy hover:bg-primary-navy-dark text-white px-6 py-3 rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 font-semibold"
              >
                <Plus size={20} />
                Add Video
              </button>
            </div>

            {videosLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-gray-600">Loading videos...</div>
              </div>
            ) : videos.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <Video className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Videos Available</h3>
                <p className="text-gray-600 mb-6">Videos for this course will appear here once they are added.</p>
                <button
                  onClick={() => navigate(`/courses/${id}/add-video`)}
                  className="inline-flex items-center gap-2 bg-primary-navy hover:bg-primary-navy-dark text-white px-6 py-3 rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 font-semibold"
                >
                  <Plus size={20} />
                  Add Your First Video
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      setSelectedVideo(video);
                      setShowPlayer(true);
                    }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVideo(video);
                            setShowPlayer(true);
                          }}
                          className="text-sm font-medium text-primary-navy hover:text-primary-navy-light flex items-center gap-1 group/btn"
                        >
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

      {/* Video Player Modal */}
      {showPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-5xl aspect-video relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity duration-300">
              <h3 className="text-white font-bold text-lg truncate pr-8">
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => setShowPlayer(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Video Player */}
            <div className="w-full h-full bg-black">
              {(() => {
                const isAbsoluteUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');
                const videoUrl = isAbsoluteUrl(selectedVideo.videoUrl)
                  ? selectedVideo.videoUrl
                  : `https://keratometric-autotypic-collin.ngrok-free.dev${selectedVideo.videoUrl}`;

                // console.log("SELECTED VIDEO URL:", videoUrl);
                // Extract YouTube video ID from URL
                const getYouTubeId = (url: string) => {
                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                  const match = url.match(regExp);
                  return (match && match[2].length === 11) ? match[2] : null;
                };

                // Extract Vimeo video ID
                const getVimeoId = (url: string) => {
                  const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
                  const match = url.match(regExp);
                  return match ? match[1] : null;
                };

                // Extract Google Drive ID
                const getGoogleDriveId = (url: string) => {
                  const regExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
                  const match = url.match(regExp);
                  return match ? match[1] : null;
                };

                // Check if it's a direct video file
                const isDirectVideo = (url: string) => {
                  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
                };

                const youtubeId = getYouTubeId(videoUrl);
                const vimeoId = getVimeoId(videoUrl);
                const googleDriveId = getGoogleDriveId(videoUrl);
                const isDirect = isDirectVideo(videoUrl);

                // YouTube iframe embed
                if (youtubeId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                      width="100%"
                      height="100%"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      title={selectedVideo.title}
                    />
                  );
                }

                // Vimeo iframe embed
                if (vimeoId) {
                  return (
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1`}
                      width="100%"
                      height="100%"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      title={selectedVideo.title}
                    />
                  );
                }

                // Google Drive iframe embed
                if (googleDriveId) {
                  return (
                    <iframe
                      src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
                      width="100%"
                      height="100%"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      className="w-full h-full"
                      title={selectedVideo.title}
                    />
                  );
                }

                // Direct video file (MP4, WebM, etc.) - use HTML5 video
                if (isDirect) {
                  return (
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      muted
                      className="w-full h-full"
                      onError={(e) => {
                        console.error('Video playback error:', e);
                        toast.error("Unable to play video file");
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  );
                }

                // Fallback to ReactPlayer for other sources (Dailymotion, Twitch, etc.)
                return (
                  <Player
                    key={selectedVideo.id}
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={true}
                    muted={true}
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload'
                        }
                      }
                    }}
                    onReady={() => console.log('Player ready:', videoUrl)}
                    onError={(e: any) => {
                      console.error('Player error:', e);
                      toast.error("Unable to play video. Please check the video URL.");
                    }}
                  />
                );
              })()}
            </div>

            {/* Close Button (Always visible fallback) */}
            <button
              onClick={() => setShowPlayer(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-20 md:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
