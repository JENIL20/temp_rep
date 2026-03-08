import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleApi } from '../api/roleApi';
import { userRoleApi } from '../api/userRoleApi';
import { Role } from '../types/role.types';
import {
    Shield,
    Plus,
    Edit2,
    Trash2,
    X,
    Lock,
    Layers,
    Search,
    RefreshCw,
    ShieldAlert,
    Users as UsersIcon,
    ArrowRight,
    UserCircle,
    Mail,
    ChevronLeft,
    ChevronRight,
    UserCog,
    Settings,
    Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import { confirmToast } from '@/shared/utils/confirmToast';
import PermissionGate from '../../../shared/components/auth/PermissionGate';

type MemberUser = {
    id: number;
    userName?: string;
    email?: string;
    firstName: string;
    lastName: string;
};

const RolesManagement: React.FC = () => {
    // Data State
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<MemberUser[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'roles' | 'members' | 'roleModules'>('roles');


    // Pagination State for Roles
    const [rolesPage, setRolesPage] = useState(1);
    const [rolesPageSize, setRolesPageSize] = useState(10);

    // Pagination State for Users
    const [usersPage, setUsersPage] = useState(1);
    const [usersPageSize, setUsersPageSize] = useState(10);

    // Modal State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleForm, setRoleForm] = useState({ code: '', name: '' });

    const navigate = useNavigate();




    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [rolesData, usersData] = await Promise.all([
                roleApi.list(),
                userRoleApi.listUsers()
            ]);
            console.log("Fetched rolesData:", rolesData);
            console.log("Fetched usersData:", usersData);
            setRoles(Array.isArray(rolesData) ? rolesData : []);
            setUsers(usersData?.items || []);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load roles and permissions";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await roleApi.update(editingRole.id, { name: roleForm.name });
                toast.success("Role updated successfully");
            } else {
                await roleApi.create(roleForm);
                toast.success("Role created successfully");
            }
            fetchInitialData();
            setShowRoleModal(false);
            setEditingRole(null);
            setRoleForm({ code: '', name: '' });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to save role";
            toast.error(message);
        }
    };

    const handleDeleteRole = async (id: number) => {
        const ok = await confirmToast({
            title: "Delete role?",
            message: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            toastOptions: { type: "warning" },
        });
        if (!ok) return;
        try {
            await roleApi.delete(id);
            toast.success("Role deleted");
            fetchInitialData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to delete role";
            toast.error(message);
        }
    };

    const openPermissionManager = (role: Role) => {
        navigate(`/admin/roles/${role.id}/permissions`);
    };

    const openModuleManager = (role: Role) => {
        navigate(`/admin/roles/${role.id}/modules`);
    };

    const openMemberManager = (user: MemberUser) => {
        navigate(`/admin/users/${user.id}/permissions`);
    };



    // Filter and Pagination Logic for Roles
    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalRolesPages = Math.ceil(filteredRoles.length / rolesPageSize);
    const paginatedRoles = filteredRoles.slice(
        (rolesPage - 1) * rolesPageSize,
        rolesPage * rolesPageSize
    );

    // Filter and Pagination Logic for Users
    const filteredUsers = users.filter(u =>
        u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalUsersPages = Math.ceil(filteredUsers.length / usersPageSize);
    const paginatedUsers = filteredUsers.slice(
        (usersPage - 1) * usersPageSize,
        usersPage * usersPageSize
    );

    // Pagination Component
    type PaginationProps = {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        pageSize: number;
        onPageSizeChange: (size: number) => void;
    };

    const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange }: PaginationProps) => {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200">
                <div className="flex items-center gap-3 order-2 sm:order-1">
                    <span className="text-xs text-slate-500 font-medium">Show:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none cursor-pointer hover:border-primary-navy/50 transition-colors"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-xs text-slate-400">rows per page</span>
                </div>

                <div className="flex items-center gap-1 order-1 sm:order-2">
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-navy rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title="First page"
                    >
                        <ChevronLeft className="w-4 h-4 rotate-180" />
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 text-slate-600 hover:bg-slate-100 hover:text-primary-navy rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
                                className="min-w-[32px] h-8 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                1
                            </button>
                            {startPage > 2 && <span className="text-slate-400 px-1">...</span>}
                        </>
                    )}

                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[32px] h-8 text-sm font-semibold rounded-lg transition-all duration-200 ${currentPage === page
                                ? 'bg-gradient-to-r from-primary-navy to-primary-navy-dark text-white shadow-lg shadow-primary-navy/20'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-primary-navy'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="text-slate-400 px-1">...</span>}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="min-w-[32px] h-8 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 text-slate-600 hover:bg-slate-100 hover:text-primary-navy rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-navy rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title="Last page"
                    >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                </div>

                <div className="text-sm text-slate-500 font-medium order-3 hidden sm:block">
                    Page <span className="text-primary-navy font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                </div>
            </div>
        );

    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin"></div>
                    <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-navy" />
                </div>
                <div className="mt-6 text-center">
                    <p className="text-lg font-bold text-slate-700">Loading Access Control</p>
                    <p className="text-sm text-slate-400 mt-1">Fetching security profiles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-3 lg:p-5">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-navy to-primary-navy-dark rounded-2xl flex items-center justify-center shadow-xl shadow-primary-navy/20">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Access Control <span className="text-primary-navy">Matrix</span>
                            </h1>
                            <p className="text-slate-500 mt-0.5 text-sm flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" />
                                Manage infrastructure roles, modules, and granular permissions.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchInitialData}
                            className="p-2.5 text-slate-500 hover:bg-white hover:text-primary-navy rounded-xl transition-all border border-transparent hover:border-slate-200 shadow-sm"
                            title="Refresh Data"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <PermissionGate module="ROLE_MANAGEMENT" permission="role_add">
                            <button
                                onClick={() => {
                                    setEditingRole(null);
                                    setRoleForm({ code: '', name: '' });
                                    setShowRoleModal(true);
                                }}
                                className="flex items-center gap-2 bg-gradient-to-r from-primary-navy to-primary-navy-dark hover:from-primary-navy-dark hover:to-primary-navy text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 font-semibold text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                New Role
                            </button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Tabs - Modern pill-style design */}
                <div className="flex items-center gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-2xl mb-6 border border-slate-200/60 shadow-sm">
                    <button
                        onClick={() => {
                            setActiveTab('roles');
                            setSearchTerm('');
                            setRolesPage(1);
                        }}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'roles'
                            ? 'bg-gradient-to-r from-primary-navy to-primary-navy-dark text-white shadow-lg shadow-primary-navy/25'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Shield className={`w-4 h-4 ${activeTab === 'roles' ? 'text-white' : 'text-slate-400'}`} />
                        Security Profiles
                        {activeTab === 'roles' && (
                            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-xs">
                                {filteredRoles.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('roleModules');
                            setSearchTerm('');
                            setRolesPage(1);
                        }}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'roleModules'
                            ? 'bg-gradient-to-r from-primary-navy to-primary-navy-dark text-white shadow-lg shadow-primary-navy/25'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Layers className={`w-4 h-4 ${activeTab === 'roleModules' ? 'text-white' : 'text-slate-400'}`} />
                        Role Modules
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('members');
                            setSearchTerm('');
                            setUsersPage(1);
                        }}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'members'
                            ? 'bg-gradient-to-r from-primary-navy to-primary-navy-dark text-white shadow-lg shadow-primary-navy/25'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        <UsersIcon className={`w-4 h-4 ${activeTab === 'members' ? 'text-white' : 'text-slate-400'}`} />
                        Member Assignments
                        {activeTab === 'members' && (
                            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-md text-xs">
                                {filteredUsers.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search Bar - Modern glass morphism style */}
                <div className="relative group mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary-navy transition-colors duration-200" />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'roles' || activeTab === 'roleModules' ? 'roles by name or code' : 'users by name or email'}...`}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (activeTab !== 'members') setRolesPage(1);
                            else setUsersPage(1);
                        }}
                        className="w-full bg-white/80 backdrop-blur-sm pl-12 pr-12 py-3 rounded-xl border border-slate-200/60 focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none transition-all text-sm shadow-sm hover:shadow-md focus:shadow-lg"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        {searchTerm ? (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        ) : (
                            <span className="text-xs text-slate-300 font-medium hidden sm:inline-block">⌘K</span>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                {
                    activeTab === 'roles' || activeTab === 'roleModules' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Table Header - Modern style */}
                            <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 border-b border-slate-200">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-1 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Status
                                    </div>
                                    <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Settings className="w-3 h-3" /> Code
                                    </div>
                                    <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> Role Name
                                    </div>
                                    <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Layers className="w-3 h-3" /> Description
                                    </div>
                                    <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right flex items-center justify-end gap-2">
                                        <Settings className="w-3 h-3" /> Actions
                                    </div>
                                </div>
                            </div>

                            {/* Table Body - Enhanced rows */}
                            <div className="divide-y divide-slate-50">
                                {paginatedRoles.length > 0 ? (
                                    paginatedRoles.map((role, idx) => (
                                        <div
                                            key={role.id}
                                            className={`px-5 py-3.5 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-white transition-all duration-200 group ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-30/30'}`}
                                        >
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                {/* Status - Animated indicator */}
                                                <div className="col-span-1">
                                                    {role.isActive ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                                                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Code - Badge style */}
                                                <div className="col-span-2">
                                                    <span className="inline-flex items-center px-2.5 py-1 bg-slate-100/80 text-slate-600 border border-slate-200/60 rounded-lg text-xs font-semibold uppercase tracking-wide group-hover:border-primary-navy/30 group-hover:text-primary-navy transition-colors">
                                                        {role.code}
                                                    </span>
                                                </div>

                                                {/* Role Name - With icon */}
                                                <div className="col-span-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${role.code === 'admin' ? 'bg-gradient-to-br from-red-50 to-red-100 text-red-600 group-hover:from-red-100 group-hover:to-red-200' : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 group-hover:from-primary-navy/10 group-hover:to-primary-navy/5 group-hover:text-primary-navy'}`}>
                                                            <Shield className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-slate-800 group-hover:text-primary-navy transition-colors text-sm">
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="col-span-3">
                                                    <span className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
                                                        System security profile
                                                    </span>
                                                </div>

                                                {/* Actions - Enhanced buttons */}
                                                <div className="col-span-3 flex items-center justify-end gap-2">
                                                    <PermissionGate module="ROLE_MANAGEMENT" permission="role_edit">
                                                        {activeTab === 'roleModules' ? (
                                                            <button
                                                                onClick={() => openModuleManager(role)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all font-semibold text-xs border border-slate-200 hover:border-indigo-200"
                                                            >
                                                                <Layers className="w-3.5 h-3.5" />
                                                                Modules
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => openPermissionManager(role)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-violet-50 text-slate-600 hover:text-violet-600 rounded-xl transition-all font-semibold text-xs border border-slate-200 hover:border-violet-200"
                                                            >
                                                                <Lock className="w-3.5 h-3.5" />
                                                                Permissions
                                                            </button>
                                                        )}
                                                    </PermissionGate>
                                                    <PermissionGate module="ROLE_MANAGEMENT" permission="role_edit">
                                                        <button
                                                            onClick={() => {
                                                                setEditingRole(role);
                                                                setRoleForm({ code: role.code, name: role.name });
                                                                setShowRoleModal(true);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </PermissionGate>
                                                    <PermissionGate module="ROLE_MANAGEMENT" permission="role_delete">
                                                        <button
                                                            onClick={() => handleDeleteRole(role.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </PermissionGate>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <ShieldAlert className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Roles Found</h3>
                                        <p className="text-slate-400 text-sm">Try adjusting your search parameters or create a new role.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {filteredRoles.length > 0 && (
                                <Pagination
                                    currentPage={rolesPage}
                                    totalPages={totalRolesPages}
                                    onPageChange={setRolesPage}
                                    pageSize={rolesPageSize}
                                    onPageSizeChange={setRolesPageSize}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Table Header - Modern style */}
                            <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-3.5 border-b border-slate-200">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-1 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <UserCircle className="w-3 h-3" /> Avatar
                                    </div>
                                    <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <UserCog className="w-3 h-3" /> Username
                                    </div>
                                    <div className="col-span-4 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> Email
                                    </div>
                                    <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> User ID
                                    </div>
                                    <div className="col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-right flex items-center justify-end gap-2">
                                        <Settings className="w-3 h-3" /> Actions
                                    </div>
                                </div>
                            </div>

                            {/* Table Body - Enhanced rows */}
                            <div className="divide-y divide-slate-50">
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((user, idx) => (
                                        <div
                                            key={user.id}
                                            className={`px-5 py-3.5 hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-white transition-all duration-200 group ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-30/30'}`}
                                        >
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                {/* Avatar - Enhanced with gradient */}
                                                <div className="col-span-1">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-500 group-hover:from-primary-navy/10 group-hover:to-primary-navy/5 group-hover:text-primary-navy transition-all duration-200">
                                                        <UserCircle className="w-5 h-5" />
                                                    </div>
                                                </div>

                                                {/* Username */}
                                                <div className="col-span-3">
                                                    <span className="font-bold text-slate-800 group-hover:text-primary-navy transition-colors text-sm">
                                                        {user.firstName + ' ' + user.lastName}
                                                    </span>
                                                </div>

                                                {/* Email */}
                                                <div className="col-span-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="truncate">{user.email}</span>
                                                    </div>
                                                </div>

                                                {/* User ID */}
                                                <div className="col-span-2">
                                                    <span className="text-xs font-bold text-primary-navy/50 bg-primary-navy/5 px-2 py-1 rounded-md">
                                                        #{user.id}
                                                    </span>
                                                </div>

                                                {/* Actions - Enhanced button */}
                                                <div className="col-span-2 flex items-center justify-end">
                                                    <PermissionGate module="ROLE_MANAGEMENT" permission="role_edit">
                                                        <button
                                                            onClick={() => openMemberManager(user)}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gradient-to-r hover:from-primary-navy hover:to-primary-navy-dark text-slate-600 hover:text-white border border-slate-200 hover:border-primary-navy font-semibold rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 text-xs"
                                                        >
                                                            <UserCog className="w-3.5 h-3.5" />
                                                            Assign
                                                        </button>
                                                    </PermissionGate>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <UsersIcon className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Users Found</h3>
                                        <p className="text-slate-400 text-sm">Try adjusting your search parameters.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {filteredUsers.length > 0 && (
                                <Pagination
                                    currentPage={usersPage}
                                    totalPages={totalUsersPages}
                                    onPageChange={setUsersPage}
                                    pageSize={usersPageSize}
                                    onPageSizeChange={setUsersPageSize}
                                />
                            )}
                        </div>
                    )
                }

            </div >

            {/* Role Modal - Modern glass morphism style */}
            {
                showRoleModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowRoleModal(false)}></div>
                        <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-navy to-primary-navy-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary-navy/20">
                                            <Shield className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">{editingRole ? 'Edit Profile' : 'New Security Profile'}</h2>
                                            <p className="text-xs text-slate-400">{editingRole ? 'Update role details' : 'Create a new role'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowRoleModal(false)}
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleCreateOrUpdateRole} className="p-6 space-y-5">
                                {!editingRole && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-slate-400" />
                                            System Identifier (Code)
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={roleForm.code}
                                            onChange={e => setRoleForm({ ...roleForm, code: e.target.value.toLowerCase() })}
                                            className="w-full bg-slate-50/80 border border-slate-200/60 p-3 rounded-xl focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none transition-all text-sm font-medium placeholder:text-slate-300"
                                            placeholder="e.g. cloud_admin"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-slate-400" />
                                        Display Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={roleForm.name}
                                        onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                                        className="w-full bg-slate-50/80 border border-slate-200/60 p-3 rounded-xl focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy outline-none transition-all text-sm font-medium placeholder:text-slate-300"
                                        placeholder="e.g. Cloud Administrator"
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRoleModal(false)}
                                        className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-all text-sm border border-slate-200 hover:border-slate-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-primary-navy to-primary-navy-dark text-white font-semibold rounded-xl shadow-xl shadow-primary-navy/20 active:scale-95 transition-all text-sm hover:shadow-2xl hover:shadow-primary-navy/30"
                                    >
                                        {editingRole ? 'Update Profile' : 'Create Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }


            {/* Styles */}
            <style>{`
                .transition-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div >
    );
};

export default RolesManagement;
