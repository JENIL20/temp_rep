import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roleModuleApi, RoleModuleEntry } from '../api/roleModuleApi';
import { roleApi } from '../api/roleApi';
import { Module, Role } from '../types/role.types';
import {
    ArrowLeft,
    Layers,
    Plus,
    Trash2,
    Search,
    RefreshCw,
    Loader2,
    ShieldCheck,
    Package,
    CheckCircle2,
    Circle,
} from 'lucide-react';
import { toast } from 'react-toastify';

const MODULE_COLORS = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-violet-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
    'from-indigo-500 to-indigo-600',
    'from-pink-500 to-pink-600',
];

const AssignRoleModules: React.FC = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const navigate = useNavigate();

    const [role, setRole] = useState<Role | null>(null);
    const [assignedModules, setAssignedModules] = useState<RoleModuleEntry[]>([]);
    const [allModules, setAllModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<number | null>(null); // moduleId being toggled

    const [assignedSearch, setAssignedSearch] = useState('');
    const [availableSearch, setAvailableSearch] = useState('');

    const fetchData = async () => {
        if (!roleId) return;
        try {
            setLoading(true);
            const [rolesData, assigned, all] = await Promise.all([
                roleApi.list(),
                roleModuleApi.listByRole(Number(roleId)),
                roleModuleApi.listAllModules(),
            ]);
            const found = (Array.isArray(rolesData) ? rolesData : []).find(
                (r: Role) => r.id === Number(roleId)
            );
            setRole(found ?? null);
            setAssignedModules(assigned);
            setAllModules(all);
        } catch (err: any) {
            toast.error(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [roleId]);

    // Modules NOT yet assigned to the role
    const assignedModuleIds = useMemo(
        () => new Set(assignedModules.map(m => m.moduleId)),
        [assignedModules]
    );

    const filteredAssigned = useMemo(
        () =>
            assignedModules.filter(
                m =>
                    m.moduleName.toLowerCase().includes(assignedSearch.toLowerCase()) ||
                    m.moduleCode.toLowerCase().includes(assignedSearch.toLowerCase())
            ),
        [assignedModules, assignedSearch]
    );

    const filteredAvailable = useMemo(
        () =>
            allModules.filter(
                m =>
                    !assignedModuleIds.has(m.id) &&
                    (m.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
                        m.code.toLowerCase().includes(availableSearch.toLowerCase()))
            ),
        [allModules, assignedModuleIds, availableSearch]
    );

    const handleAssign = async (module: Module) => {
        if (!roleId) return;
        setTogglingId(module.id);
        try {
            await roleModuleApi.assign(Number(roleId), module.id);
            toast.success(`"${module.name}" assigned to role`);
            await fetchData();
        } catch (err: any) {
            toast.error(err.message || 'Failed to assign module');
        } finally {
            setTogglingId(null);
        }
    };

    const handleRemove = async (entry: RoleModuleEntry) => {
        setTogglingId(entry.moduleId);
        try {
            await roleModuleApi.remove(entry.id);
            toast.success(`"${entry.moduleName}" removed from role`);
            await fetchData();
        } catch (err: any) {
            toast.error(err.message || 'Failed to remove module');
        } finally {
            setTogglingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
                    <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-navy" />
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading Modules...</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#F8FAFC] flex flex-col">

            {/* ── Header ── */}
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
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-navy to-primary-navy/70 rounded-xl flex items-center justify-center shadow-md shadow-primary-navy/20">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
                                {role?.name ?? `Role #${roleId}`}
                                <span className="ml-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                    — Module Assignment
                                </span>
                            </h1>
                            <p className="text-xs text-slate-400">{role?.code}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Counters */}
                    <div className="hidden sm:flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Assigned</p>
                            <p className="text-xl font-extrabold text-emerald-600 leading-none">
                                {assignedModules.length}
                                <span className="text-slate-300 font-normal text-sm"> / {allModules.length}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={fetchData}
                        className="p-2 text-slate-500 hover:text-primary-navy hover:bg-slate-100 rounded-xl transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Two-Panel Content ── */}
            <div className="flex-1 overflow-hidden p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── LEFT: Assigned Modules ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    {/* Panel Header */}
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <h2 className="font-extrabold text-slate-900 text-base">Assigned Modules</h2>
                            <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full">
                                {assignedModules.length}
                            </span>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search assigned..."
                                value={assignedSearch}
                                onChange={e => setAssignedSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {filteredAssigned.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <ShieldCheck className="w-10 h-10 mb-3 text-slate-200" />
                                <p className="font-semibold text-sm">
                                    {assignedSearch ? 'No matches found' : 'No modules assigned yet'}
                                </p>
                                <p className="text-xs mt-1">Assign modules from the right panel</p>
                            </div>
                        ) : (
                            filteredAssigned.map((entry, idx) => {
                                const isRemoving = togglingId === entry.moduleId;
                                const color = MODULE_COLORS[idx % MODULE_COLORS.length];
                                return (
                                    <div
                                        key={entry.id}
                                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                                            <Package className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-sm truncate">{entry.moduleName}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.moduleCode}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(entry)}
                                            disabled={isRemoving}
                                            title="Remove module"
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 hover:border-red-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                                        >
                                            {isRemoving ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                            Remove
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Available (Unassigned) Modules ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    {/* Panel Header */}
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Circle className="w-5 h-5 text-slate-400" />
                            <h2 className="font-extrabold text-slate-900 text-base">Available Modules</h2>
                            <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-black rounded-full">
                                {allModules.length - assignedModules.length}
                            </span>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search available..."
                                value={availableSearch}
                                onChange={e => setAvailableSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-navy/20 focus:border-primary-navy transition-all"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {filteredAvailable.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <Package className="w-10 h-10 mb-3 text-slate-200" />
                                <p className="font-semibold text-sm">
                                    {availableSearch
                                        ? 'No matches found'
                                        : allModules.length === assignedModules.length
                                            ? 'All modules are already assigned!'
                                            : 'No modules available'}
                                </p>
                            </div>
                        ) : (
                            filteredAvailable.map((module, idx) => {
                                const isAssigning = togglingId === module.id;
                                const color = MODULE_COLORS[(assignedModules.length + idx) % MODULE_COLORS.length];
                                return (
                                    <div
                                        key={module.id}
                                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity`}>
                                            <Package className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-700 text-sm truncate">{module.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{module.code}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAssign(module)}
                                            disabled={isAssigning}
                                            title="Assign module"
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-navy/5 hover:bg-primary-navy text-primary-navy hover:text-white border border-primary-navy/20 hover:border-primary-navy rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                                        >
                                            {isAssigning ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Plus className="w-3.5 h-3.5" />
                                            )}
                                            Assign
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AssignRoleModules;
