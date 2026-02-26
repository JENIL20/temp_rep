import React, { useEffect, useState } from 'react';
import { userRoleApi } from '../api/userRoleApi';
import { roleApi } from '../api/roleApi';
import { Role } from '../types/role.types';
import {
    Shield,
    Search,
    RefreshCw,
    ShieldAlert,
    UserCircle,
    Mail,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    Save,
    Loader2,
    Users,
} from 'lucide-react';
import { toast } from 'react-toastify';

const AssignRoles: React.FC = () => {
    // Data State
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modal State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    // Role assignment state (local, not saved until Save is clicked)
    const [originalRoles, setOriginalRoles] = useState<number[]>([]);
    const [pendingRoles, setPendingRoles] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const [loadingUserRoles, setLoadingUserRoles] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, rolesData] = await Promise.all([
                userRoleApi.listUsers(),
                roleApi.list()
            ]);
            setUsers(usersData?.items || []);
            // Normalise role list — API may return roleId/roleName or id/name shapes
            const normalized: Role[] = (Array.isArray(rolesData) ? rolesData : []).map((r: any) => ({
                id: r.id ?? r.roleId,
                name: r.name ?? r.roleName ?? '',
                code: r.code ?? r.roleCode ?? '',
                isActive: r.isActive ?? true,
            }));
            setRoles(normalized);
        } catch (err: any) {
            toast.error(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const openRoleAssignment = async (user: any) => {
        setSelectedUser(user);
        setLoadingUserRoles(true);
        setShowRoleModal(true);
        try {
            const assignedRoles = await userRoleApi.getUserRoles(user.id);
            // assignedRoles is Role[] with normalised `.id`
            const ids = assignedRoles.map(r => r.id);
            setOriginalRoles(ids);
            setPendingRoles(ids);
        } catch (err: any) {
            toast.error(err.message || 'Failed to load user roles');
        } finally {
            setLoadingUserRoles(false);
        }
    };

    const toggleRole = (roleId: number) => {
        setPendingRoles(prev =>
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        setSaving(true);
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
        } catch (err: any) {
            toast.error(err.message || 'Failed to save role assignments');
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowRoleModal(false);
        setSelectedUser(null);
        setOriginalRoles([]);
        setPendingRoles([]);
    };

    // Filter and Pagination
    const filteredUsers = users.filter(u =>
        u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const hasPendingChanges =
        pendingRoles.length !== originalRoles.length ||
        !pendingRoles.every(id => originalRoles.includes(id));

    // Pagination Component
    const Pagination = () => {
        const pages: number[] = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
        for (let i = startPage; i <= endPage; i++) pages.push(i);

        return (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 font-medium">Rows per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none"
                    >
                        {[5, 10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                        className="p-2 text-slate-600 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    {startPage > 1 && (
                        <>
                            <button onClick={() => setCurrentPage(1)} className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-white rounded-lg">1</button>
                            {startPage > 2 && <span className="text-slate-400">...</span>}
                        </>
                    )}
                    {pages.map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${currentPage === page ? 'bg-primary-navy text-white shadow-lg shadow-primary-navy/20' : 'text-slate-600 hover:bg-white'}`}>
                            {page}
                        </button>
                    ))}
                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="text-slate-400">...</span>}
                            <button onClick={() => setCurrentPage(totalPages)} className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-white rounded-lg">{totalPages}</button>
                        </>
                    )}
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 text-slate-600 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-sm text-slate-600 font-medium">
                    Page {currentPage} of {Math.max(1, totalPages)}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] bg-slate-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
                    <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-navy" />
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading User Directory...</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#F8FAFC] p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-navy to-primary-navy/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary-navy/20 flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Assign <span className="text-primary-navy">User Roles</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">Manage role assignments for platform users.</p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2.5 text-slate-600 hover:bg-slate-200 rounded-xl transition-all active:scale-95 self-start"
                    title="Refresh Data"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative group mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-navy transition-colors" />
                <input
                    type="text"
                    placeholder="Search users by username, name or email..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-white pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-primary-navy/5 focus:border-primary-navy outline-none transition-all text-sm"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Table Header */}
                <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200">
                    <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider">Avatar</div>
                        <div className="col-span-3 text-xs font-black text-slate-400 uppercase tracking-wider">Name</div>
                        <div className="col-span-4 text-xs font-black text-slate-400 uppercase tracking-wider">Email</div>
                        <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-wider">User ID</div>
                        <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100">
                    {paginatedUsers.length > 0 ? (
                        paginatedUsers.map(user => (
                            <div key={user.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    {/* Avatar */}
                                    <div className="col-span-1">
                                        <div className="w-10 h-10 bg-gradient-to-tr from-primary-navy/10 to-primary-navy/20 rounded-xl flex items-center justify-center text-primary-navy">
                                            <UserCircle className="w-6 h-6" />
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="col-span-3">
                                        <span className="font-bold text-slate-900 group-hover:text-primary-navy transition-colors text-sm">
                                            {user.firstName || user.lastName
                                                ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                                                : user.userName}
                                        </span>
                                        {(user.firstName || user.lastName) && (
                                            <p className="text-xs text-slate-400 mt-0.5">@{user.userName}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="col-span-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                    </div>

                                    {/* User ID */}
                                    <div className="col-span-2">
                                        <span className="text-xs font-black text-primary-navy/40 uppercase tracking-widest">
                                            UID: {user.id}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex items-center justify-end">
                                        <button
                                            onClick={() => openRoleAssignment(user)}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 text-sm"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Manage Roles
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center">
                            <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">No Users Found</h3>
                            <p className="text-slate-400 text-sm">Try adjusting your search parameters.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredUsers.length > 0 && <Pagination />}
            </div>

            {/* Role Assignment Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-primary-navy to-primary-navy/80 px-8 py-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <UserCircle className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black">Role Assignment</h2>
                                        <p className="text-white/70 text-sm mt-0.5">
                                            Managing roles for: <span className="font-bold text-white">
                                                {selectedUser.firstName || selectedUser.lastName
                                                    ? `${selectedUser.firstName ?? ''} ${selectedUser.lastName ?? ''}`.trim()
                                                    : selectedUser.userName}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <button onClick={handleCloseModal} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-6 mt-5 pt-5 border-t border-white/20">
                                <div>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Assigned</p>
                                    <p className="text-2xl font-extrabold">{pendingRoles.length}
                                        <span className="text-white/40 text-base font-normal"> / {roles.length}</span>
                                    </p>
                                </div>
                                {hasPendingChanges && (
                                    <div className="ml-auto flex items-center gap-2 bg-amber-400/20 text-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        Unsaved changes
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Roles Body */}
                        <div className="p-6">
                            {loadingUserRoles ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="w-10 h-10 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin mb-3" />
                                    <p className="text-slate-400 text-sm font-semibold">Loading assigned roles…</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                        Available Roles — click to toggle
                                    </p>

                                    {/* Role rows — one per row with clear checkbox style */}
                                    <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                        {roles.map(role => {
                                            const isAssigned = pendingRoles.includes(role.id);
                                            return (
                                                <button
                                                    key={role.id}
                                                    onClick={() => toggleRole(role.id)}
                                                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all group text-left
                                                        ${isAssigned
                                                            ? 'bg-primary-navy/5 border-primary-navy shadow-sm'
                                                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                                                            ${isAssigned
                                                                ? 'bg-primary-navy text-white shadow-sm'
                                                                : 'bg-white text-slate-400 border border-slate-200'
                                                            }`}>
                                                            <Shield className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className={`font-bold text-sm transition-colors ${isAssigned ? 'text-primary-navy' : 'text-slate-700'}`}>
                                                                {role.name}
                                                            </p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                                {role.code}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Checkbox indicator */}
                                                    <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                                                        ${isAssigned
                                                            ? 'bg-primary-navy border-primary-navy text-white'
                                                            : 'bg-white border-slate-300 text-transparent group-hover:border-slate-400'
                                                        }`}>
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {roles.length === 0 && (
                                            <div className="py-10 text-center text-slate-400 text-sm">
                                                No roles available.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || loadingUserRoles || !hasPendingChanges}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div>
    );
};

export default AssignRoles;
