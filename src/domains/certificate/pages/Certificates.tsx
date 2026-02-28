import React, { useEffect, useState } from 'react';
import { certificateApi } from '../api/certificateApi';
import { Certificate } from '../types/certificate.types';
import {
    Award,
    Download,
    Search,
    Calendar,
    CheckCircle,
    XCircle,
    Shield,
    FileText,
} from 'lucide-react';
import { toast } from 'react-toastify';

const Certificates: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchCode, setSearchCode] = useState('');
    const [validationResult, setValidationResult] = useState<any>(null);
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            // Try to get current user's certificates
            // For now, we'll use sample data
            setCertificates(getSampleCertificates());
            setError(null);
        } catch (err: any) {
            console.error('Error fetching certificates:', err);
            setError(err.response?.data?.message || 'Failed to load certificates');
            setCertificates(getSampleCertificates());
        } finally {
            setLoading(false);
        }
    };

    const getSampleCertificates = (): Certificate[] => [
        {
            id: 1,
            userId: 1,
            courseId: 2,
            certificateCode: 'CERT-2024-001-ABC123',
            issuedDate: '2024-03-15T10:00:00Z',
            score: 95,
            isRevoked: false,
            course: {
                id: 2,
                title: 'Python for Data Science',
                instructor: 'Prof. Michael Chen',
                durationHours: 25,
            },
            user: {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
            },
        },
        {
            id: 2,
            userId: 1,
            courseId: 5,
            certificateCode: 'CERT-2024-002-XYZ789',
            issuedDate: '2024-02-20T10:00:00Z',
            score: 88,
            isRevoked: false,
            course: {
                id: 5,
                title: 'Digital Marketing Fundamentals',
                instructor: 'Sarah Williams',
                durationHours: 20,
            },
            user: {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
            },
        },
    ];

    const handleDownload = async (certificateId: number, courseName: string) => {
        try {
            const blob = await certificateApi.download(certificateId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `certificate-${courseName.replace(/\s+/g, '-')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading certificate:', err);
            toast.error('Failed to download certificate. Please try again.');
        }
    };

    const handleValidate = async () => {
        if (!searchCode.trim()) {
            toast.error('Please enter a certificate code');
            return;
        }

        try {
            setValidating(true);
            const result = await certificateApi.validate(searchCode);
            setValidationResult(result);
        } catch (err: any) {
            console.error('Error validating certificate:', err);
            setValidationResult({
                isValid: false,
                message: 'Certificate not found or invalid',
            });
        } finally {
            setValidating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
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
                            <h1 className="text-4xl font-bold mb-2">My Certificates</h1>
                            <p className="text-gray-200">
                                Your achievements and course completions
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <Award className="w-20 h-20 opacity-20" />
                        </div>
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

            {/* Certificate Validation Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-6 h-6 text-primary-navy" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            Validate Certificate
                        </h2>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Enter a certificate code to verify its authenticity
                    </p>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            placeholder="Enter certificate code (e.g., CERT-2024-001-ABC123)"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-navy"
                            onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
                        />
                        <button
                            onClick={handleValidate}
                            disabled={validating}
                            className="bg-primary-navy text-white px-6 py-3 rounded-lg hover:bg-primary-navy-dark transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {validating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Validating...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Validate
                                </>
                            )}
                        </button>
                    </div>

                    {/* Validation Result */}
                    {validationResult && (
                        <div
                            className={`mt-4 p-4 rounded-lg ${validationResult.isValid
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {validationResult.isValid ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                )}
                                <div>
                                    <p
                                        className={`font-semibold ${validationResult.isValid ? 'text-green-800' : 'text-red-800'
                                            }`}
                                    >
                                        {validationResult.isValid
                                            ? 'Valid Certificate'
                                            : 'Invalid Certificate'}
                                    </p>
                                    <p
                                        className={`text-sm ${validationResult.isValid ? 'text-green-600' : 'text-red-600'
                                            }`}
                                    >
                                        {validationResult.message}
                                    </p>
                                    {validationResult.certificate && (
                                        <div className="mt-2 text-sm text-gray-700">
                                            <p>
                                                <strong>Course:</strong>{' '}
                                                {validationResult.certificate.course.title}
                                            </p>
                                            <p>
                                                <strong>Issued to:</strong>{' '}
                                                {validationResult.certificate.user.firstName}{' '}
                                                {validationResult.certificate.user.lastName}
                                            </p>
                                            <p>
                                                <strong>Date:</strong>{' '}
                                                {formatDate(validationResult.certificate.issuedDate)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Certificates Grid */}
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Your Certificates ({certificates.length})
                </h2>

                {certificates.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No certificates yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Complete courses to earn certificates
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert) => (
                            <div
                                key={cert.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {/* Certificate Header */}
                                <div className="bg-gradient-to-br from-secondary-gold to-secondary-gold-light p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 opacity-10">
                                        <Award className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10">
                                        <Award className="w-12 h-12 mb-3" />
                                        <h3 className="text-xl font-bold mb-1">
                                            Certificate of Completion
                                        </h3>
                                        <p className="text-sm opacity-90">
                                            {cert.course.instructor}
                                        </p>
                                    </div>
                                </div>

                                {/* Certificate Body */}
                                <div className="p-6">
                                    <h4 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
                                        {cert.course.title}
                                    </h4>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Issued: {formatDate(cert.issuedDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FileText className="w-4 h-4" />
                                            <span className="font-mono text-xs">
                                                {cert.certificateCode}
                                            </span>
                                        </div>
                                        {cert.score && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Score: {cert.score}%</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mb-4">
                                        {cert.isRevoked ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                                <XCircle className="w-3 h-3" />
                                                Revoked
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                <CheckCircle className="w-3 h-3" />
                                                Valid
                                            </span>
                                        )}
                                    </div>

                                    {/* Download Button */}
                                    <button
                                        onClick={() => handleDownload(cert.id, cert.course.title)}
                                        disabled={cert.isRevoked}
                                        className="w-full bg-primary-navy text-white py-3 rounded-lg hover:bg-primary-navy-dark transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Certificate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Certificates;
