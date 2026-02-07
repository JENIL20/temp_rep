import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rolePermissionApi } from '../api/rolePermissionApi';

import { ModulePermission, Role } from '../types/role.types';
import {
    Shield,

    Save,
    ArrowLeft,
    Lock,
    Loader2,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';

const RolePermissionPage: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const navigate = useNavigate();

    const [role, setRole] = useState<Role | null>(null);
    const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<Record<number, number[]>>({});

    // Pagination state for modules
    const [modulesPage, setModulesPage] = useState(1);
    const [modulesPageSize, setModulesPageSize] = useState(10);

    useEffect(() => {
        if (roleId) {
            fetchRolePermissions();
        }
    }, [roleId]);

    const fetchRolePermissions = async () => {
        try {
            setLoading(true);
            const data = await rolePermissionApi.getRolePermissions(Number(roleId));

            setRole({
                id: data.roleId,
                name: data.roleName,
                code: data.roleCode,
                isActive: true
            });

            setModulePermissions(data.modulePermissions);

            // Set active module to first one
            if (data.modulePermissions.length > 0) {
                setActiveModuleId(data.modulePermissions[0].moduleId);
            }

            // Initialize selected permissions
            const initialSelected: Record<number, number[]> = {};
            data.modulePermissions.forEach(mp => {
                initialSelected[mp.moduleId] = mp.assignedPermissionIds;
            });
            setSelectedPermissions(initialSelected);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load role permissions');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (moduleId: number, permissionId: number) => {
        setSelectedPermissions(prev => {
            const current = prev[moduleId] || [];
            const updated = current.includes(permissionId)
                ? current.filter(id => id !== permissionId)
                : [...current, permissionId];

            return {
                ...prev,
                [moduleId]: updated
            };
        });
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);

            // Save permissions for each module
            const promises = Object.entries(selectedPermissions).map(([moduleId, permissionIds]) => {
                return rolePermissionApi.updateModulePermissions(
                    Number(roleId),
                    Number(moduleId),
                    permissionIds
                );
            });

            await Promise.all(promises);
            toast.success('Role permissions updated successfully!');

            // Refresh data
            await fetchRolePermissions();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    const activeModule = modulePermissions.find(mp => mp.moduleId === activeModuleId);

    // Pagination logic for modules
    const totalModulesPages = Math.ceil(modulePermissions.length / modulesPageSize);
    const paginatedModules = modulePermissions.slice(
        (modulesPage - 1) * modulesPageSize,
        modulesPage * modulesPageSize
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

        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 font-medium">Items per page:</span>
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
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading Role Permissions...</p>
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
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-navy to-primary-navy/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-navy/20">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                {role?.name}
                            </h1>
                            <p className="text-slate-500 mt-1 flex items-center gap-2">
                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wide">
                                    {role?.code}
                                </span>
                                <span>•</span>
                                <span>Configure module permissions</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Module Tabs */}
                    <div className="bg-slate-50 border-b border-slate-200 p-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                            Modules ({modulePermissions.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {paginatedModules.map((module) => (
                                <button
                                    key={module.moduleId}
                                    onClick={() => setActiveModuleId(module.moduleId)}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeModuleId === module.moduleId
                                        ? 'bg-primary-navy text-white shadow-lg shadow-primary-navy/20'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {module.moduleName}
                                </button>
                            ))}
                        </div>

                        {/* Module Pagination */}
                        {modulePermissions.length > modulesPageSize && (
                            <div className="mt-4">
                                <Pagination
                                    currentPage={modulesPage}
                                    totalPages={totalModulesPages}
                                    onPageChange={setModulesPage}
                                    pageSize={modulesPageSize}
                                    onPageSizeChange={setModulesPageSize}
                                />
                            </div>
                        )}
                    </div>

                    {/* Permissions Grid */}
                    {activeModule && (
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2 h-8 bg-primary-navy rounded-full"></div>
                                <h2 className="text-2xl font-black text-slate-800">
                                    <span className="text-primary-navy">{activeModule.moduleName}</span> Permissions
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeModule.permissions.map((permission) => {
                                    const isSelected = (selectedPermissions[activeModule.moduleId] || []).includes(permission.id);

                                    return (
                                        <button
                                            key={permission.id}
                                            onClick={() => togglePermission(activeModule.moduleId, permission.id)}
                                            className={`relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${isSelected
                                                ? 'bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-emerald-500 shadow-lg shadow-emerald-500/10'
                                                : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-emerald-500 text-white rotate-6'
                                                    : 'bg-white text-slate-400 border border-slate-200 group-hover:border-slate-300'
                                                    }`}>
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`font-bold transition-all ${isSelected ? 'text-slate-900' : 'text-slate-600'
                                                        }`}>
                                                        {permission.name}
                                                    </p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        {permission.code}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-emerald-500 text-white scale-110'
                                                : 'bg-slate-200 group-hover:bg-slate-300'
                                                }`}>
                                                {isSelected ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 text-slate-400" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {activeModule.permissions.length === 0 && (
                                <div className="py-20 flex flex-col items-center">
                                    <Lock className="w-12 h-12 text-slate-200 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900">No Permissions Available</h3>
                                    <p className="text-slate-400">This module has no configurable permissions.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!activeModule && modulePermissions.length > 0 && (
                        <div className="py-20 flex flex-col items-center">
                            <Shield className="w-12 h-12 text-slate-200 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Select a Module</h3>
                            <p className="text-slate-400">Choose a module from the tabs above to configure permissions.</p>
                        </div>
                    )}

                    {modulePermissions.length === 0 && (
                        <div className="py-20 flex flex-col items-center">
                            <Shield className="w-12 h-12 text-slate-200 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">No Modules Assigned</h3>
                            <p className="text-slate-400">This role has no modules assigned yet.</p>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="bg-slate-50 border-t border-slate-200 p-6 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            <span className="font-semibold">
                                {Object.values(selectedPermissions).flat().length}
                            </span> permissions selected across{' '}
                            <span className="font-semibold">{modulePermissions.length}</span> modules
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/admin/roles')}
                                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RolePermissionPage;
