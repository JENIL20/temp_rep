import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Search,
    Shield,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    X,
    Mail,
    Phone,
    Check,
    Save,
    Loader2,
    MoreHorizontal,
} from 'lucide-react';
import { toast } from 'react-toastify';
import userApi from '../api/userApi';
import { userRoleApi } from '../../role/api/userRoleApi';
import { roleApi } from '../../role/api/roleApi';
import { User } from '../types/user.types';
import { Role } from '../../role/types/role.types';
import { LoadingSpinner } from '../../../shared/components/common';

const UserList = () => {
    // Data State
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Search State
    const [pageState, setPageState] = useState({
        totalCount: 0,
        pageNumber: 1,
        pageSize: 8,
        totalPages: 0
    });
    const [searchTerm, setSearchTerm] = useState('');

    // UI State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [originalRoles, setOriginalRoles] = useState<number[]>([]);
    const [pendingRoles, setPendingRoles] = useState<number[]>([]);
    const [loadingUserRoles, setLoadingUserRoles] = useState(false);
    const [savingRoles, setSavingRoles] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersData, rolesData] = await Promise.all([
                userApi.list({
                    searchTerm,
                    pageNumber: pageState.pageNumber,
                    pageSize: pageState.pageSize
                }),
                roleApi.list()
            ]);

            setUsers(usersData.items);
            setPageState(prev => ({
                ...prev,
                totalCount: usersData.totalCount,
                totalPages: usersData.totalPages
            }));
            setRoles(rolesData);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load users";
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

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pageState.totalPages) {
            setPageState(prev => ({ ...prev, pageNumber: newPage }));
        }
    };

    const openRoleManager = async (user: User) => {
        setSelectedUser(user);
        setLoadingUserRoles(true);
        setShowRoleModal(true);
        setActiveDropdown(null);
        try {
            const userRoles = await userRoleApi.getUserRoles(user.id);
            const ids = userRoles.map(r => r.id);
            setOriginalRoles(ids);
            setPendingRoles(ids);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load user roles';
            toast.error(message);
        } finally {
            setLoadingUserRoles(false);
        }
    };

    const toggleRolePending = (roleId: number) => {
        setPendingRoles(prev =>
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleSaveRoles = async () => {
        if (!selectedUser) return;
        setSavingRoles(true);
        try {
            const toAdd = pendingRoles.filter(id => !originalRoles.includes(id));
            const toRemove = originalRoles.filter(id => !pendingRoles.includes(id));
            await Promise.all([
                ...toAdd.map(roleId => userRoleApi.assign({ userId: selectedUser.id, roleId })),
                ...toRemove.map(roleId => userRoleApi.remove(selectedUser.id, roleId)),
            ]);
            setOriginalRoles(pendingRoles);
            toast.success('Role assignments saved successfully!');
            setShowRoleModal(false);
            fetchData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save roles';
            toast.error(message);
        } finally {
            setSavingRoles(false);
        }
    };

    const handleCloseModal = () => {
        setShowRoleModal(false);
        setSelectedUser(null);
        setOriginalRoles([]);
        setPendingRoles([]);
    };

    const hasPendingChanges =
        pendingRoles.length !== originalRoles.length ||
        !pendingRoles.every(id => originalRoles.includes(id));

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
                            <p className="text-sm text-gray-500">Manage user access, roles, and permissions across the platform.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-navy transition-colors h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary-navy focus:ring-4 focus:ring-primary-navy/10 outline-none transition-all"
                                />
                            </div>
                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-navy text-white text-sm font-semibold rounded-lg hover:bg-primary-navy-light transition-colors shadow-sm shadow-primary-navy/20">
                                <UserPlus size={16} />
                                <span>Add User</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <Users size={22} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Users</p>
                                <h4 className="text-2xl font-bold text-gray-900">{pageState.totalCount}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* User List Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading && users.length === 0 ? (
                        <div className="py-24 text-center">
                            <LoadingSpinner variant="dots" size="xl" message="Loading users..." />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Roles</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 border border-gray-200">
                                                            <span className="font-semibold text-sm">
                                                                {user.firstName[0]}{user.lastName[0]}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                                                            <div className="text-xs text-gray-500">@{user.userName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.isActive
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="truncate">{user.email}</span>
                                                        </div>
                                                        {user.mobile && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                                {user.mobile}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {user.roles && user.roles.length > 0 ? (
                                                            user.roles.map((role, idx) => (
                                                                <span key={idx} className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                                    {role}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">No roles</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="text-sm text-gray-600">
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="relative inline-block">
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            <MoreHorizontal size={20} />
                                                        </button>

                                                        {activeDropdown === user.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                                                                    <button
                                                                        onClick={() => openRoleManager(user)}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                                    >
                                                                        <Shield size={16} className="text-gray-400" />
                                                                        Manage Roles
                                                                    </button>
                                                                    {/* Add more actions here if needed */}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Showing <span className="font-medium text-gray-900">{users.length}</span> of <span className="font-medium text-gray-900">{pageState.totalCount}</span> users
                                </p>

                                {pageState.totalPages > 1 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(pageState.pageNumber - 1)}
                                            disabled={pageState.pageNumber === 1}
                                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: pageState.totalPages }, (_, i) => i + 1).map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => handlePageChange(num)}
                                                    className={`w-7 h-7 rounded-lg text-sm font-medium transition-colors ${pageState.pageNumber === num
                                                        ? 'bg-primary-navy text-white'
                                                        : 'text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(pageState.pageNumber + 1)}
                                            disabled={pageState.pageNumber === pageState.totalPages}
                                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent rounded-lg transition-colors"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Role Management Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-primary-navy to-primary-navy/80 px-6 py-5 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-sm font-extrabold">
                                        {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black leading-tight">Role Assignment</h3>
                                        <p className="text-white/70 text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                                    </div>
                                </div>
                                <button onClick={handleCloseModal} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Stats + unsaved badge */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                                <p className="text-sm text-white/80">
                                    <span className="font-extrabold text-white">{pendingRoles.length}</span> of{' '}
                                    <span className="font-extrabold text-white">{roles.length}</span> roles assigned
                                </p>
                                {hasPendingChanges && (
                                    <span className="flex items-center gap-1.5 text-xs font-bold bg-amber-400/20 text-amber-200 px-2.5 py-1 rounded-lg">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                        Unsaved changes
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Role list */}
                        <div className="p-5">
                            {loadingUserRoles ? (
                                <div className="flex flex-col items-center justify-center py-14">
                                    <div className="w-9 h-9 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin mb-3" />
                                    <p className="text-sm text-slate-400 font-semibold">Loading assigned roles…</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Available Roles — click to toggle</p>
                                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                        {roles.map(role => {
                                            const isAssigned = pendingRoles.includes(role.id);
                                            return (
                                                <button
                                                    key={role.id}
                                                    onClick={() => toggleRolePending(role.id)}
                                                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-left
                                                        ${isAssigned
                                                            ? 'bg-primary-navy/5 border-primary-navy'
                                                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                                                            ${isAssigned ? 'bg-primary-navy text-white shadow-sm' : 'bg-white text-slate-400 border border-slate-200'}`}>
                                                            <Shield size={16} />
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold text-sm ${isAssigned ? 'text-primary-navy' : 'text-slate-700'}`}>
                                                                {role.name}
                                                            </p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{role.code}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                                                        ${isAssigned ? 'bg-primary-navy border-primary-navy text-white' : 'bg-white border-slate-300'}`}>
                                                        {isAssigned && <Check size={13} />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {roles.length === 0 && (
                                            <p className="text-center text-sm text-slate-400 py-8">No roles available.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-5 pb-5">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRoles}
                                disabled={savingRoles || loadingUserRoles || !hasPendingChanges}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {savingRoles ? (
                                    <><Loader2 size={15} className="animate-spin" /> Saving...</>
                                ) : (
                                    <><Save size={15} /> Save Changes</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
            `}</style>
        </div>
    );
};

export default UserList;
