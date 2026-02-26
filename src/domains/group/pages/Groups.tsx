import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Search,
    Plus,
    X,
    MoreHorizontal,
    Edit3,
    Trash2,
    BookOpenCheck,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle2,
    Save
} from 'lucide-react';
import { toast } from 'react-toastify';
import { groupApi } from '../api/groupApi';
import { Group, GroupCourseUpdateItem } from '../types/group.types';
import { LoadingSpinner } from '../../../shared/components/common';
import { courseApi } from '../../course/api/courseApi';
import { Course } from '../../course/types/course.types';

const Groups = () => {
    // Data State
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Search
    const [pageState, setPageState] = useState({
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Group Modal State
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [groupName, setGroupName] = useState('');
    const [savingGroup, setSavingGroup] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    // Assign Courses Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assigningGroup, setAssigningGroup] = useState<Group | null>(null);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [groupCourses, setGroupCourses] = useState<GroupCourseUpdateItem[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [savingCourses, setSavingCourses] = useState(false);
    const [courseSearch, setCourseSearch] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await groupApi.list({
                searchTerm,
                pageNumber: pageState.pageNumber,
                pageSize: pageState.pageSize
            });
            setGroups(data || []);
            setPageState(prev => ({
                ...prev,
                totalCount: data.totalCount,
                totalPages: data.totalPages
            }));
        } catch (error: any) {
            toast.error(error.message || 'Failed to load groups');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, pageState.pageNumber, pageState.pageSize]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageState(prev => ({ ...prev, pageNumber: 1 }));
    };

    const openCreateModal = () => {
        setEditingGroup(null);
        setGroupName('');
        setShowGroupModal(true);
    };

    const openEditModal = (group: Group) => {
        setEditingGroup(group);
        setGroupName(group.groupName || '');
        setShowGroupModal(true);
        setActiveDropdown(null);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this group?')) return;
        try {
            await groupApi.delete(id);
            toast.success('Group deleted successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete group');
        } finally {
            setActiveDropdown(null);
        }
    };

    const handleGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName.trim()) {
            toast.error('Group name is required');
            return;
        }

        try {
            setSavingGroup(true);
            if (editingGroup) {
                await groupApi.update(editingGroup.id, { id: editingGroup.id, groupName });
                toast.success('Group updated successfully');
            } else {
                await groupApi.create({ groupName });
                toast.success('Group created successfully');
            }
            setShowGroupModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Error saving group');
        } finally {
            setSavingGroup(false);
        }
    };

    // Course Assignment Handlers
    const openAssignModal = async (group: Group) => {
        setAssigningGroup(group);
        setShowAssignModal(true);
        setActiveDropdown(null);
        setGroupCourses([]);
        setCourseSearch('');

        try {
            setLoadingCourses(true);
            // Fetch all courses (using a large page size)
            const coursesData = await courseApi.list({ pageSize: 100 });
            setAllCourses(coursesData.items || []);

            // Fetch current group courses
            const gcData = await groupApi.getGroupCourses(group.id);
            const formatted = (gcData.items || []).map((c: any) => ({
                courseId: c.courseId,
                isEnable: c.isEnable
            }));
            setGroupCourses(formatted);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load courses');
            setShowAssignModal(false);
        } finally {
            setLoadingCourses(false);
        }
    };

    const toggleCourse = (courseId: number) => {
        setGroupCourses(prev => {
            const exists = prev.find(p => p.courseId === courseId);
            if (exists) {
                return prev.map(p => p.courseId === courseId ? { ...p, isEnable: !p.isEnable } : p);
            }
            return [...prev, { courseId, isEnable: true }];
        });
    };

    const handleSaveCourses = async () => {
        if (!assigningGroup) return;
        try {
            setSavingCourses(true);
            await groupApi.bulkUpdateCourses({
                groupId: assigningGroup.id,
                courses: groupCourses
            });
            toast.success('Group courses updated effectively');
            setShowAssignModal(false);
        } catch (error: any) {
            toast.error(error.message || 'Error updating courses');
        } finally {
            setSavingCourses(false);
        }
    };

    // Outside click detection
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown !== null) {
                // Ignore clicks if they fall inside a dropdown
                const isDropdownClick = (event.target as HTMLElement).closest('.dropdown-container');
                if (!isDropdownClick) {
                    setActiveDropdown(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    const filteredCourses = allCourses.filter(c =>
        c.title.toLowerCase().includes(courseSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                                <Users size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Study Groups</h1>
                                <p className="text-sm text-gray-500 font-medium mt-1">Organize users and assign course bundles efficiently.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search groups..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/20"
                            >
                                <Plus size={18} />
                                <span>Create Group</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {loading && groups.length === 0 ? (
                    <div className="py-24 flex justify-center">
                        <LoadingSpinner variant="dots" size="xl" message="Loading groups..." />
                    </div>
                ) : groups.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-24 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Groups Found</h3>
                        <p className="text-gray-500 max-w-sm mb-6">Create your first group to bundle courses and organize users.</p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-600 font-semibold rounded-xl hover:bg-purple-100 transition-colors"
                        >
                            <Plus size={18} />
                            Create Group
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Group Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Created Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {groups.map((group) => (
                                        <tr key={group.id} className="hover:bg-gray-50/50 transition-colors group-row relative">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600 font-bold shadow-sm">
                                                        {group.groupName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 leading-tight">{group.groupName}</div>
                                                        <div className="text-xs text-gray-500 mt-1">ID: #{group.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openAssignModal(group)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-purple-600 hover:text-purple-700 hover:bg-purple-50 hover:border-purple-200 font-semibold text-xs rounded-lg transition-all mr-2 shadow-sm"
                                                >
                                                    <BookOpenCheck size={14} />
                                                    Assign Courses
                                                </button>

                                                <div className="inline-block relative dropdown-container">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === group.id ? null : group.id)}
                                                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                                    >
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                    {activeDropdown === group.id && (
                                                        <div className="absolute right-0 top-10 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right text-left">
                                                            <button
                                                                onClick={() => openEditModal(group)}
                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <Edit3 size={16} className="text-gray-400" />
                                                                <span className="font-medium">Edit Name</span>
                                                            </button>
                                                            <div className="h-px bg-gray-100 my-1 mx-4" />
                                                            <button
                                                                onClick={() => handleDelete(group.id)}
                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 size={16} className="text-red-400" />
                                                                <span className="font-medium">Delete Group</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Area */}
                        {pageState.totalPages > 1 && (
                            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-500">
                                    Displaying <span className="text-gray-900 font-bold">{groups.length}</span> of <span className="text-gray-900 font-bold">{pageState.totalCount}</span>
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPageState(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                                        disabled={pageState.pageNumber === 1}
                                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-all border shadow-sm border-gray-200"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setPageState(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                                        disabled={pageState.pageNumber === pageState.totalPages}
                                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-all border shadow-sm border-gray-200"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create / Edit Group Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !savingGroup && setShowGroupModal(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 flex items-center justify-between text-white flex-shrink-0">
                            <h3 className="text-lg font-bold">
                                {editingGroup ? 'Edit Group' : 'Create Group'}
                            </h3>
                            <button onClick={() => !savingGroup && setShowGroupModal(false)} className="p-1.5 hover:bg-white/20 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleGroupSubmit} className="p-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Group Name *</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                    placeholder="e.g. Masterclass Batch Alpha"
                                />
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => !savingGroup && setShowGroupModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={savingGroup} className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-60">
                                    {savingGroup ? <><Loader2 size={16} className="animate-spin" /> Saving</> : 'Save Group'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Courses Modal */}
            {showAssignModal && assigningGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity" onClick={() => !savingCourses && setShowAssignModal(false)} />
                    <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Assign Courses to Group</h3>
                                <p className="text-sm font-medium text-gray-500 mt-1">{assigningGroup.groupName}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => !savingCourses && setShowAssignModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                            {loadingCourses ? (
                                <div className="py-20 flex justify-center">
                                    <LoadingSpinner variant="dots" message="Loading courses..." />
                                </div>
                            ) : (
                                <div className="space-y-4">
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

                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="max-h-[50vh] overflow-y-auto divide-y divide-gray-100">
                                            {filteredCourses.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500 text-sm">No courses found matching your search.</div>
                                            ) : (
                                                filteredCourses.map(course => {
                                                    const assignedItem = groupCourses.find(g => g.courseId === course.id);
                                                    const isAssigned = assignedItem?.isEnable === true;

                                                    return (
                                                        <label
                                                            key={course.id}
                                                            className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-purple-50/50 ${isAssigned ? 'bg-purple-50/30' : ''}`}
                                                        >
                                                            <div className="flex-shrink-0">
                                                                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isAssigned ? 'bg-purple-600 border-purple-600 text-white shadow-sm' : 'bg-white border-gray-300'
                                                                    }`}>
                                                                    {isAssigned && <CheckCircle2 size={16} />}
                                                                </div>
                                                                {/* Hidden checkbox for accessibility */}
                                                                <input
                                                                    type="checkbox"
                                                                    className="sr-only"
                                                                    checked={isAssigned}
                                                                    onChange={() => toggleCourse(course.id)}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-gray-900 truncate">{course.title}</div>
                                                                <div className="text-xs font-medium text-gray-500 flex items-center gap-2 mt-0.5">
                                                                    <span className="truncate">{course.instructor}</span>
                                                                    <span>•</span>
                                                                    <span className="capitalize">{course.difficulty}</span>
                                                                    {course.price > 0 && <span>• ${course.price.toFixed(2)}</span>}
                                                                </div>
                                                            </div>
                                                            {course.thumbnailUrl && (
                                                                <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 hidden sm:block">
                                                                    <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                        </label>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between rounded-b-2xl flex-shrink-0">
                            <div className="text-sm font-medium text-gray-500">
                                <strong className="text-purple-700">{groupCourses.filter(g => g.isEnable).length}</strong> courses selected
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => !savingCourses && setShowAssignModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all border border-gray-200">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveCourses}
                                    disabled={savingCourses || loadingCourses}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-60"
                                >
                                    {savingCourses ? <><Loader2 size={16} className="animate-spin" /> Saving</> : <><Save size={16} /> Save Assignments</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;
