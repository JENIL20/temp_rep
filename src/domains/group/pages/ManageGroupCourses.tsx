import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupApi } from '../api/groupApi';
import { Group, GroupCourseUpdateItem } from '../types/group.types';
import { courseApi } from '../../course/api/courseApi';
import { Course } from '../../course/types/course.types';
import {
    Search,
    Loader2,
    CheckCircle2,
    Save,
    ArrowLeft,
    BookOpen
} from 'lucide-react';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../../../shared/components/common';
import { paths } from '../../../routes/path';

const ManageGroupCourses = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();

    const [group, setGroup] = useState<Group | null>(null);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [groupCourses, setGroupCourses] = useState<GroupCourseUpdateItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');

    const fetchData = useCallback(async () => {
        if (!groupId) return;
        try {
            setLoading(true);
            const numGroupId = Number(groupId);

            // Fetch group details
            const groupData = await groupApi.getById(numGroupId);
            setGroup(groupData);

            // Fetch all courses (using a large page size)
            const coursesData = await courseApi.list({ pageSize: 100 });
            setAllCourses(coursesData.items || []);

            // Fetch current group courses
            const gcData = await groupApi.getGroupCourses(numGroupId);
            const formatted = (gcData.items || []).map((c: any) => ({
                courseId: c.courseId,
                isEnable: c.isEnable
            }));
            setGroupCourses(formatted);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to load group courses';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleCourse = (courseId: number) => {
        setGroupCourses(prev => {
            const exists = prev.find(p => p.courseId === courseId);
            if (exists) {
                return prev.map(p => p.courseId === courseId ? { ...p, isEnable: !p.isEnable } : p);
            }
            return [...prev, { courseId, isEnable: true }];
        });
    };

    const handleSave = async () => {
        if (!groupId) return;
        try {
            setSaving(true);
            await groupApi.bulkUpdateCourses({
                groupId: Number(groupId),
                courses: groupCourses
            });
            toast.success('Group courses updated effectively');
            navigate(paths.web.groups);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error updating courses';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const filteredCourses = allCourses.filter(c =>
        c.title.toLowerCase().includes(courseSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="py-24 flex justify-center min-h-screen bg-gray-50">
                <LoadingSpinner variant="dots" size="xl" message="Loading group data..." />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="py-24 flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Group not found</h3>
                <button
                    onClick={() => navigate(paths.web.groups)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-600 font-semibold rounded-xl hover:bg-purple-100 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Groups
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(paths.web.groups)}
                                className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white hidden sm:flex">
                                <BookOpen size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manage Group Courses</h1>
                                <p className="text-sm text-gray-500 font-medium mt-1">
                                    Assign or remove courses for <span className="text-purple-700 font-bold">{group.groupName}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-60"
                            >
                                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving</> : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Content Area */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search courses to assign..."
                                value={courseSearch}
                                onChange={(e) => setCourseSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto w-full">
                        {filteredCourses.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                                <div className="text-gray-500 text-sm font-medium">No courses found matching your search.</div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredCourses.map(course => {
                                    const assignedItem = groupCourses.find(g => g.courseId === course.id);
                                    const isAssigned = assignedItem?.isEnable === true;

                                    return (
                                        <label
                                            key={course.id}
                                            className={`flex items-center gap-6 p-5 cursor-pointer transition-colors hover:bg-purple-50/50 ${isAssigned ? 'bg-purple-50/30' : ''}`}
                                        >
                                            <div className="flex-shrink-0">
                                                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isAssigned ? 'bg-purple-600 border-purple-600 text-white shadow-sm' : 'bg-white border-gray-300'}`}>
                                                    {isAssigned && <CheckCircle2 size={16} />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={isAssigned}
                                                    onChange={() => toggleCourse(course.id)}
                                                />
                                            </div>

                                            {course.thumbnailUrl && (
                                                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 hidden sm:block bg-gray-100">
                                                    <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-gray-900 text-base mb-1 truncate">{course.title}</div>
                                                <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                                    <span className="truncate max-w-[150px]">{course.instructor}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{course.difficulty}</span>
                                                    {course.price > 0 && <span>• ${course.price.toFixed(2)}</span>}
                                                </div>
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 border-t border-gray-100 p-4 shrink-0 flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-500">
                            <strong className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md text-base">{groupCourses.filter(g => g.isEnable).length}</strong> courses selected for this group
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageGroupCourses;
