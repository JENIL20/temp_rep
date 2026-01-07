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
  FileText
} from 'lucide-react';
import { courseApi } from '../../course/api/courseApi';
import { userCourseApi } from '../../enrollment/api/userCourseApi';
import { certificateApi } from '../../certificate/api/certificateApi';
import { Course } from '../../course/types/course.types';
import { EnrolledCourse } from '../../enrollment/types/enrollment.types';
import { Certificate } from '../../certificate/types/certificate.types';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const userId = parseInt(user.id);

        // Fetch all data in parallel
        const [allCourses, myCourses, myCertificates] = await Promise.all([
          courseApi.list(),
          userCourseApi.getMyCourses(),
          certificateApi.getUserCertificates(userId)
        ]);

        // Process data
        const coursesList = (Array.isArray(allCourses) ? allCourses : []) as Course[];
        const enrollmentsList = (Array.isArray(myCourses) ? myCourses : []) as EnrolledCourse[];
        const certificatesList = (Array.isArray(myCertificates) ? myCertificates : []) as Certificate[];

        const completed = enrollmentsList.filter(c => c.status === 'Completed').length;

        setStats({
          totalCourses: coursesList.length,
          enrolledCourses: enrollmentsList.length,
          completedCourses: completed,
          certificates: certificatesList.length
        });

        // Get recent courses (last 3)
        setRecentCourses(coursesList.slice(0, 3));

        // Get recent enrollments (last 3)
        setEnrolledCourses(enrollmentsList.slice(0, 3));

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
            Welcome back, <span className="text-blue-600">{user?.name}</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your learning journey today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalCourses}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.enrolledCourses - stats.completedCourses}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.completedCourses}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Certificates</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.certificates}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Area - 2 Columns */}
          <div className="lg:col-span-2 space-y-8">

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to="/courses" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Browse Courses</span>
                </Link>
                <Link to="/my-courses" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <PlayCircle className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">My Learning</span>
                </Link>
                <Link to="/certificates" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Award className="h-8 w-8 text-yellow-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Certificates</span>
                </Link>
                <Link to="/profile" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <UserIcon className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Profile</span>
                </Link>
              </div>
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Continue Learning</h3>
                <Link to="/my-courses" className="text-sm text-blue-600 hover:text-blue-500 flex items-center">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <ul className="divide-y divide-gray-200">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((enrollment) => (
                    <li key={enrollment.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          {enrollment.course.thumbnailUrl ? (
                            <img src={enrollment.course.thumbnailUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                          ) : (
                            <BookOpen className="h-6 w-6 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{enrollment.course.title}</h4>
                          <div className="mt-1 flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${enrollment.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{enrollment.progress}%</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/courses/${enrollment.courseId}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            Continue
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-6 text-center text-gray-500">
                    You haven't enrolled in any courses yet.
                  </li>
                )}
              </ul>
            </div>

          </div>

          {/* Sidebar - New Courses */}
          <div className="space-y-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">New Courses</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {recentCourses.length > 0 ? (
                  recentCourses.map((course) => (
                    <li key={course.id} className="p-6 hover:bg-gray-50">
                      <div className="flex space-x-3">
                        <div className="flex-1 space-y-1">
                          <h4 className="text-sm font-medium text-gray-900">{course.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2">{course.description}</p>
                          <div className="flex items-center pt-2">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {course.difficulty}
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {course.durationHours}h
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link
                          to={`/courses/${course.id}`}
                          className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Course
                        </Link>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-6 text-center text-gray-500">
                    No courses available.
                  </li>
                )}
              </ul>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <Link to="/courses" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all courses <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
