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
    UserCircle,
    Mail,
    Phone,
    Calendar
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
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Elegant Header Area */}
            <div className="bg-white border-b border-slate-200 pt-10 pb-16 px-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-navy/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-gold/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-navy rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                                <Users className="w-6 h-6" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">User <span className="text-primary-navy NOT-italic">Intelligence</span></h1>
                        </div>
                        <p className="text-slate-500 font-medium ml-1">Orchestrating platform identities and access privileges.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-navy transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-[350px] bg-slate-50 border-2 border-slate-100 py-4 pl-16 pr-8 rounded-[2rem] text-slate-900 font-bold focus:bg-white focus:border-primary-navy focus:ring-8 focus:ring-primary-navy/5 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 -mt-8">
                {/* Stats Summary Panel */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
                        <div className="w-16 h-16 bg-primary-navy/10 text-primary-navy rounded-[1.5rem] flex items-center justify-center transition-all duration-300 group-hover:bg-primary-navy group-hover:text-white group-hover:rotate-6">
                            <Users size={32} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest whitespace-nowrap">Total Registrations</p>
                            <h4 className="text-3xl font-black text-slate-900">{pageState.totalCount}</h4>
                        </div>
                    </div>
                </div>

                {/* Main User List Table */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                    {loading && users.length === 0 ? (
                        <div className="py-24 text-center">
                            <LoadingSpinner variant="dots" size="xl" message="Fetching identities..." />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Identity Profile</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 whitespace-nowrap">Communication</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Security Roles</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Onboarding</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users.map((user) => (
                                            <tr key={user.id} className="group hover:bg-slate-50/70 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 group-hover:scale-105 transition-transform">
                                                                <UserCircle className="w-8 h-8" />
                                                            </div>
                                                            {user.isActive && (
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-black text-slate-900 leading-tight">{user.firstName} {user.lastName}</h5>
                                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">@{user.userName}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium lowercase">
                                                            <Mail className="w-3.5 h-3.5 text-slate-300" />
                                                            {user.email}
                                                        </div>
                                                        {user.mobile && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                <Phone className="w-3.5 h-3.5 text-slate-300 rotate-90" />
                                                                {user.mobile}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {user.roles && user.roles.length > 0 ? (
                                                            user.roles.map((role, idx) => (
                                                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-primary-navy/10 text-primary-navy text-[10px] font-black rounded-lg uppercase tracking-wider">{role}</span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">No Elevated Access</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                        <Calendar className="w-4 h-4 text-slate-300" />
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="relative inline-block">
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                            className="p-3 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-200 rounded-xl transition-all active:scale-90"
                                                        >
                                                            <MoreHorizontal size={20} />
                                                        </button>

                                                        {activeDropdown === user.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-20 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right">
                                                                    <div className="p-2 border-b border-slate-50">
                                                                        <button onClick={() => openRoleManager(user)} className="w-full flex items-center gap-3 px-4 py-4 text-slate-700 hover:bg-slate-50 font-bold rounded-2xl transition-colors">
                                                                            <Shield className="w-4 h-4 text-primary-navy" />
                                                                            Assign Privileges
                                                                        </button>
                                                                    </div>
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

                            {/* Pagination Interface */}
                            <div className="px-8 py-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="text-slate-400 font-bold text-sm">
                                    Displaying <span className="text-slate-900 font-black">{users.length}</span> of <span className="text-slate-900 font-black">{pageState.totalCount}</span> Platform Identities
                                </div>

                                {pageState.totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(pageState.pageNumber - 1)}
                                            disabled={pageState.pageNumber === 1}
                                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary-navy hover:border-primary-navy hover:bg-primary-navy/5 disabled:opacity-20 disabled:hover:bg-white disabled:hover:border-slate-200 rounded-2xl transition-all active:scale-90"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>

                                        <div className="flex items-center gap-1.5 px-2">
                                            {Array.from({ length: pageState.totalPages }, (_, i) => i + 1).map(num => (
                                                <button
                                                    key={num}
                                                    onClick={() => handlePageChange(num)}
                                                    className={`w-12 h-12 rounded-2xl font-black text-sm transition-all active:scale-90 ${pageState.pageNumber === num ? 'bg-primary-navy text-white shadow-xl shadow-primary-navy/20 rotate-3 scale-110' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(pageState.pageNumber + 1)}
                                            disabled={pageState.pageNumber === pageState.totalPages}
                                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-primary-navy hover:border-primary-navy hover:bg-primary-navy/5 disabled:opacity-20 disabled:hover:bg-white disabled:hover:border-slate-200 rounded-2xl transition-all active:scale-90"
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

            {/* Role Management Modal (Consistent with Roles Page) */}
            {showRoleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowRoleModal(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><UserCircle className="w-8 h-8" /></div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Profile Authorization</h2>
                                        <p className="text-slate-400 font-medium">Updating: <span className="font-bold text-slate-800">{selectedUser?.userName}</span></p>
                                    </div>
                                </div>
                                <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
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
                                                        <p className={`font-black uppercase text-[10px] tracking-widest ${isAssigned ? 'text-white/60' : 'text-slate-400'}`}>{role.code}</p>
                                                        <p className="font-bold underline decoration-2 decoration-transparent group-hover:decoration-current leading-tight">{role.name}</p>
                                                    </div>
                                                </div>
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isAssigned ? 'bg-white/20' : 'bg-white'}`}>
                                                    {isAssigned ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4 text-slate-300 group-hover:text-primary-navy" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-end">
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                                >
                                    Finish Deployment
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
