import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../store";
import { setCredentials } from "../../auth/authSlice";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit3,
    Save,
    Camera,
    Lock,
    Shield,
    Bell,
    Globe,
    Award,
    BookOpen,
    TrendingUp,
    Activity,
    Settings
} from "lucide-react";

type TabType = 'overview' | 'edit' | 'security' | 'settings';

const Profile = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        bio: "Passionate learner and educator focused on web development and modern technologies.",
        website: "https://example.com",
        linkedin: "https://linkedin.com/in/johndoe",
        twitter: "@johndoe",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [settings, setSettings] = useState({
        emailNotifications: true,
        courseUpdates: true,
        marketingEmails: false,
        publicProfile: true,
        showEmail: false,
    });

    // Mock stats data
    const stats = {
        coursesEnrolled: 12,
        coursesCompleted: 8,
        certificatesEarned: 5,
        totalHoursLearned: 156,
        currentStreak: 7,
        longestStreak: 21,
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSettingChange = (key: string) => {
        setSettings({
            ...settings,
            [key]: !settings[key as keyof typeof settings],
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        // Update user in Redux store
        if (user) {
            dispatch(setCredentials({
                user: { ...user, name: formData.name, email: formData.email },
                token: localStorage.getItem('token') || '',
            }));
        }
        // Here you would typically make an API call to update the profile
        alert("Profile updated successfully!");
    };

    const handleSavePassword = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        // Here you would make an API call to update the password
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        alert("Password updated successfully!");
    };

    const handleSaveSettings = () => {
        // Here you would make an API call to update settings
        alert("Settings saved successfully!");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary-navy via-primary-navy-light to-primary-navy-dark text-white">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-secondary-gold to-secondary-gold-dark flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-2xl overflow-hidden">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase() || "U"
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-white text-primary-navy p-2 rounded-full cursor-pointer shadow-lg hover:bg-gray-100 transition-colors">
                                <Camera size={20} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </label>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold">{user?.name || "User Name"}</h1>
                                <span className="px-3 py-1 bg-secondary-gold/20 text-secondary-gold border border-secondary-gold/30 rounded-full text-sm font-semibold capitalize">
                                    {user?.role || "User"}
                                </span>
                            </div>
                            <p className="text-white/90 text-lg mb-4">{formData.bio}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                                    <Mail size={16} />
                                    <span>{user?.email || "email@example.com"}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                                    <MapPin size={16} />
                                    <span>{formData.location}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                                    <Calendar size={16} />
                                    <span>Joined January 2024</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-6 -mt-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-2 text-primary-navy mb-2">
                            <BookOpen size={20} />
                            <span className="text-2xl font-bold">{stats.coursesEnrolled}</span>
                        </div>
                        <p className="text-sm text-gray-600">Courses Enrolled</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <Award size={20} />
                            <span className="text-2xl font-bold">{stats.coursesCompleted}</span>
                        </div>
                        <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-2 text-secondary-gold-dark mb-2">
                            <Shield size={20} />
                            <span className="text-2xl font-bold">{stats.certificatesEarned}</span>
                        </div>
                        <p className="text-sm text-gray-600">Certificates</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <Activity size={20} />
                            <span className="text-2xl font-bold">{stats.totalHoursLearned}</span>
                        </div>
                        <p className="text-sm text-gray-600">Hours Learned</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-2 text-orange-600 mb-2">
                            <TrendingUp size={20} />
                            <span className="text-2xl font-bold">{stats.currentStreak}</span>
                        </div>
                        <p className="text-sm text-gray-600">Day Streak</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <Award size={20} />
                            <span className="text-2xl font-bold">{stats.longestStreak}</span>
                        </div>
                        <p className="text-sm text-gray-600">Longest Streak</p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="max-w-7xl mx-auto px-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all ${activeTab === 'overview'
                                ? 'text-primary-navy border-b-2 border-primary-navy bg-primary-navy/5'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <User size={18} />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all ${activeTab === 'edit'
                                ? 'text-primary-navy border-b-2 border-primary-navy bg-primary-navy/5'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Edit3 size={18} />
                            Edit Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all ${activeTab === 'security'
                                ? 'text-primary-navy border-b-2 border-primary-navy bg-primary-navy/5'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Lock size={18} />
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all ${activeTab === 'settings'
                                ? 'text-primary-navy border-b-2 border-primary-navy bg-primary-navy/5'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Settings size={18} />
                            Settings
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                                <User className="text-primary-navy mt-1" size={20} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Full Name</p>
                                                    <p className="text-base text-gray-900">{formData.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                                <Mail className="text-primary-navy mt-1" size={20} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Email</p>
                                                    <p className="text-base text-gray-900">{formData.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                                <Phone className="text-primary-navy mt-1" size={20} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Phone</p>
                                                    <p className="text-base text-gray-900">{formData.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                                <MapPin className="text-primary-navy mt-1" size={20} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Location</p>
                                                    <p className="text-base text-gray-900">{formData.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Social Links</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                                <Globe className="text-primary-navy mt-1" size={20} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Website</p>
                                                    <a href={formData.website} className="text-base text-blue-600 hover:underline">
                                                        {formData.website}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                                <Globe className="text-primary-navy mt-1" size={20} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">LinkedIn</p>
                                                    <a href={formData.linkedin} className="text-base text-blue-600 hover:underline">
                                                        {formData.linkedin}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                                <Globe className="text-primary-navy mt-1" size={20} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700">Twitter</p>
                                                    <p className="text-base text-gray-900">{formData.twitter}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Edit Profile Tab */}
                        {activeTab === 'edit' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Edit Your Profile</h3>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Twitter
                                        </label>
                                        <input
                                            type="text"
                                            name="twitter"
                                            value={formData.twitter}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                                </div>

                                <div className="max-w-2xl space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-navy focus:border-transparent"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSavePassword}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
                                    >
                                        <Lock size={18} />
                                        Update Password
                                    </button>
                                </div>

                                <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
                                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                        <Shield size={20} />
                                        Password Requirements
                                    </h4>
                                    <ul className="text-sm text-amber-800 space-y-1 ml-7">
                                        <li>• At least 8 characters long</li>
                                        <li>• Contains at least one uppercase letter</li>
                                        <li>• Contains at least one lowercase letter</li>
                                        <li>• Contains at least one number</li>
                                        <li>• Contains at least one special character</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Account Settings</h3>
                                    <button
                                        onClick={handleSaveSettings}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-navy text-white rounded-lg hover:bg-primary-navy-light transition-colors"
                                    >
                                        <Save size={18} />
                                        Save Settings
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Bell size={20} className="text-primary-navy" />
                                            Notifications
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <div>
                                                    <p className="font-medium text-gray-900">Email Notifications</p>
                                                    <p className="text-sm text-gray-600">Receive email updates about your account</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.emailNotifications}
                                                    onChange={() => handleSettingChange('emailNotifications')}
                                                    className="w-5 h-5 text-primary-navy rounded focus:ring-2 focus:ring-primary-navy"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <div>
                                                    <p className="font-medium text-gray-900">Course Updates</p>
                                                    <p className="text-sm text-gray-600">Get notified about new course content</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.courseUpdates}
                                                    onChange={() => handleSettingChange('courseUpdates')}
                                                    className="w-5 h-5 text-primary-navy rounded focus:ring-2 focus:ring-primary-navy"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <div>
                                                    <p className="font-medium text-gray-900">Marketing Emails</p>
                                                    <p className="text-sm text-gray-600">Receive promotional content and offers</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.marketingEmails}
                                                    onChange={() => handleSettingChange('marketingEmails')}
                                                    className="w-5 h-5 text-primary-navy rounded focus:ring-2 focus:ring-primary-navy"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Shield size={20} className="text-primary-navy" />
                                            Privacy
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <div>
                                                    <p className="font-medium text-gray-900">Public Profile</p>
                                                    <p className="text-sm text-gray-600">Make your profile visible to others</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.publicProfile}
                                                    onChange={() => handleSettingChange('publicProfile')}
                                                    className="w-5 h-5 text-primary-navy rounded focus:ring-2 focus:ring-primary-navy"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <div>
                                                    <p className="font-medium text-gray-900">Show Email</p>
                                                    <p className="text-sm text-gray-600">Display your email on your public profile</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.showEmail}
                                                    onChange={() => handleSettingChange('showEmail')}
                                                    className="w-5 h-5 text-primary-navy rounded focus:ring-2 focus:ring-primary-navy"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
