import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Search,
    MoreHorizontal,
    Shield,
    UserPlus,
    UserMinus,
    ChevronLeft,
    ChevronRight,
    X,
    Mail,
    Phone
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
    const [userRolesForm, setUserRolesForm] = useState<number[]>([]);
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
        } catch (err: any) {
            toast.error(err.message || "Failed to load users");
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
        try {
            const userRoles = await userRoleApi.getUserRoles(user.id);
            setUserRolesForm(userRoles.map(r => r.id));
            setShowRoleModal(true);
            setActiveDropdown(null);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleToggleUserRole = async (roleId: number) => {
        if (!selectedUser) return;

        const isAssigned = userRolesForm.includes(roleId);

        try {
            if (isAssigned) {
                await userRoleApi.remove(selectedUser.id, roleId);
                setUserRolesForm(prev => prev.filter(id => id !== roleId));
                toast.success("Role removed");
            } else {
                await userRoleApi.assign({ userId: selectedUser.id, roleId });
                setUserRolesForm(prev => [...prev, roleId]);
                toast.success("Role assigned");
            }
            // Refresh users to update their role badges in the list
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
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
                                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary-navy focus:ring-4 focus:ring-primary-navy/10 outline-none transition-all"
                                />
                            </div>
                            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-navy text-white text-sm font-semibold rounded-lg hover:bg-primary-navy-light transition-colors shadow-sm shadow-primary-navy/20">
                                <UserPlus size={16} />
                                <span>Add User</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <Users size={24} />
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
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Roles</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 border border-gray-200">
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
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.isActive
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                            {user.email}
                                                        </div>
                                                        {user.mobile && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                                {user.mobile}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
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
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600">
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
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
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
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
                                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pageState.pageNumber === num
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
            {showRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowRoleModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-bottom border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">Manage Roles</h3>
                            <button onClick={() => setShowRoleModal(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                                    {selectedUser?.firstName[0]}{selectedUser?.lastName[0]}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{selectedUser?.firstName} {selectedUser?.lastName}</h4>
                                    <p className="text-sm text-gray-600">@{selectedUser?.userName}</p>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available Roles</p>
                                {roles.map(role => {
                                    const isAssigned = userRolesForm.includes(role.roleId);
                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => handleToggleUserRole(role.roleId)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isAssigned
                                                ? 'bg-primary-navy/5 border-primary-navy shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isAssigned ? 'bg-primary-navy text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    <Shield size={16} />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`font-semibold ${isAssigned ? 'text-primary-navy' : 'text-gray-900'}`}>{role.roleName}</p>
                                                    <p className="text-xs text-gray-500">{role.roleCode}</p>
                                                </div>
                                            </div>

                                            {isAssigned ? (
                                                <div className="text-primary-navy">
                                                    <UserMinus size={18} />
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 group-hover:text-primary-navy">
                                                    <UserPlus size={18} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
