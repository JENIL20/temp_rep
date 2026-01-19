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
    UserPlus,
    X,
    Check
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
    const [userRoles, setUserRoles] = useState<number[]>([]);

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
            setRoles(Array.isArray(rolesData) ? rolesData : []);
        } catch (err: any) {
            toast.error(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const openRoleAssignment = async (user: any) => {
        setSelectedUser(user);
        try {
            const assignedRoles = await userRoleApi.getUserRoles(user.id);
            setUserRoles(assignedRoles.map(r => r.id));
            setShowRoleModal(true);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleToggleRole = async (roleId: number) => {
        if (!selectedUser) return;
        const isAssigned = userRoles.includes(roleId);

        try {
            if (isAssigned) {
                await userRoleApi.remove(selectedUser.id, roleId);
                setUserRoles(prev => prev.filter(id => id !== roleId));
                toast.info("Role removed from user");
            } else {
                await userRoleApi.assign({ userId: selectedUser.id, roleId });
                setUserRoles(prev => [...prev, roleId]);
                toast.success("Role assigned to user");
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // Filter and Pagination
    const filteredUsers = users.filter(u =>
        u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Pagination Component
    const Pagination = () => {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 font-medium">Rows per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 text-slate-600 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => setCurrentPage(1)}
                                className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-white rounded-lg transition-all"
                            >
                                1
                            </button>
                            {startPage > 2 && <span className="text-slate-400">...</span>}
                        </>
                    )}

                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${currentPage === page
                                ? 'bg-primary-navy text-white shadow-lg shadow-primary-navy/20'
                                : 'text-slate-600 hover:bg-white'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="text-slate-400">...</span>}
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-white rounded-lg transition-all"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 text-slate-600 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-sm text-slate-600 font-medium">
                    Page {currentPage} of {totalPages}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin"></div>
                    <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-navy" />
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading User Directory...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Assign <span className="text-primary-navy">User Roles</span>
                        </h1>
                        <p className="text-slate-500 mt-1">Manage role assignments for platform users.</p>
                    </div>

                    <button
                        onClick={fetchData}
                        className="p-2.5 text-slate-600 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
                        title="Refresh Data"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative group mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-navy transition-colors" />
                    <input
                        type="text"
                        placeholder="Search users by username or email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-navy/5 focus:border-primary-navy outline-none transition-all"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider">Avatar</div>
                            <div className="col-span-3 text-xs font-black text-slate-400 uppercase tracking-wider">Username</div>
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

                                        {/* Username */}
                                        <div className="col-span-3">
                                            <span className="font-bold text-slate-900 group-hover:text-primary-navy transition-colors">
                                                {user.userName}
                                            </span>
                                        </div>

                                        {/* Email */}
                                        <div className="col-span-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Mail className="w-4 h-4" />
                                                {user.email}
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
                                                className="flex items-center gap-2 px-4 py-2 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95"
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
                                <p className="text-slate-400">Try adjusting your search parameters.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredUsers.length > 0 && <Pagination />}
                </div>
            </div>

            {/* Role Assignment Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowRoleModal(false)}></div>
                    <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-tr from-primary-navy to-primary-navy-dark rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-navy/30">
                                        <UserCircle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Role Assignment</h2>
                                        <p className="text-slate-400 font-medium">
                                            Managing roles for: <span className="font-bold text-slate-800">{selectedUser.userName}</span>
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Roles Grid */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Available Security Profiles</h3>
                                    <span className="text-sm text-slate-500 font-medium">
                                        {userRoles.length} of {roles.length} assigned
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                    {roles.map(role => {
                                        const isAssigned = userRoles.includes(role.roleId);
                                        return (
                                            <button
                                                key={role.id}
                                                onClick={() => handleToggleRole(role.roleId)}
                                                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${isAssigned
                                                    ? 'bg-primary-navy border-primary-navy text-white shadow-lg shadow-primary-navy/20'
                                                    : 'bg-slate-50 border-slate-200 hover:border-primary-navy/30 text-slate-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isAssigned ? 'bg-white/20' : 'bg-white'
                                                        }`}>
                                                        <Shield className={`w-5 h-5 ${isAssigned ? 'text-white' : 'text-slate-400'}`} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm leading-tight">{role.roleName}</p>
                                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isAssigned ? 'text-white/60' : 'text-slate-400'
                                                            }`}>
                                                            {role.roleCode}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isAssigned
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-white text-slate-300 border border-slate-200 shadow-sm'
                                                    }`}>
                                                    {isAssigned ? (
                                                        <Check className="w-5 h-5 animate-in zoom-in duration-200" />
                                                    ) : (
                                                        <UserPlus className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                                >
                                    Finish & Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div>
    );
};

export default AssignRoles;
