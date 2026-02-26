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
    Check,
    Save,
    Loader2,
    ShieldAlert,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface UserInfo {
    id: number;
    userName: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

const ROLE_ACCENTS = [
    { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', icon: 'bg-blue-500' },
    { bg: 'from-violet-500 to-violet-600', light: 'bg-violet-50', border: 'border-violet-400', text: 'text-violet-700', icon: 'bg-violet-500' },
    { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700', icon: 'bg-emerald-500' },
    { bg: 'from-amber-500 to-amber-600', light: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', icon: 'bg-amber-500' },
    { bg: 'from-rose-500 to-rose-600', light: 'bg-rose-50', border: 'border-rose-400', text: 'text-rose-700', icon: 'bg-rose-500' },
    { bg: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-700', icon: 'bg-cyan-500' },
];

const UserPermissionPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserInfo | null>(null);
    const [allRoles, setAllRoles] = useState<Role[]>([]);

    // Original roles (what the server has)
    const [originalRoleIds, setOriginalRoleIds] = useState<number[]>([]);
    // Pending roles (local changes before saving)
    const [pendingRoleIds, setPendingRoleIds] = useState<number[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (userId) fetchUserData();
    }, [userId]);

    const fetchUserData = async () => {
        try {
            setLoading(true);

            const [rolesData, userRoles, userDetails] = await Promise.all([
                roleApi.list(),
                userRoleApi.getUserRoles(Number(userId)),
                userRoleApi.getUserDetails(Number(userId)),
            ]);

            // Normalise role list shape
            const normalised: Role[] = (Array.isArray(rolesData) ? rolesData : []).map((r: any) => ({
                id: r.id ?? r.roleId,
                name: r.name ?? r.roleName ?? '',
                code: r.code ?? r.roleCode ?? '',
                isActive: r.isActive ?? true,
            }));
            setAllRoles(normalised);

            const ids = userRoles.map((r: Role) => r.id).filter((id): id is number => id != null);
            setOriginalRoleIds(ids);
            setPendingRoleIds(ids);

            setUser(userDetails);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = (roleId: number) => {
        setPendingRoleIds(prev =>
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const toAdd = pendingRoleIds.filter(id => !originalRoleIds.includes(id));
            const toRemove = originalRoleIds.filter(id => !pendingRoleIds.includes(id));

            await Promise.all([
                ...toAdd.map(roleId => userRoleApi.assign({ userId: Number(userId), roleId })),
                ...toRemove.map(roleId => userRoleApi.remove(Number(userId), roleId)),
            ]);

            setOriginalRoleIds(pendingRoleIds);
            toast.success('Role assignments saved successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save role assignments');
        } finally {
            setSaving(false);
        }
    };

    const hasPendingChanges =
        pendingRoleIds.length !== originalRoleIds.length ||
        !pendingRoleIds.every(id => originalRoleIds.includes(id));

    const displayName = user
        ? (user.firstName || user.lastName
            ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
            : user.userName)
        : '';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-navy/20 border-t-primary-navy rounded-full animate-spin" />
                    <UserCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-navy" />
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading User Permissions...</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#F8FAFC] flex flex-col">

            {/* ── Top Header Bar ──────────────────────────────── */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-navy transition-colors group text-sm font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <div className="h-6 w-px bg-slate-200" />

                    {/* User info */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-extrabold text-sm flex-shrink-0">
                            {user?.firstName?.[0]}{user?.lastName?.[0] ?? user?.userName?.[0]}
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">{displayName}</h1>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Mail className="w-3 h-3" />
                                <span>{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats + Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Assigned</p>
                            <p className="text-xl font-extrabold text-primary-navy leading-none">
                                {pendingRoleIds.length}
                                <span className="text-slate-300 font-normal text-sm"> / {allRoles.length}</span>
                            </p>
                        </div>
                        {hasPendingChanges && (
                            <span className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                Unsaved changes
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPendingRoleIds(originalRoleIds)}
                            disabled={!hasPendingChanges || saving}
                            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            disabled={saving || !hasPendingChanges}
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

            {/* ── Content ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">

                {/* Empty state */}
                {allRoles.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-24 flex flex-col items-center">
                        <ShieldAlert className="w-14 h-14 text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No Roles Available</h3>
                        <p className="text-slate-400 mt-1 text-sm">There are no roles configured in the system.</p>
                    </div>
                )}

                {/* Roles table */}
                {allRoles.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                        {/* Table header */}
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
                            <div className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-1 text-xs font-black text-slate-400 uppercase tracking-wider">Icon</div>
                                <div className="col-span-4 text-xs font-black text-slate-400 uppercase tracking-wider">Role Name</div>
                                <div className="col-span-3 text-xs font-black text-slate-400 uppercase tracking-wider">Code</div>
                                <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-wider">Status</div>
                                <div className="col-span-2 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Assigned</div>
                            </div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-slate-100">
                            {allRoles.map((role, index) => {
                                const isAssigned = pendingRoleIds.includes(role.id);
                                const accent = ROLE_ACCENTS[index % ROLE_ACCENTS.length];

                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => toggleRole(role.id)}
                                        className={`w-full grid grid-cols-12 gap-4 items-center px-6 py-4 transition-all group text-left
                                            ${isAssigned ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50/60'}`}
                                    >
                                        {/* Icon */}
                                        <div className="col-span-1">
                                            <div className={`w-10 h-10 bg-gradient-to-br ${accent.bg} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 transition-all ${isAssigned ? 'scale-110 rotate-3' : ''}`}>
                                                <Shield className="w-5 h-5 text-white" />
                                            </div>
                                        </div>

                                        {/* Role name */}
                                        <div className="col-span-4">
                                            <p className={`font-extrabold text-sm transition-colors ${isAssigned ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                                {role.name}
                                            </p>
                                        </div>

                                        {/* Code */}
                                        <div className="col-span-3">
                                            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wide">
                                                {role.code}
                                            </span>
                                        </div>

                                        {/* Active status */}
                                        <div className="col-span-2">
                                            {role.isActive ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        {/* Checkbox */}
                                        <div className="col-span-2 flex justify-end">
                                            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                                                ${isAssigned
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30 scale-110'
                                                    : 'bg-white border-slate-300 group-hover:border-slate-400'
                                                }`}>
                                                {isAssigned && <Check className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                            <p className="text-sm text-slate-500 font-medium">
                                <span className="font-extrabold text-slate-800">{pendingRoleIds.length}</span> of{' '}
                                <span className="font-extrabold text-slate-800">{allRoles.length}</span> roles assigned to{' '}
                                <span className="font-extrabold text-slate-800">{displayName}</span>
                            </p>

                            <button
                                onClick={handleSaveChanges}
                                disabled={saving || !hasPendingChanges}
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

export default UserPermissionPage;
