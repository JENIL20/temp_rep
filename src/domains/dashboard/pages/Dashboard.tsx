import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../store';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Clock,
  PlayCircle,
  ArrowRight,
  User as UserIcon,
  Layers,
  Star,
  Zap,
  CheckCircle,
  Sparkles
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

        // Fetch all data in parallel
        const [allCoursesResponse, myCoursesResponse, myCertificates, categoriesResponse] = await Promise.all([
          courseApi.list({ pageSize: 100, pageNumber: 1 }), // Fetch more to calculate stats
          userCourseApi.getMyCourses(),
          certificateApi.getUserCertificates(user.id),
          categoryApi.list({ pageSize: 4, pageNumber: 1 })
        ]);

        // Process Courses
        let coursesList: Course[] = [];
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

        setRecentCourses(coursesList.slice(0, 3));
        setEnrolledCourses(enrollmentsList.slice(0, 3));

        // Aggregate Top Instructors
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
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Welcome Section */}
        <div className="relative mb-10 p-8 rounded-[2rem] bg-primary-navy overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-navy-light rounded-full opacity-20 blur-3xl transition-all group-hover:scale-110"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-secondary-gold rounded-full opacity-10 blur-2xl transition-all group-hover:scale-110"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-secondary-gold animate-pulse" />
                <span className="text-secondary-gold font-bold uppercase tracking-widest text-xs">Student Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-gold-light to-secondary-gold">{user?.firstName || user?.userName}</span>
              </h1>
              <p className="mt-4 text-slate-300 max-w-xl text-lg font-medium leading-relaxed">
                Ready to continue your learning adventure? You have <span className="text-white font-bold">{stats.enrolledCourses - stats.completedCourses} courses</span> in progress.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/courses" className="px-8 py-4 bg-secondary-gold hover:bg-secondary-gold-dark text-primary-navy font-black rounded-2xl shadow-xl shadow-secondary-gold/20 transition-all active:scale-95 text-center">
                Explore Courses
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {[
            { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600' },
            { label: 'In Progress', value: stats.enrolledCourses - stats.completedCourses, icon: Zap, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'Completed', value: stats.completedCourses, icon: CheckCircle, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' },
            { label: 'Certificates', value: stats.certificates, icon: Award, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' }
          ].map((stat, i) => (
            <div key={i} className="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1">
              <div className="flex items-center gap-5">
                <div className={`${stat.bg} ${stat.text} p-4 rounded-2xl transition-all group-hover:scale-110 group-hover:rotate-3`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div>
                  <dt className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</dt>
                  <dd className="text-3xl font-black text-slate-900 leading-tight">{stat.value}</dd>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">

            {/* Quick Actions */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary-navy rounded-full"></div>
                  Quick Actions
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { to: '/courses', icon: BookOpen, label: 'Browse', color: 'blue' },
                  { to: '/my-courses', icon: PlayCircle, label: 'Learning', color: 'emerald' },
                  { to: '/certificates', icon: Award, label: 'Awards', color: 'amber' },
                  { to: '/profile', icon: UserIcon, label: 'Profile', color: 'indigo' }
                ].map((action, i) => (
                  <Link key={i} to={action.to} className="flex flex-col items-center gap-4 p-6 bg-slate-50/50 border border-slate-100 rounded-3xl hover:bg-white hover:border-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group active:scale-95">
                    <div className={`p-4 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-all`}>
                      <action.icon className={`h-8 w-8 text-${action.color}-600`} />
                    </div>
                    <span className="text-sm font-black text-slate-700 uppercase tracking-widest">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Continue Learning */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                  Continue Learning
                </h3>
                <Link to="/my-courses" className="text-sm text-blue-600 hover:text-blue-700 flex items-center font-black uppercase tracking-wider group">
                  View all <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((enrollment) => (
                    <div key={enrollment.id} className="p-8 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="flex-shrink-0 relative group-hover:scale-105 transition-transform">
                          <div className="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden shadow-lg border-2 border-white">
                            {enrollment.course.thumbnailUrl ? (
                              <img src={enrollment.course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                <BookOpen className="h-8 w-8 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg border-2 border-white shadow-lg">
                            <PlayCircle className="h-3 w-3" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{enrollment.course.title}</h4>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                                style={{ width: `${enrollment.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{enrollment.progress}%</span>
                          </div>
                        </div>
                        <Link
                          to={`/courses/${enrollment.courseId}`}
                          className="sm:ml-4 inline-flex items-center justify-center px-8 py-4 bg-primary-navy hover:bg-primary-navy-light text-white font-black rounded-2xl shadow-xl shadow-primary-navy/20 transition-all active:scale-95 text-sm"
                        >
                          Continue
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                      <BookOpen className="h-10 w-10 text-slate-300" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">Start Your Learning Journey</h4>
                    <p className="text-slate-500 mt-2">You haven't enrolled in any courses yet. Discover our top-rated courses.</p>
                    <Link to="/courses" className="mt-6 inline-flex items-center px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
                  Top Categories
                </h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat, idx) => (
                  <div key={cat.id || idx} className="group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-purple-200/50 hover:border-purple-100 transition-all hover:-translate-y-2 cursor-pointer overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 -mr-6 -mt-6 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                    <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 relative z-10 transition-all group-hover:scale-110 group-hover:rotate-6">
                      <Layers className="h-6 w-6" />
                    </div>
                    <h4 className="font-black text-slate-900 text-lg leading-tight relative z-10">{cat.categoryName}</h4>
                    <p className="text-xs text-purple-600 font-black uppercase tracking-widest mt-2 relative z-10 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Explore <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-10">

            {/* New Courses */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                  Fresh Picks
                </h3>
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>
              <div className="space-y-6">
                {recentCourses.length > 0 ? (
                  recentCourses.map((course) => (
                    <div key={course.id} className="group cursor-pointer">
                      <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] hover:bg-white hover:border-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group-hover:-translate-y-1">
                        <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">{course.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{course.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                              {course.difficulty}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.durationHours}h
                            </span>
                          </div>
                          <Link to={`/courses/${course.id}`} className="p-2 bg-white text-slate-400 hover:text-blue-600 rounded-xl shadow-sm transition-colors border border-slate-100">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-4 font-medium italic">New courses coming soon!</p>
                )}
              </div>
              <Link to="/courses" className="mt-8 block text-center py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-black rounded-2xl transition-all text-sm uppercase tracking-widest">
                Browse Library
              </Link>
            </div>

            {/* Top Instructors */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                <h3 className="text-xl font-black text-slate-900">Elite Mentors</h3>
              </div>
              <div className="space-y-4">
                {topInstructors.map((instructor, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:border-white hover:shadow-xl hover:shadow-indigo-100/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
                        {instructor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-none mb-1">{instructor.name}</p>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{instructor.courseCount} Courses</p>
                      </div>
                    </div>
                    <Link to="/courses" className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest px-3 py-1 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:border-indigo-100">
                      View
                    </Link>
                  </div>
                ))}
                {topInstructors.length === 0 && (
                  <p className="text-center text-slate-400 py-4 font-medium italic">Our mentors are preparing content!</p>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
