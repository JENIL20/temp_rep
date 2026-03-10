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
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { groupApi } from '../api/groupApi';
import { Group } from '../types/group.types';
import { LoadingSpinner } from '../../../shared/components/common';
import { confirmToast } from '@/shared/utils/confirmToast';
import { paths } from '@/routes/path';
import PermissionGate from '../../../shared/components/auth/PermissionGate';

const Groups = () => {
    const navigate = useNavigate();

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
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to load groups';
            toast.error(message);
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
        const ok = await confirmToast({
            title: "Delete group?",
            message: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            toastOptions: { type: "warning" },
        });
        if (!ok) return;
        try {
            await groupApi.delete(id);
            toast.success('Group deleted successfully');
            fetchData();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete group';
            toast.error(message);
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
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error saving group';
            toast.error(message);
        } finally {
            setSavingGroup(false);
        }
    };

    const handleManageCourses = (groupId: number) => {
        navigate(paths.web.manageGroupCourses.replace(':groupId', groupId.toString()));
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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
                                <Users size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Study Groups</h1>
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
                                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-600/20"
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
                                        <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Group Name</th>
                                        <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Created Date</th>
                                        <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {groups.map((group) => (
                                        <tr key={group.id} className="hover:bg-gray-50/50 transition-colors group-row relative">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600 font-bold shadow-sm">
                                                        {group.groupName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 leading-tight">{group.groupName}</div>
                                                        <div className="text-xs text-gray-500 mt-1">ID: #{group.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-600">
                                                {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <PermissionGate module="GROUP_MANAGEMENT" permission="group_edit">
                                                    <button
                                                        onClick={() => handleManageCourses(group.id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-purple-600 hover:text-purple-700 hover:bg-purple-50 hover:border-purple-200 font-semibold text-xs rounded-lg transition-all mr-2 shadow-sm"
                                                    >
                                                        <BookOpenCheck size={14} />
                                                        Assign Courses
                                                    </button>
                                                </PermissionGate>

                                                <PermissionGate module="GROUP_MANAGEMENT" permission="group_edit">
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
                                                </PermissionGate>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Area */}
                        {pageState.totalPages > 1 && (
                            <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-between">
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
        </div>
    );
};

export default Groups;
