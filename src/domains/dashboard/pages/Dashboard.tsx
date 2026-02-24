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

        const [
          allCoursesResponse,
          myCoursesResponse,
          myCertificates,
          categoriesResponse
        ] = await Promise.all([
          courseApi.list({ pageSize: 100, pageNumber: 1 }),
          userCourseApi.getMyCourses(),
          certificateApi.getUserCertificates(user.id),
          categoryApi.list({ pageSize: 4, pageNumber: 1 })
        ]);

        const coursesList =
          'items' in allCoursesResponse
            ? allCoursesResponse.items
            : allCoursesResponse;

        const enrollmentsList =
          'items' in myCoursesResponse
            ? myCoursesResponse.items
            : myCoursesResponse;

        const certificatesList = Array.isArray(myCertificates)
          ? myCertificates
          : [];

        const categoriesList =
          'items' in categoriesResponse
            ? categoriesResponse.items
            : categoriesResponse;

        const completed = enrollmentsList.filter(
          (c: EnrolledCourse) => c.status === 'Completed'
        ).length;

        setStats({
          totalCourses: coursesList.length,
          enrolledCourses: enrollmentsList.length,
          completedCourses: completed,
          certificates: certificatesList.length
        });

        setRecentCourses(coursesList.slice(0, 3));
        setEnrolledCourses(enrollmentsList.slice(0, 3));
        setCategories(categoriesList);

        const instructorMap = coursesList.reduce(
          (acc: Record<string, number>, course: Course) => {
            const name = course.instructor || 'Unknown';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
          },
          {}
        );

        const sortedInstructors = Object.entries(instructorMap)
          .map(([name, count]) => ({ name, courseCount: count }))
          .sort((a, b) => b.courseCount - a.courseCount)
          .slice(0, 4);

        setTopInstructors(sortedInstructors);
      } catch (error) {
        console.error(error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* ===== HERO ===== */}
        <div className="relative bg-primary-navy rounded-3xl p-10 overflow-hidden shadow-xl">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-secondary-gold/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-secondary-gold h-5 w-5" />
                <span className="text-secondary-gold uppercase tracking-widest text-xs font-bold">
                  Student Dashboard
                </span>
              </div>

              <h1 className="text-4xl font-extrabold text-white">
                Welcome back,{' '}
                <span className="text-secondary-gold">
                  {user?.firstName || user?.userName}
                </span>
              </h1>

              <p className="text-slate-300 mt-4">
                You have{' '}
                <span className="text-white font-bold">
                  {stats.enrolledCourses - stats.completedCourses}
                </span>{' '}
                courses in progress.
              </p>
            </div>

            <Link
              to="/courses"
              className="px-8 py-4 bg-secondary-gold hover:bg-secondary-gold-dark text-primary-navy font-bold rounded-2xl shadow-lg transition-all"
            >
              Explore Courses
            </Link>
          </div>
        </div>

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen },
            { label: 'In Progress', value: stats.enrolledCourses - stats.completedCourses, icon: Zap },
            { label: 'Completed', value: stats.completedCourses, icon: CheckCircle },
            { label: 'Certificates', value: stats.certificates, icon: Award }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-primary-navy/10 text-primary-navy">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 font-bold">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-extrabold text-primary-navy">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== MAIN GRID ===== */}
        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-10">

            {/* Continue Learning */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="p-8 border-b border-slate-100 flex justify-between">
                <h3 className="text-xl font-bold text-primary-navy">
                  Continue Learning
                </h3>
                <Link to="/my-courses" className="text-secondary-gold font-semibold text-sm">
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {enrolledCourses.map((enrollment) => (
                  <div key={enrollment.id} className="p-8 flex gap-6 items-center">
                    <div className="h-20 w-20 bg-slate-100 rounded-2xl overflow-hidden">
                      {enrollment.course.thumbnailUrl ? (
                        <img
                          src={enrollment.course.thumbnailUrl}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <BookOpen className="text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-primary-navy mb-3">
                        {enrollment.course.title}
                      </h4>

                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-200 rounded-full h-3">
                          <div
                            className="bg-secondary-gold h-full rounded-full transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <span className="text-secondary-gold font-bold text-sm">
                          {enrollment.progress}%
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/courses/${enrollment.courseId}`}
                      className="px-6 py-3 bg-primary-navy hover:bg-primary-navy-light text-white rounded-xl font-semibold"
                    >
                      Continue
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-bold text-primary-navy mb-6">
                Top Categories
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="h-10 w-10 bg-primary-navy/10 text-primary-navy rounded-xl flex items-center justify-center mb-4">
                      <Layers className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-primary-navy">
                      {cat.categoryName}
                    </p>
                    <p className="text-xs text-secondary-gold font-bold mt-2">
                      Explore →
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-10">

            {/* Fresh Picks */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between mb-6">
                <h3 className="font-bold text-primary-navy">
                  Fresh Picks
                </h3>
                <Star className="text-secondary-gold fill-secondary-gold" />
              </div>

              <div className="space-y-6">
                {recentCourses.map((course) => (
                  <div key={course.id} className="p-4 rounded-xl bg-slate-50">
                    <h4 className="font-semibold text-primary-navy">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex justify-between mt-3 text-xs">
                      <span className="text-secondary-gold font-bold">
                        {course.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3" />
                        {course.durationHours}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Instructors */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-primary-navy mb-6">
                Elite Mentors
              </h3>

              <div className="space-y-4">
                {topInstructors.map((instructor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary-navy text-white rounded-xl flex items-center justify-center font-bold">
                        {instructor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary-navy">
                          {instructor.name}
                        </p>
                        <p className="text-xs text-secondary-gold font-bold">
                          {instructor.courseCount} Courses
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/courses"
                      className="text-xs font-semibold text-secondary-gold"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;