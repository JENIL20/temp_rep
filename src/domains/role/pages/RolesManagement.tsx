import React, { useEffect, useState } from 'react';
import { roleApi } from '../api/roleApi';
import { permissionApi } from '../api/permissionApi';
import { moduleApi } from '../api/moduleApi';
import { userRoleApi } from '../api/userRoleApi';
import { Role, Permission, Module, AssignPermissionRequest } from '../types/role.types';
import {
    Shield,
    Plus,
    Edit2,
    Trash2,
    X,
    Check,
    Lock,
    Settings,
    Layout,
    ChevronRight,
    Search,
    RefreshCw,
    ShieldAlert,
    Users as UsersIcon,
    UserPlus,
    UserMinus,
    ArrowRight,
    UserCircle,
<<<<<<< HEAD
    Mail,
    ChevronLeft
=======
    Mail
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
} from 'lucide-react';
import { toast } from 'react-toastify';

const RolesManagement: React.FC = () => {
    // Data State
    const [roles, setRoles] = useState<Role[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'roles' | 'members'>('roles');

<<<<<<< HEAD
    // Pagination State for Roles
    const [rolesPage, setRolesPage] = useState(1);
    const [rolesPageSize, setRolesPageSize] = useState(10);

    // Pagination State for Users
    const [usersPage, setUsersPage] = useState(1);
    const [usersPageSize, setUsersPageSize] = useState(10);

=======
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
    // Modal State
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);

    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<Role | null>(null);
    const [selectedModuleForPerms, setSelectedModuleForPerms] = useState<Module | null>(null);
    const [selectedUserForRoles, setSelectedUserForRoles] = useState<any | null>(null);

    // Form State
    const [roleForm, setRoleForm] = useState({ code: '', name: '' });
    const [modulePermsForm, setModulePermsForm] = useState<number[]>([]);
    const [userRolesForm, setUserRolesForm] = useState<number[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [rolesData, modulesData, permsData, usersData] = await Promise.all([
                roleApi.list(),
                moduleApi.listAll(),
                permissionApi.list(),
                userRoleApi.listUsers()
            ]);
            setRoles(Array.isArray(rolesData) ? rolesData : []);
            setModules(Array.isArray(modulesData) ? modulesData : []);
            setAllPermissions(Array.isArray(permsData) ? permsData : []);
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
        setSelectedRoleForPerms(role);
        setShowPermissionModal(true);
        setSelectedModuleForPerms(null);
        setModulePermsForm([]);
<<<<<<< HEAD
    };

    const handleModuleSelect = async (module: Module) => {
        setSelectedModuleForPerms(module);
        setModulePermsForm([]);
    };

    const togglePermissionInForm = (permId: number) => {
        setModulePermsForm(prev =>
            prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
        );
    };

    const handleAssignPermissions = async () => {
        if (!selectedRoleForPerms || !selectedModuleForPerms) return;
        try {
            const request: AssignPermissionRequest = {
                roleId: selectedRoleForPerms.id,
                moduleId: selectedModuleForPerms.id,
                permissionIds: modulePermsForm
            };
            await moduleApi.assignPermissions(request);
            toast.success("Permissions assigned successfully");
            setShowPermissionModal(false);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const openMemberManager = async (user: any) => {
        setSelectedUserForRoles(user);
        try {
            const userRoles = await userRoleApi.getUserRoles(user.id);
            setUserRolesForm(userRoles.map(r => r.id));
            setShowMemberModal(true);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleToggleUserRole = async (roleId: number) => {
        if (!selectedUserForRoles) return;
        const isAssigned = userRolesForm.includes(roleId);

        try {
            if (isAssigned) {
                await userRoleApi.remove(selectedUserForRoles.id, roleId);
                setUserRolesForm(prev => prev.filter(id => id !== roleId));
                toast.info("Role removed from user");
            } else {
                await userRoleApi.assign({ userId: selectedUserForRoles.id, roleId });
                setUserRolesForm(prev => [...prev, roleId]);
                toast.success("Role assigned to user");
            }
        } catch (err: any) {
            toast.error(err.message);
        }
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
=======
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
    };
    const togglePermissionInForm = (permissionId: number) => {
        setModulePermsForm(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    }

    const handleModuleSelect = async (module: Module) => {
        setSelectedModuleForPerms(module);
        setModulePermsForm([]);
    };
    console.log("modulePermsForm", modulePermsForm);
    console.log("selected module", selectedModuleForPerms);
    const handleAssignPermissions = async () => {
        if (!selectedRoleForPerms || !selectedModuleForPerms) return;
        try {
            const request: AssignPermissionRequest = {
                roleId: selectedRoleForPerms.id,
                moduleId: selectedModuleForPerms.id,
                permissionIds: modulePermsForm
            };
            await moduleApi.assignPermissions(request);
            toast.success("Permissions assigned successfully");
            setShowPermissionModal(false);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const openMemberManager = async (user: any) => {
        setSelectedUserForRoles(user);
        try {
            const userRoles = await userRoleApi.getUserRoles(user.id);
            console.log("userRoles", userRoles);
            setUserRolesForm(userRoles.map(r => r.id));
            setShowMemberModal(true);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleToggleUserRole = async (roleId: number) => {
        if (!selectedUserForRoles) return;
        const isAssigned = userRolesForm.includes(roleId);
        console.log(userRolesForm, `Toggling role ${roleId} for user ${selectedUserForRoles.id}. Currently assigned: ${isAssigned}`);

        try {
            if (isAssigned) {
                await userRoleApi.remove(selectedUserForRoles.id, roleId);
                setUserRolesForm(prev => prev.filter(id => id !== roleId));
                toast.info("Role removed from user");
            } else {
                await userRoleApi.assign({ userId: selectedUserForRoles.id, roleId });
                setUserRolesForm(prev => [...prev, roleId]);
                toast.success("Role assigned to user");
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
<<<<<<< HEAD
                        onClick={() => {
                            setActiveTab('roles');
                            setSearchTerm('');
                            setRolesPage(1);
                        }}
=======
                        onClick={() => setActiveTab('roles')}
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-white text-primary-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Shield className="w-4 h-4" />
                        Security Profiles
                    </button>
                    <button
<<<<<<< HEAD
                        onClick={() => {
                            setActiveTab('members');
                            setSearchTerm('');
                            setUsersPage(1);
                        }}
=======
                        onClick={() => setActiveTab('members')}
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'members' ? 'bg-white text-primary-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <UsersIcon className="w-4 h-4" />
                        Member Assignments
                    </button>
                </div>

<<<<<<< HEAD
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
                {activeTab === 'roles' ? (
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
                )}
=======
                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar - Statistics & Filters */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl transition-hover hover:bg-slate-100 cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="font-semibold text-slate-600">Roles</span>
                                    </div>
                                    <span className="text-xl font-bold text-slate-900">{roles.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl transition-hover hover:bg-slate-100 cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                            <Layout className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <span className="font-semibold text-slate-600">Modules</span>
                                    </div>
                                    <span className="text-xl font-bold text-slate-900">{modules.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl transition-hover hover:bg-slate-100 cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <UsersIcon className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <span className="font-semibold text-slate-600">Users</span>
                                    </div>
                                    <span className="text-xl font-bold text-slate-900">{users.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-navy transition-colors" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-navy/5 focus:border-primary-navy outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Content Pane */}
                    <div className="lg:col-span-9">
                        {activeTab === 'roles' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredRoles.map((role) => (
                                    <div key={role.id} className="group relative bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-navy opacity-[0.02] rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:-rotate-6 ${role.code === 'admin' ? 'bg-red-50 text-red-600 shadow-red-100' : 'bg-slate-100 text-slate-600 shadow-slate-100'} group-hover:bg-primary-navy group-hover:text-white group-hover:shadow-primary-navy/20`}>
                                                    <Shield className="w-7 h-7" />
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => { setEditingRole(role); setRoleForm({ code: role.code, name: role.name }); setShowRoleModal(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteRole(role.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-navy transition-colors">{role.name}</h3>
                                                    {role.isActive && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
                                                </div>
                                                <span className="inline-block px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-widest">{role.code}</span>
                                            </div>
                                            <button onClick={() => openPermissionManager(role)} className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-2xl border border-dashed border-slate-200 hover:border-solid hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300">
                                                <Lock className="w-4 h-4" /> Manage Access <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">Platform Users</h3>
                                        <p className="text-slate-400 text-sm font-medium">Assign security profiles to members.</p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
                                        <UsersIcon className="w-6 h-6 text-slate-400" />
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {filteredUsers.map(user => (
                                        <div key={user.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-[1.25rem] flex items-center justify-center text-slate-400 transition-transform group-hover:scale-105">
                                                    <UserCircle className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-primary-navy transition-colors">{user.userName}</h4>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                                            <Mail className="w-3.5 h-3.5" /> {user.email}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span className="text-[10px] font-black text-primary-navy/40 uppercase tracking-widest">UID: {user.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => openMemberManager(user)}
                                                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-primary-navy text-slate-600 hover:text-white border border-slate-200 hover:border-primary-navy font-bold rounded-2xl shadow-sm transition-all duration-300 active:scale-95 group-hover:shadow-md"
                                            >
                                                Assign Roles <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <div className="py-20 flex flex-col items-center">
                                            <ShieldAlert className="w-12 h-12 text-slate-200 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-900">No Users Detected</h3>
                                            <p className="text-slate-400">Try broading your search parameters.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
            </div>

            {/* Role Modal */}
            {showRoleModal && (
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
            )}

            {/* Permission Manager Modal */}
            {showPermissionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowPermissionModal(false)}></div>
                    <div className="relative bg-[#F8FAFC] w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-navy rounded-2xl flex items-center justify-center text-white shadow-lg"><Lock className="w-6 h-6" /></div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Access Privileges</h2>
                                    <p className="text-slate-400 text-sm font-medium">Configuring: <span className="text-slate-800 font-bold underline decoration-primary-navy/30 underline-offset-4">{selectedRoleForPerms?.name}</span></p>
                                </div>
                            </div>
                            <button onClick={() => setShowPermissionModal(false)} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 flex items-center justify-center rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-grow flex overflow-hidden">
                            <div className="w-1/3 border-r border-slate-100 bg-white overflow-y-auto custom-scrollbar">
                                <div className="p-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Operational Modules</h3>
                                    <div className="space-y-2">
                                        {modules.map(module => (
                                            <button key={module.id} onClick={() => handleModuleSelect(module)} className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${selectedModuleForPerms?.id === module.id ? 'bg-primary-navy text-white shadow-xl shadow-primary-navy/20' : 'hover:bg-slate-50 text-slate-600'}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedModuleForPerms?.id === module.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}><Layout className="w-5 h-5" /></div>
                                                    <div><p className="font-bold leading-tight">{module.name}</p><p className={`text-[10px] font-bold uppercase tracking-tighter ${selectedModuleForPerms?.id === module.id ? 'text-white/60' : 'text-slate-400'}`}>{module.code}</p></div>
                                                </div>
                                                <ChevronRight className={`w-5 h-5 transition-transform ${selectedModuleForPerms?.id === module.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100 translate-x-0'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto custom-scrollbar p-8">
<<<<<<< HEAD
=======
                                {console.log("Rendering permissions for module:", selectedModuleForPerms)}
>>>>>>> 924b8b78288db38f5f08c997d5af64470735c093
                                {selectedModuleForPerms ? (
                                    <div className="max-w-2xl mx-auto">
                                        <div className="flex items-center gap-3 mb-8"><div className="w-2 h-8 bg-primary-navy rounded-full"></div><h3 className="text-2xl font-black text-slate-800">Assign <span className="text-primary-navy">Permissions</span></h3></div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {allPermissions.map(perm => {
                                                const isChecked = modulePermsForm.includes(perm.id);
                                                return (
                                                    <label key={perm.id} className={`relative flex items-center justify-between p-5 rounded-3xl border-2 transition-all cursor-pointer group ${isChecked ? 'bg-white border-primary-navy shadow-lg shadow-primary-navy/5' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isChecked ? 'bg-primary-navy text-white rotate-6' : 'bg-white text-slate-400 border border-slate-100'}`}><Lock className="w-5 h-5" /></div>
                                                            <div><p className={`font-bold transition-all ${isChecked ? 'text-slate-900' : 'text-slate-500'}`}>{perm.name}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{perm.code}</p></div>
                                                        </div>
                                                        <div className="relative"><input type="checkbox" className="sr-only" checked={isChecked} onChange={() => togglePermissionInForm(perm.id)} />
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-200 group-hover:bg-slate-300'}`}>{isChecked && <Check className="w-5 h-5 animate-in zoom-in duration-300" />}</div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center"><div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-bounce duration-1000"><Settings className="w-12 h-12 text-slate-300" /></div><h3 className="text-xl font-black text-slate-900">Module Blueprint Selection</h3><p className="text-slate-400 max-w-xs mt-2 font-medium">Please select a functional module from the left panel to begin mapping granular security tokens.</p></div>
                                )}
                            </div>
                        </div>
                        <div className="bg-white p-8 border-t border-slate-100 flex items-center justify-end gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                            <button onClick={() => setShowPermissionModal(false)} className="px-8 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                            <button disabled={!selectedModuleForPerms} onClick={handleAssignPermissions} className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-2xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-30">Deploy Token Matrix</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Member Management Modal */}
            {showMemberModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowMemberModal(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><UserCircle className="w-8 h-8" /></div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Profile Authorization</h2>
                                        <p className="text-slate-400 font-medium">Updating: <span className="font-bold text-slate-800">{selectedUserForRoles?.userName}</span></p>
                                    </div>
                                </div>
                                <button onClick={() => setShowMemberModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Available Security Profiles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {roles.map(role => {
                                        const isAssigned = userRolesForm.includes(role.id);
                                        return (
                                            <button
                                                key={role.id}
                                                onClick={() => handleToggleUserRole(role.id)}
                                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${isAssigned ? 'bg-primary-navy border-primary-navy text-white shadow-lg shadow-primary-navy/20' : 'bg-slate-50 border-transparent hover:border-slate-200 text-slate-700'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Shield className={`w-5 h-5 ${isAssigned ? 'text-white' : 'text-slate-400'}`} />
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm leading-tight">{role.name}</p>
                                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isAssigned ? 'text-white/60' : 'text-slate-400'}`}>{role.code}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isAssigned ? 'bg-white/20 text-white' : 'bg-white text-slate-300 border border-slate-100 shadow-sm'}`}>
                                                    {isAssigned ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <button
                                    onClick={() => setShowMemberModal(false)}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                                >
                                    Finish & Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .transition-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div>
    );
};

export default RolesManagement;
