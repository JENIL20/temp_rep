import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Building2,
    Search,
    Plus,
    X,
    MoreHorizontal,
    Edit3,
    Trash2,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle2,
    Mail,
    Phone
} from 'lucide-react';
import { toast } from 'react-toastify';
import { organizationApi } from '../api/organizationApi';
import { Organization } from '../types/organization.types';
import { LoadingSpinner } from '../../../shared/components/common';

const Organizations = () => {
    // Data State
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Search
    const [pageState, setPageState] = useState({
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        OrgName: '',
        OrgCode: '',
        Website: '',
        FirstName: '',
        LastName: '',
        Email: '',
        Password: '',
        ConfirmPassword: '',
        Mobile: '',
        IsActive: true,
    });
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await organizationApi.list({
                searchTerm,
                pageNumber: pageState.pageNumber,
                pageSize: pageState.pageSize
            });
            setOrganizations(data.items || []);
            setPageState(prev => ({
                ...prev,
                totalCount: data.totalCount,
                totalPages: data.totalPages
            }));
        } catch (error: any) {
            toast.error(error.message || 'Failed to load organizations');
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload a valid image file');
                return;
            }
            setSelectedLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setFormData({
            OrgName: '',
            OrgCode: '',
            Website: '',
            FirstName: '',
            LastName: '',
            Email: '',
            Password: '',
            ConfirmPassword: '',
            Mobile: '',
            IsActive: true,
        });
        setSelectedLogo(null);
        setLogoPreview(null);
        setEditingOrg(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (org: Organization) => {
        resetForm();
        setFormData({
            OrgName: org.orgName || '',
            OrgCode: org.orgCode || '',
            Website: org.website || '',
            FirstName: org.firstName || '',
            LastName: org.lastName || '',
            Email: org.email || '',
            Password: '',
            ConfirmPassword: '',
            Mobile: org.mobile || '',
            IsActive: org.isActive,
        });
        setLogoPreview(org.logo || null); // Note: Assuming the API gives the logo URL
        setEditingOrg(org);
        setShowModal(true);
        setActiveDropdown(null);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this organization?')) return;
        try {
            await organizationApi.delete(id);
            toast.success('Organization deleted successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete organization');
        } finally {
            setActiveDropdown(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.OrgName || !formData.OrgCode || !formData.Email || (!editingOrg && !formData.Password) || !formData.FirstName || !formData.LastName) {
            toast.error("Please fill all required fields");
            return;
        }

        if (formData.Password && formData.Password !== formData.ConfirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setSaving(true);
            const submitData = new FormData();

            // Append data
            Object.keys(formData).forEach(key => {
                if (key === 'ConfirmPassword' && !formData[key]) return; // Skip if empty on edit
                if (key === 'Password' && !formData[key]) return; // Skip if empty on edit
                submitData.append(key, formData[key as keyof typeof formData] as string);
            });

            if (selectedLogo) {
                submitData.append('Logo', selectedLogo);
            }

            if (editingOrg) {
                submitData.append('id', editingOrg.id.toString());
                await organizationApi.update(editingOrg.id, submitData);
                toast.success('Organization updated successfully');
            } else {
                await organizationApi.create(submitData);
                toast.success('Organization created successfully');
            }

            setShowModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Error saving organization');
        } finally {
            setSaving(false);
        }
    };

    // Outside click detection
    useEffect(() => {
        const handleClickOutside = () => {
            if (activeDropdown !== null) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeDropdown]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Organizations</h1>
                                <p className="text-sm text-gray-500 font-medium mt-1">Manage tenants, academies, and business entities.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search organizations..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                            >
                                <Plus size={18} />
                                <span>Create New</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {loading && organizations.length === 0 ? (
                    <div className="py-24 flex justify-center">
                        <LoadingSpinner variant="dots" size="xl" message="Loading organizations..." />
                    </div>
                ) : organizations.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-24 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Building2 className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Organizations Found</h3>
                        <p className="text-gray-500 max-w-sm mb-6">Get started by creating your first organizational tenant.</p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors"
                        >
                            <Plus size={18} />
                            Create Organization
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Organization</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Code / Admin</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Contact</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {organizations.map((org) => (
                                        <tr key={org.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                                        {org.logo ? (
                                                            <img src={org.logo} alt={org.orgName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Building2 className="w-6 h-6 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 leading-tight">{org.orgName}</div>
                                                        {org.website && (
                                                            <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline">
                                                                {org.website.replace(/^https?:\/\//, '')}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <span className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded text-xs font-bold uppercase tracking-wide">
                                                        {org.orgCode}
                                                    </span>
                                                    {(org.firstName || org.lastName) && (
                                                        <div className="text-sm font-medium text-gray-700">
                                                            {org.firstName} {org.lastName}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="font-medium text-gray-700">{org.email}</span>
                                                    </div>
                                                    {org.mobile && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                            {org.mobile}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${org.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${org.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                    {org.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2 relative">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === org.id ? null : org.id)}
                                                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                                    >
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                    {activeDropdown === org.id && (
                                                        <div className="absolute right-0 top-10 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openEditModal(org); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <Edit3 size={16} className="text-gray-400" />
                                                                <span className="font-medium">Edit Details</span>
                                                            </button>
                                                            <div className="h-px bg-gray-100 my-1 mx-4" />
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(org.id); }}
                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 size={16} className="text-red-400" />
                                                                <span className="font-medium">Delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Area */}
                        {pageState.totalPages > 1 && (
                            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-500">
                                    Displaying <span className="text-gray-900 font-bold">{organizations.length}</span> of <span className="text-gray-900 font-bold">{pageState.totalCount}</span>
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPageState(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                                        disabled={pageState.pageNumber === 1}
                                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-all border shadow-sm border-gray-200"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setPageState(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                                        disabled={pageState.pageNumber === pageState.totalPages}
                                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-all border shadow-sm border-gray-200"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !saving && setShowModal(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between text-white flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Building2 size={20} />
                                </div>
                                <h3 className="text-lg font-bold">
                                    {editingOrg ? 'Edit Organization' : 'Create Organization'}
                                </h3>
                            </div>
                            <button
                                onClick={() => !saving && setShowModal(false)}
                                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Logo Upload Section */}
                            <div className="flex items-center gap-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                <div
                                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-gray-400 flex flex-col items-center">
                                            <ImageIcon size={24} />
                                            <span className="text-[10px] font-bold uppercase mt-1">Upload</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">Organization Logo</h4>
                                    <p className="text-xs text-gray-500 mb-3">Square image recommended. Max size 2MB.</p>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleLogoSelect}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-bold px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm"
                                    >
                                        Choose File
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Organization Name *</label>
                                    <input
                                        type="text"
                                        name="OrgName"
                                        value={formData.OrgName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Organization Code *</label>
                                    <input
                                        type="text"
                                        name="OrgCode"
                                        value={formData.OrgCode}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all uppercase"
                                        placeholder="ACME"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-bold text-gray-700">Website</label>
                                    <input
                                        type="text"
                                        name="Website"
                                        value={formData.Website}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="md:col-span-2 pt-2 pb-1">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 border-b pb-2">Admin Account Details</h4>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">First Name *</label>
                                    <input
                                        type="text"
                                        name="FirstName"
                                        value={formData.FirstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Last Name *</label>
                                    <input
                                        type="text"
                                        name="LastName"
                                        value={formData.LastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Email Address *</label>
                                    <input
                                        type="email"
                                        name="Email"
                                        value={formData.Email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="Mobile"
                                        value={formData.Mobile}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                {/* Passwords (required on create, optional on edit) */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">
                                        Password {editingOrg ? '(Leave blank to keep current)' : '*'}
                                    </label>
                                    <input
                                        type="password"
                                        name="Password"
                                        value={formData.Password}
                                        onChange={handleInputChange}
                                        required={!editingOrg}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="ConfirmPassword"
                                        value={formData.ConfirmPassword}
                                        onChange={handleInputChange}
                                        required={!!formData.Password}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                {editingOrg && (
                                    <div className="md:col-span-2 flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 mt-2">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="IsActive"
                                                checked={formData.IsActive}
                                                onChange={handleInputChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                        <div>
                                            <span className="text-sm font-bold text-gray-900 block">Organization Active</span>
                                            <span className="text-xs text-gray-500">Inactive organizations cannot log in or manage courses.</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </form>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => !saving && setShowModal(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-60"
                            >
                                {saving ? (
                                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                ) : (
                                    <><CheckCircle2 size={16} /> {editingOrg ? 'Update Organization' : 'Create Organization'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Organizations;
