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
    Search,
    RefreshCw,
    ShieldAlert,
    Users as UsersIcon,
    ArrowRight,
    UserCircle,
    Mail,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';

const RolesManagement: React.FC = () => {
    // Data State
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'roles' | 'members'>('roles');


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
        } catch (err: any) {
            toast.error(err.message || "Failed to load roles and permissions");
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
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDeleteRole = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;
        try {
            await roleApi.delete(id);
            toast.success("Role deleted");
            fetchInitialData();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const openPermissionManager = (role: Role) => {
        navigate(`/admin/roles/${role.id}/permissions`);
    };

    const openMemberManager = async (user: any) => {
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
    const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange }: any) => {
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
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1);
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
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 text-slate-600 hover:bg-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
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
                            onClick={() => onPageChange(page)}
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
                                onClick={() => onPageChange(totalPages)}
                                className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-white rounded-lg transition-all"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
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
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Initializing Security Framework...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Access Control <span className="text-primary-navy">Matrix</span>
                        </h1>
                        <p className="text-slate-500 mt-1">Manage infrastructure roles, modules, and granular permissions.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchInitialData}
                            className="p-2.5 text-slate-600 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
                            title="Refresh Data"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                setEditingRole(null);
                                setRoleForm({ code: '', name: '' });
                                setShowRoleModal(true);
                            }}
                            className="flex items-center gap-2 bg-primary-navy hover:bg-primary-navy-dark text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            New Role
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1.5 bg-slate-100 w-fit rounded-2xl mb-8 border border-slate-200">
                    <button

                        onClick={() => {
                            setActiveTab('roles');
                            setSearchTerm('');
                            setRolesPage(1);
                        }}

                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-white text-primary-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Shield className="w-4 h-4" />
                        Security Profiles
                    </button>
                    <button

                        onClick={() => {
                            setActiveTab('members');
                            setSearchTerm('');
                            setUsersPage(1);
                        }}

                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'members' ? 'bg-white text-primary-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <UsersIcon className="w-4 h-4" />
                        Member Assignments
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative group mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-navy transition-colors" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'roles' ? 'roles' : 'users'}...`}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (activeTab === 'roles') setRolesPage(1);
                            else setUsersPage(1);
                        }}
                        className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-navy/5 focus:border-primary-navy outline-none transition-all"
                    />
                </div>

                {/* Content Area */}
                {
                    activeTab === 'roles' ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider">Status</div>
                                    <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-wider">Code</div>
                                    <div className="col-span-3 text-xs font-black text-slate-400 uppercase tracking-wider">Role Name</div>
                                    <div className="col-span-3 text-xs font-black text-slate-400 uppercase tracking-wider">Description</div>
                                    <div className="col-span-3 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</div>
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-slate-100">
                                {paginatedRoles.length > 0 ? (
                                    paginatedRoles.map((role) => (
                                        <div key={role.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                {/* Status */}
                                                <div className="col-span-1">
                                                    {role.isActive ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Code */}
                                                <div className="col-span-2">
                                                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                        {role.code}
                                                    </span>
                                                </div>

                                                {/* Role Name */}
                                                <div className="col-span-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role.code === 'admin' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                                            <Shield className="w-5 h-5" />
                                                        </div>
                                                        <span className="font-bold text-slate-900 group-hover:text-primary-navy transition-colors">
                                                            {role.name}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="col-span-3">
                                                    <span className="text-sm text-slate-500">
                                                        System security profile
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="col-span-3 flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openPermissionManager(role)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-primary-navy text-slate-600 hover:text-white rounded-xl transition-all font-semibold text-sm"
                                                    >
                                                        <Lock className="w-4 h-4" />
                                                        Permissions
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingRole(role);
                                                            setRoleForm({ code: role.code, name: role.name });
                                                            setShowRoleModal(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 flex flex-col items-center">
                                        <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-900">No Roles Found</h3>
                                        <p className="text-slate-400">Try adjusting your search parameters.</p>
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
                                                    <div className="w-10 h-10 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-400">
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
                                                        onClick={() => openMemberManager(user)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-primary-navy text-slate-600 hover:text-white border border-slate-200 hover:border-primary-navy font-bold rounded-xl shadow-sm transition-all duration-300"
                                                    >
                                                        Assign Roles <ArrowRight className="w-4 h-4" />
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

            {/* Role Modal */}
            {
                showRoleModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowRoleModal(false)}></div>
                        <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-slate-900">{editingRole ? 'Edit Profile' : 'New Security Profile'}</h2>
                                    <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                                </div>
                                <form onSubmit={handleCreateOrUpdateRole} className="space-y-6">
                                    {!editingRole && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">System Identifier (Code)</label>
                                            <input type="text" required value={roleForm.code} onChange={e => setRoleForm({ ...roleForm, code: e.target.value.toLowerCase() })} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-primary-navy/5 focus:border-primary-navy outline-none transition-all" placeholder="e.g. cloud_admin" />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Display Title</label>
                                        <input type="text" required value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-4 focus:ring-primary-navy/5 focus:border-primary-navy outline-none transition-all" placeholder="e.g. Cloud Administrator" />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setShowRoleModal(false)} className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all">Dismiss</button>
                                        <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all">Save Changes</button>
                                    </div>
                                </form>
                            </div>
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
