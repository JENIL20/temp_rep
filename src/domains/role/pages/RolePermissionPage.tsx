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

    ChevronDown,
    ChevronUp,
    CheckSquare,
    Square,
} from 'lucide-react';
import { toast } from 'react-toastify';

const RolePermissionPage: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const navigate = useNavigate();

    const [role, setRole] = useState<Role | null>(null);
    const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<Record<number, number[]>>({});


    // Track which module sections are collapsed (all expanded by default)
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});


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
                isActive: true,
            });

            setModulePermissions(data.modulePermissions);

            // Initialize selected permissions
            const initialSelected: Record<number, number[]> = {};
            data.modulePermissions.forEach(mp => {
                initialSelected[mp.moduleId] = [...mp.assignedPermissionIds];
            });
            setSelectedPermissions(initialSelected);

            // All sections expanded by default
            const initialCollapsed: Record<number, boolean> = {};
            data.modulePermissions.forEach(mp => {
                initialCollapsed[mp.moduleId] = false;
            });
            setCollapsed(initialCollapsed);
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
            return { ...prev, [moduleId]: updated };
        });
    };

    const selectAll = (moduleId: number, permissionIds: number[]) => {
        setSelectedPermissions(prev => ({ ...prev, [moduleId]: [...permissionIds] }));
    };

    const clearAll = (moduleId: number) => {
        setSelectedPermissions(prev => ({ ...prev, [moduleId]: [] }));
    };

    const toggleCollapse = (moduleId: number) => {
        setCollapsed(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);
            const promises = Object.entries(selectedPermissions).map(([moduleId, permissionIds]) =>
                rolePermissionApi.updateModulePermissions(Number(roleId), Number(moduleId), permissionIds)
            );
            await Promise.all(promises);
            toast.success('Role permissions updated successfully!');
            await fetchRolePermissions();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    const totalSelected = Object.values(selectedPermissions).flat().length;
    const totalPermissions = modulePermissions.reduce((acc, mp) => acc + mp.permissions.length, 0);

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
                    <div className="w-16 h-16 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
                    <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-navy" />
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading Role Permissions...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">

                {/* ── Header ────────────────────────────────────────── */}
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
                                <span>Configure permissions by category</span>
                            </p>
                        </div>
                    </div>
                </div>


                {/* ── Sticky summary bar ────────────────────────────── */}
                <div className="sticky top-4 z-10 mb-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-lg px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Selected</p>
                                <p className="text-2xl font-extrabold text-primary-navy">
                                    {totalSelected}
                                    <span className="text-slate-300 font-normal text-lg"> / {totalPermissions}</span>
                                </p>
                            </div>
                            <div className="h-10 w-px bg-slate-200" />
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Categories</p>
                                <p className="text-2xl font-extrabold text-slate-700">{modulePermissions.length}</p>
                            </div>

                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/admin/roles')}

                                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all text-sm"

                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={saving}
                                className="flex items-center gap-2 px-7 py-2.5 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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

                {/* ── Empty state ───────────────────────────────────── */}
                {modulePermissions.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 py-24 flex flex-col items-center">
                        <Shield className="w-14 h-14 text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No Modules Assigned</h3>
                        <p className="text-slate-400 mt-1">This role has no modules assigned yet.</p>
                    </div>
                )}

                {/* ── Category sections ─────────────────────────────── */}
                <div className="space-y-4">
                    {modulePermissions.map((module, index) => {
                        const selected = selectedPermissions[module.moduleId] || [];
                        const allSelected = module.permissions.length > 0 && selected.length === module.permissions.length;
                        const someSelected = selected.length > 0 && !allSelected;
                        const isCollapsed = collapsed[module.moduleId] ?? false;

                        // Assign a distinct accent colour per category index
                        const accents = [
                            { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', ring: 'ring-blue-400', dot: 'bg-blue-500' },
                            { bg: 'from-violet-500 to-violet-600', light: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', ring: 'ring-violet-400', dot: 'bg-violet-500' },
                            { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-400', dot: 'bg-emerald-500' },
                            { bg: 'from-amber-500 to-amber-600', light: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', ring: 'ring-amber-400', dot: 'bg-amber-500' },
                            { bg: 'from-rose-500 to-rose-600', light: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700', ring: 'ring-rose-400', dot: 'bg-rose-500' },
                            { bg: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-700', ring: 'ring-cyan-400', dot: 'bg-cyan-500' },
                        ];
                        const accent = accents[index % accents.length];

                        return (
                            <div
                                key={module.moduleId}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all"
                            >
                                {/* ── Category header ── */}
                                <button
                                    onClick={() => toggleCollapse(module.moduleId)}
                                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Coloured icon */}
                                        <div className={`w-12 h-12 bg-gradient-to-br ${accent.bg} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                                            <Lock className="w-6 h-6 text-white" />
                                        </div>

                                        <div className="text-left">
                                            <h2 className="text-lg font-extrabold text-slate-900">
                                                {module.moduleName}
                                            </h2>
                                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                                                {module.moduleCode}
                                            </p>
                                        </div>

                                        {/* Selected badge */}
                                        <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${accent.badge}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                                            {selected.length} / {module.permissions.length} selected
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Progress pill */}
                                        <div className="hidden md:flex items-center gap-2">
                                            <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${accent.bg} rounded-full transition-all`}
                                                    style={{ width: module.permissions.length ? `${(selected.length / module.permissions.length) * 100}%` : '0%' }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">
                                                {module.permissions.length ? Math.round((selected.length / module.permissions.length) * 100) : 0}%
                                            </span>
                                        </div>

                                        {isCollapsed
                                            ? <ChevronDown className="w-5 h-5 text-slate-400" />
                                            : <ChevronUp className="w-5 h-5 text-slate-400" />
                                        }
                                    </div>
                                </button>

                                {/* ── Permissions body ── */}
                                {!isCollapsed && (
                                    <div className={`border-t border-slate-100 ${accent.light} px-6 py-5`}>

                                        {/* Select-all / Clear row */}
                                        {module.permissions.length > 0 && (
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                    Permissions
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => selectAll(module.moduleId, module.permissions.map(p => p.id))}
                                                        disabled={allSelected}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        <CheckSquare className="w-3.5 h-3.5" />
                                                        Select All
                                                    </button>
                                                    <button
                                                        onClick={() => clearAll(module.moduleId)}
                                                        disabled={selected.length === 0}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        <Square className="w-3.5 h-3.5" />
                                                        Clear All
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Permission cards */}
                                        {module.permissions.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {module.permissions.map(permission => {
                                                    const isSelected = selected.includes(permission.id);
                                                    return (
                                                        <button
                                                            key={permission.id}
                                                            onClick={() => togglePermission(module.moduleId, permission.id)}
                                                            className={`relative flex items-center justify-between p-4 rounded-xl border-2 transition-all group text-left
                                                                ${isSelected
                                                                    ? 'bg-white border-emerald-400 shadow-md shadow-emerald-500/10'
                                                                    : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                                                                    ${isSelected
                                                                        ? 'bg-emerald-500 text-white rotate-3 shadow-sm'
                                                                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                                                    }`}>
                                                                    <Lock className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <p className={`font-bold text-sm transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                                                        {permission.name}
                                                                    </p>
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                        {permission.code}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Tick / X */}
                                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                                                                ${isSelected
                                                                    ? 'bg-emerald-500 text-white scale-110'
                                                                    : 'bg-slate-100 text-slate-300 group-hover:bg-slate-200'
                                                                }`}>
                                                                {isSelected
                                                                    ? <CheckCircle2 className="w-4 h-4" />
                                                                    : <XCircle className="w-4 h-4" />
                                                                }
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-10 flex flex-col items-center">
                                                <Lock className="w-10 h-10 text-slate-200 mb-3" />
                                                <p className="text-sm font-bold text-slate-500">No permissions available for this module.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Bottom spacer so sticky bar doesn't overlap last card ── */}
                <div className="h-8" />
            </div>
        </div>
    );
};

export default RolePermissionPage;
