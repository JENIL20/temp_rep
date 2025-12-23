import React, { useEffect, useState } from 'react';
import { roleApi } from '../../../api/roleApi';
import { permissionApi } from '../../../api/permissionApi';
import { Role, Permission, CreateRoleRequest } from '../../../types/role.types';
import {
    Shield,
    Plus,
    Edit2,
    Trash2,
    X,
    Check,
    Lock,
} from 'lucide-react';

const RolesManagement: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<CreateRoleRequest>({
        roleName: '',
        permissionIds: [],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesData, permissionsData] = await Promise.all([
                roleApi.list(),
                permissionApi.list(),
            ]);
            console.log('Fetched roles:', rolesData);
            console.log('Fetched permissions:', permissionsData);
            setRoles(rolesData);
            setPermissions(permissionsData);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to load data');
            // Use sample data
            setRoles(getSampleRoles());
            setPermissions(getSamplePermissions());
        } finally {
            setLoading(false);
        }
    };

    const getSampleRoles = (): Role[] => [
        {
            id: 1,
            roleName: 'Administrator',
            createdAt: '2024-01-01T00:00:00Z',
            permissions: [
                { id: 1, permissionName: 'Manage Users', createdAt: '2024-01-01T00:00:00Z' },
                { id: 2, permissionName: 'Manage Courses', createdAt: '2024-01-01T00:00:00Z' },
                { id: 3, permissionName: 'Manage Roles', createdAt: '2024-01-01T00:00:00Z' },
                { id: 4, permissionName: 'View Reports', createdAt: '2024-01-01T00:00:00Z' },
            ],
        },
        {
            id: 2,
            roleName: 'Instructor',
            createdAt: '2024-01-01T00:00:00Z',
            permissions: [
                { id: 2, permissionName: 'Manage Courses', createdAt: '2024-01-01T00:00:00Z' },
                { id: 4, permissionName: 'View Reports', createdAt: '2024-01-01T00:00:00Z' },
            ],
        },
        {
            id: 3,
            roleName: 'Student',
            createdAt: '2024-01-01T00:00:00Z',
            permissions: [
                { id: 5, permissionName: 'View Courses', createdAt: '2024-01-01T00:00:00Z' },
                { id: 6, permissionName: 'Enroll Courses', createdAt: '2024-01-01T00:00:00Z' },
            ],
        },
    ];

    const getSamplePermissions = (): Permission[] => [
        { id: 1, permissionName: 'Manage Users', createdAt: '2024-01-01T00:00:00Z' },
        { id: 2, permissionName: 'Manage Courses', createdAt: '2024-01-01T00:00:00Z' },
        { id: 3, permissionName: 'Manage Roles', createdAt: '2024-01-01T00:00:00Z' },
        { id: 4, permissionName: 'View Reports', createdAt: '2024-01-01T00:00:00Z' },
        { id: 5, permissionName: 'View Courses', createdAt: '2024-01-01T00:00:00Z' },
        { id: 6, permissionName: 'Enroll Courses', createdAt: '2024-01-01T00:00:00Z' },
        { id: 7, permissionName: 'Manage Certificates', createdAt: '2024-01-01T00:00:00Z' },
    ];

    const handleOpenModal = (role?: Role) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                roleName: role.roleName,
                permissionIds: role.permissions?.map((p) => p.id) || [],
            });
        } else {
            setEditingRole(null);
            setFormData({ roleName: '', permissionIds: [] });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRole(null);
        setFormData({ roleName: '', permissionIds: [] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await roleApi.update(editingRole.id, formData);
            } else {
                await roleApi.create(formData);
            }
            await fetchData();
            handleCloseModal();
        } catch (err: any) {
            console.error('Error saving role:', err);
            alert(err.response?.data?.message || 'Failed to save role');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;

        try {
            await roleApi.delete(id);
            await fetchData();
        } catch (err: any) {
            console.error('Error deleting role:', err);
            alert(err.response?.data?.message || 'Failed to delete role');
        }
    };

    const togglePermission = (permissionId: number) => {
        setFormData((prev) => ({
            ...prev,
            permissionIds: prev.permissionIds?.includes(permissionId)
                ? prev.permissionIds.filter((id) => id !== permissionId)
                : [...(prev.permissionIds || []), permissionId],
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-navy"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-gradient-to-r from-primary-navy to-primary-navy-light text-white rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Roles & Permissions</h1>
                            <p className="text-gray-200">Manage user roles and access control</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-white text-primary-navy px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Role
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="max-w-7xl mx-auto mb-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                        <p className="text-yellow-800">
                            <strong>Note:</strong> Showing sample data. {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Roles Grid */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300"
                        >
                            {/* Role Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary-navy/10 p-3 rounded-lg">
                                        <Shield className="w-6 h-6 text-primary-navy" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">
                                            {role.roleName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {role.permissions?.length || 0} permissions
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(role)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(role.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Permissions List */}
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Permissions:
                                </p>
                                {role.permissions && role.permissions.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {role.permissions.map((permission) => (
                                            <span
                                                key={permission.id}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-gold/10 text-secondary-gold-dark rounded-full text-xs font-medium"
                                            >
                                                <Lock className="w-3 h-3" />
                                                {permission.permissionName}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">
                                        No permissions assigned
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-primary-navy to-primary-navy-light text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    {editingRole ? 'Edit Role' : 'Create New Role'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Role Name */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Role Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.roleName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, roleName: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy"
                                    placeholder="Enter role name"
                                    required
                                />
                            </div>

                            {/* Permissions */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Permissions
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
                                    {permissions.map((permission) => (
                                        <label
                                            key={permission.id}
                                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.permissionIds?.includes(permission.id)}
                                                onChange={() => togglePermission(permission.id)}
                                                className="w-5 h-5 text-primary-navy rounded focus:ring-2 focus:ring-primary-navy"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                {permission.permissionName}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-dark transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    {editingRole ? 'Update Role' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesManagement;
