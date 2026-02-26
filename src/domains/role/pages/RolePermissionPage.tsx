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
    CheckSquare,
    Square,
    ChevronRight as ChevronRightIcon,
    Check,
} from 'lucide-react';
import { toast } from 'react-toastify';

const MODULE_ACCENTS = [
    { gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', bar: 'bg-blue-500' },
    { gradient: 'from-violet-500 to-violet-600', light: 'bg-violet-50', badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', bar: 'bg-violet-500' },
    { gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
    { gradient: 'from-amber-500 to-amber-600', light: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', bar: 'bg-amber-500' },
    { gradient: 'from-rose-500 to-rose-600', light: 'bg-rose-50', badge: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500', bar: 'bg-rose-500' },
    { gradient: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-50', badge: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500', bar: 'bg-cyan-500' },
    { gradient: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500', bar: 'bg-indigo-500' },
    { gradient: 'from-pink-500 to-pink-600', light: 'bg-pink-50', badge: 'bg-pink-100 text-pink-700', dot: 'bg-pink-500', bar: 'bg-pink-500' },
];

const RolePermissionPage: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const navigate = useNavigate();

    const [role, setRole] = useState<Role | null>(null);
    const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<Record<number, number[]>>({});
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (roleId) fetchRolePermissions();
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

            // Initialize selected permissions from API response
            const initialSelected: Record<number, number[]> = {};
            data.modulePermissions.forEach(mp => {
                initialSelected[mp.moduleId] = [...mp.assignedPermissionIds];
            });
            setSelectedPermissions(initialSelected);

            // All sections expanded by default
            const initialCollapsed: Record<number, boolean> = {};
            data.modulePermissions.forEach(mp => { initialCollapsed[mp.moduleId] = false; });
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
                    <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-navy" />
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading Role Permissions...</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#F8FAFC] flex flex-col">

            {/* ── Top Header Bar ──────────────────────────────────── */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/roles')}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-navy transition-colors group text-sm font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Roles
                    </button>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br from-primary-navy to-primary-navy/70 rounded-xl flex items-center justify-center shadow-md shadow-primary-navy/20`}>
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">{role?.name}</h1>
                            <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">{role?.code}</p>
                        </div>
                    </div>
                </div>

                {/* Stats + Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Selected</p>
                            <p className="text-xl font-extrabold text-primary-navy leading-none">
                                {totalSelected}
                                <span className="text-slate-300 font-normal text-sm"> / {totalPermissions}</span>
                            </p>
                        </div>
                        <div className="h-10 w-px bg-slate-200" />
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Modules</p>
                            <p className="text-xl font-extrabold text-slate-700 leading-none">{modulePermissions.length}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/admin/roles')}
                            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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

            {/* ── Content ─────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">

                {/* Empty state */}
                {modulePermissions.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-24 flex flex-col items-center">
                        <Shield className="w-14 h-14 text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No Modules Assigned</h3>
                        <p className="text-slate-400 mt-1 text-sm">This role has no modules assigned yet.</p>
                    </div>
                )}

                {/* Module Table */}
                {modulePermissions.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                        {/* Table header */}
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
                            <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-3 text-xs font-black text-slate-400 uppercase tracking-wider">Module</div>
                                <div className="col-span-7 text-xs font-black text-slate-400 uppercase tracking-wider">Permissions</div>
                                <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Quick Actions</div>
                            </div>
                        </div>

                        {/* Table rows */}
                        <div className="divide-y divide-slate-100">
                            {modulePermissions.map((module, index) => {
                                const selected = selectedPermissions[module.moduleId] || [];
                                const allSelected = module.permissions.length > 0 && selected.length === module.permissions.length;
                                const isCollapsed = collapsed[module.moduleId] ?? false;
                                const accent = MODULE_ACCENTS[index % MODULE_ACCENTS.length];
                                const pct = module.permissions.length
                                    ? Math.round((selected.length / module.permissions.length) * 100)
                                    : 0;

                                return (
                                    <div key={module.moduleId} className="group">
                                        {/* Module row */}
                                        <div className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50/60 transition-colors">

                                            {/* Module info */}
                                            <div className="col-span-3 flex items-center gap-3">
                                                <div className={`w-10 h-10 bg-gradient-to-br ${accent.gradient} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                                                    <Lock className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-extrabold text-slate-900 text-sm leading-tight truncate">{module.moduleName}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{module.moduleCode}</p>
                                                    {/* Progress bar */}
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${accent.bar} rounded-full transition-all duration-300`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400">{pct}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Permissions inline chips */}
                                            <div className="col-span-7">
                                                {module.permissions.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {module.permissions.map(permission => {
                                                            const isSelected = selected.includes(permission.id);
                                                            return (
                                                                <button
                                                                    key={permission.id}
                                                                    onClick={() => togglePermission(module.moduleId, permission.id)}
                                                                    title={permission.code}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all select-none
                                                                        ${isSelected
                                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                                                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-700'
                                                                        }`}
                                                                >
                                                                    {isSelected
                                                                        ? <Check className="w-3 h-3" />
                                                                        : <span className="w-3 h-3 border border-slate-300 rounded-sm inline-block" />
                                                                    }
                                                                    {permission.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No permissions defined for this module.</span>
                                                )}

                                                {/* Collapsed indicator */}
                                                {isCollapsed && module.permissions.length > 0 && (
                                                    <button
                                                        onClick={() => toggleCollapse(module.moduleId)}
                                                        className="mt-2 text-xs text-slate-400 hover:text-primary-navy font-semibold flex items-center gap-1"
                                                    >
                                                        <ChevronRightIcon className="w-3 h-3" />
                                                        Show {module.permissions.length} permissions
                                                    </button>
                                                )}
                                            </div>

                                            {/* Quick actions */}
                                            <div className="col-span-2 flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => selectAll(module.moduleId, module.permissions.map(p => p.id))}
                                                    disabled={allSelected || module.permissions.length === 0}
                                                    title="Select all"
                                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-lg text-xs font-bold text-slate-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <CheckSquare className="w-3.5 h-3.5" />
                                                    All
                                                </button>
                                                <button
                                                    onClick={() => clearAll(module.moduleId)}
                                                    disabled={selected.length === 0}
                                                    title="Clear all"
                                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-bold text-slate-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Square className="w-3.5 h-3.5" />
                                                    None
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer summary */}
                        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                            <p className="text-sm text-slate-500 font-medium">
                                <span className="font-extrabold text-slate-800">{totalSelected}</span> of{' '}
                                <span className="font-extrabold text-slate-800">{totalPermissions}</span> permissions selected across{' '}
                                <span className="font-extrabold text-slate-800">{modulePermissions.length}</span> modules
                            </p>
                            <button
                                onClick={handleSaveChanges}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-primary-navy hover:bg-primary-navy-dark text-white font-bold rounded-xl shadow-lg shadow-primary-navy/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                )}
            </div>
        </div>
    );
};

export default RolePermissionPage;
