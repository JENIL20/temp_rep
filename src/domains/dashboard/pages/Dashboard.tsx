import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../store';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  PlayCircle,
  ArrowRight,
  User as UserIcon,
  FileText,
  Layers,
  Star
} from 'lucide-react';
import { courseApi } from '../../course/api/courseApi';
import { userCourseApi } from '../../enrollment/api/userCourseApi';
import { certificateApi } from '../../certificate/api/certificateApi';
import { categoryApi } from '../../category/api/categoryApi';
import { Course } from '../../course/types/course.types';
import { EnrolledCourse } from '../../enrollment/types/enrollment.types';
import { Certificate } from '../../certificate/types/certificate.types';
import { Category } from '../../category/types/category.types';
import { PageLoader } from '../../../shared/components/common';

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topInstructors, setTopInstructors] = useState<{ name: string, courseCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const userId = parseInt(user.id);

        // Fetch all data in parallel
        const [allCoursesResponse, myCoursesResponse, myCertificates, categoriesResponse] = await Promise.all([
          courseApi.list({ pageSize: 100, pageNumber: 1 }), // Fetch more to calculate stats
          userCourseApi.getMyCourses(),
          certificateApi.getUserCertificates(userId as any),
          categoryApi.list({ pageSize: 4, pageNumber: 1 })
        ]);

        // Process Courses
        let coursesList: Course[] = [];
        // Check if response has items (PaginatedResponse) or is direct array
        if ('items' in allCoursesResponse && Array.isArray(allCoursesResponse.items)) {
          coursesList = allCoursesResponse.items;
        } else if (Array.isArray(allCoursesResponse)) {
          coursesList = allCoursesResponse;
        }

        // Process Enrollments
        let enrollmentsList: EnrolledCourse[] = [];
        if ('items' in myCoursesResponse && Array.isArray(myCoursesResponse.items)) {
          enrollmentsList = myCoursesResponse.items;
        } else if (Array.isArray(myCoursesResponse)) {
          enrollmentsList = myCoursesResponse;
        }

        const certificatesList = (Array.isArray(myCertificates) ? myCertificates : []) as Certificate[];

        // Process Categories
        let categoriesList: Category[] = [];
        if ('items' in categoriesResponse && Array.isArray(categoriesResponse.items)) {
          categoriesList = categoriesResponse.items;
        } else if (Array.isArray(categoriesResponse)) {
          categoriesList = categoriesResponse;
        }
        setCategories(categoriesList);

        // Calculate Stats
        const completed = enrollmentsList.filter(c => c.status === 'Completed').length;

        setStats({
          totalCourses: coursesList.length,
          enrolledCourses: enrollmentsList.length,
          completedCourses: completed,
          certificates: certificatesList.length
        });

        // Get recent courses (last 3) -> Assuming list is ordered or we take first 3
        setRecentCourses(coursesList.slice(0, 3));

        // Get recent enrollments (last 3)
        setEnrolledCourses(enrollmentsList.slice(0, 3));

        // Aggregate Top Instructors from Course List
        const instructorMap = coursesList.reduce((acc, course) => {
          const name = course.instructor || 'Unknown';
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sortedInstructors = Object.entries(instructorMap)
          .map(([name, count]) => ({ name, courseCount: count }))
          .sort((a, b) => b.courseCount - a.courseCount)
          .slice(0, 4);

        setTopInstructors(sortedInstructors);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (loading) {
    return <PageLoader message="Loading your dashboard..." variant="ring" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="text-blue-600">{(user as any)?.name}</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your learning journey today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-50 rounded-md p-3">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats.totalCourses}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats.enrolledCourses - stats.completedCourses}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats.completedCourses}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-50 rounded-md p-3">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Certificates</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats.certificates}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Area - 2 Columns */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick Actions (Static) */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to="/courses" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                  <BookOpen className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">Browse</span>
                </Link>
                <Link to="/my-courses" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                  <PlayCircle className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">My Learning</span>
                </Link>
                <Link to="/certificates" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                  <Award className="h-8 w-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">Certificates</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                  <UserIcon className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">Profile</span>
                </Link>
              </div>
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PlayCircle size={20} className="text-blue-600" />
                  Continue Learning
                </h3>
                <Link to="/my-courses" className="text-sm text-blue-600 hover:text-blue-500 flex items-center font-medium">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <ul className="divide-y divide-gray-200">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((enrollment) => (
                    <li key={enrollment.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-gray-200 overflow-hidden shadow-sm">
                          {enrollment.course.thumbnailUrl ? (
                            <img src={enrollment.course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">{enrollment.course.title}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${enrollment.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">{enrollment.progress}%</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/courses/${enrollment.courseId}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:-translate-y-0.5"
                          >
                            Continue
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-8 text-center text-gray-500 bg-gray-50/30">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="font-medium">You haven't enrolled in any courses yet.</p>
                    <Link to="/courses" className="mt-2 inline-block text-blue-600 hover:underline">Browse Courses</Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Popular Categories */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Layers size={20} className="text-purple-600" />
                  Popular Categories
                </h3>
                <Link to="/courses" className="text-sm text-blue-600 hover:text-blue-500 flex items-center font-medium">
                  Browse all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((cat, idx) => (
                    <div key={cat.id || idx} className="bg-purple-50 hover:bg-purple-100 rounded-xl p-4 text-center cursor-pointer transition-colors border border-purple-100">
                      <h4 className="font-semibold text-purple-900">{cat.categoryName}</h4>
                      <p className="text-xs text-purple-600 mt-1">Explore</p>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="col-span-4 text-center text-gray-500 text-sm">No categories found.</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">

            {/* New Courses */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Star size={20} className="text-yellow-500" />
                  New Courses
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {recentCourses.length > 0 ? (
                  recentCourses.map((course) => (
                    <li key={course.courseId} className="p-6 hover:bg-gray-50 transition-colors group">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{course.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {course.difficulty}
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {course.durationHours}h
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/courses/${course.courseId}`}
                        className="mt-4 block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-blue-600 transition-all"
                      >
                        View Details
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="p-6 text-center text-gray-500">
                    No courses available.
                  </li>
                )}
              </ul>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <Link to="/courses" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center">
                  View all courses <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Top Instructors */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserIcon size={20} className="text-indigo-500" />
                  Top Instructors
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {topInstructors.map((instructor, idx) => (
                  <li key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {instructor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{instructor.name}</p>
                        <p className="text-xs text-gray-500">{instructor.courseCount} Courses</p>
                      </div>
                    </div>
                    <Link to="/courses" className="text-xs text-blue-600 hover:underline">View</Link>
                  </li>
                ))}
                {topInstructors.length === 0 && (
                  <li className="p-4 text-center text-gray-500 text-sm">No instructors found.</li>
                )}
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
