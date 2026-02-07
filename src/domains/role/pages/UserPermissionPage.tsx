import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userRoleApi } from '../api/userRoleApi';
import { roleApi } from '../api/roleApi';
import { Role } from '../types/role.types';
import {
    UserCircle,
    Mail,
    ArrowLeft,
    Shield,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';

interface UserInfo {
    id: number;
    userName: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

const UserPermissionPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserInfo | null>(null);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [assignedRoleIds, setAssignedRoleIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);


    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const fetchUserData = async () => {
        try {
            setLoading(true);

            // Fetch all roles
            const rolesData = await roleApi.list();
            setAllRoles(Array.isArray(rolesData) ? rolesData : []);

            // Fetch user's assigned roles
            const userRoles = await userRoleApi.getUserRoles(Number(userId));
            setAssignedRoleIds(userRoles.map((r: Role) => r.id));

            // Fetch real user details
            const userDetails = await userRoleApi.getUserDetails(Number(userId));
            setUser(userDetails);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (roleId: number) => {
        const isAssigned = assignedRoleIds.includes(roleId);

        try {
            if (isAssigned) {
                await userRoleApi.remove(Number(userId), roleId);
                setAssignedRoleIds(prev => prev.filter(id => id !== roleId));
                toast.info('Role removed from user');
            } else {
                await userRoleApi.assign({ userId: Number(userId), roleId });
                setAssignedRoleIds(prev => [...prev, roleId]);
                toast.success('Role assigned to user');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update role');
        }
    };



    // Pagination logic
    const totalPages = Math.ceil(allRoles.length / pageSize);
    const paginatedRoles = allRoles.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

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
                    <UserCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-navy" />
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading User Permissions...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/roles')}
                        className="flex items-center gap-2 text-slate-600 hover:text-primary-navy mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-semibold">Back to Roles</span>
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <UserCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                {user?.userName}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <p className="text-slate-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800">
                            <span className="font-bold">Tip:</span> Click on any role to assign or remove it from this user.
                            Changes are saved automatically.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-50 border-b border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Available Roles</h2>
                                <p className="text-slate-500 mt-1">
                                    <span className="font-semibold text-emerald-600">
                                        {assignedRoleIds.length}
                                    </span> of{' '}
                                    <span className="font-semibold">{allRoles.length}</span> roles assigned
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
                                <Shield className="w-6 h-6 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Roles List */}
                    <div className="divide-y divide-slate-100">
                        {paginatedRoles.map((role) => {
                            const isAssigned = assignedRoleIds.includes(role.id);

                            return (
                                <button
                                    key={role.id}
                                    onClick={() => toggleRole(role.id)}
                                    className={`w-full p-6 flex items-center justify-between transition-all group hover:bg-slate-50 ${isAssigned ? 'bg-emerald-50/50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isAssigned
                                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 rotate-6'
                                            : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                            }`}>
                                            <Shield className="w-7 h-7" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className={`text-lg font-bold transition-colors ${isAssigned ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                                                }`}>
                                                {role.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded text-xs font-bold uppercase tracking-wide">
                                                    {role.code}
                                                </span>
                                                {role.isActive && (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                        <span className="text-xs text-emerald-600 font-semibold">Active</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-3 transition-all ${isAssigned ? 'scale-110' : ''
                                        }`}>
                                        {isAssigned ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20">
                                                <CheckCircle2 className="w-5 h-5" />
                                                <span>Assigned</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold group-hover:bg-slate-200">
                                                <XCircle className="w-5 h-5" />
                                                <span>Not Assigned</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}

                        {paginatedRoles.length === 0 && (
                            <div className="py-20 flex flex-col items-center">
                                <Shield className="w-12 h-12 text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">No Roles Available</h3>
                                <p className="text-slate-400">There are no roles to assign.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {allRoles.length > 0 && <Pagination />}

                    {/* Footer Actions */}
                    <div className="bg-slate-50 border-t border-slate-200 p-6 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Changes are saved automatically when you toggle roles
                        </div>

                        <button
                            onClick={() => navigate('/admin/roles')}
                            className="px-6 py-3 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPermissionPage;
