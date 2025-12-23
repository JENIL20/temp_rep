import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, File, Video } from 'lucide-react';
import api from '../api/axios';
import { API } from '../api/endpoints';

interface FileUploadProps {
    courseId: number;
    uploadType: 'video' | 'document';
    onUploadSuccess?: (response: any) => void;
    onUploadError?: (error: any) => void;
    accept?: string;
    maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
    courseId,
    uploadType,
    onUploadSuccess,
    onUploadError,
    accept,
    maxSizeMB = 100,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const defaultAccept = uploadType === 'video'
        ? 'video/mp4,video/webm,video/ogg'
        : 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            setErrorMessage(`File size must be less than ${maxSizeMB}MB`);
            setUploadStatus('error');
            return;
        }

        setSelectedFile(file);
        setUploadStatus('idle');
        setErrorMessage('');
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        const endpoint = uploadType === 'video'
            ? API.COURSE.UPLOAD_VIDEO(courseId)
            : API.COURSE.UPLOAD_DOCUMENT(courseId);

        try {
            setUploading(true);
            setUploadStatus('idle');

            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: any) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(progress);
                },
            });

            setUploadStatus('success');
            setUploadProgress(100);

            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }

            // Reset after 2 seconds
            setTimeout(() => {
                setSelectedFile(null);
                setUploadProgress(0);
                setUploadStatus('idle');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }, 2000);
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            setErrorMessage(error.response?.data?.message || 'Upload failed. Please try again.');

            if (onUploadError) {
                onUploadError(error);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
        setErrorMessage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-navy transition-colors">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept || defaultAccept}
                    onChange={handleFileSelect}
                    className="hidden"
                    id={`file-upload-${uploadType}-${courseId}`}
                />

                {!selectedFile ? (
                    <label
                        htmlFor={`file-upload-${uploadType}-${courseId}`}
                        className="flex flex-col items-center cursor-pointer"
                    >
                        <div className="bg-primary-navy/10 p-4 rounded-full mb-3">
                            {uploadType === 'video' ? (
                                <Video className="w-8 h-8 text-primary-navy" />
                            ) : (
                                <File className="w-8 h-8 text-primary-navy" />
                            )}
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Click to upload {uploadType}
                        </p>
                        <p className="text-xs text-gray-500">
                            Max size: {maxSizeMB}MB
                        </p>
                    </label>
                ) : (
                    <div className="space-y-3">
                        {/* Selected File Info */}
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {uploadType === 'video' ? (
                                    <Video className="w-5 h-5 text-primary-navy flex-shrink-0" />
                                ) : (
                                    <File className="w-5 h-5 text-primary-navy flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                </div>
                            </div>
                            {!uploading && uploadStatus !== 'success' && (
                                <button
                                    onClick={handleRemoveFile}
                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Uploading...</span>
                                    <span className="font-medium text-primary-navy">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-primary-navy to-secondary-gold h-2 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Upload Status */}
                        {uploadStatus === 'success' && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Upload successful!</span>
                            </div>
                        )}

                        {uploadStatus === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">{errorMessage}</span>
                            </div>
                        )}

                        {/* Upload Button */}
                        {!uploading && uploadStatus !== 'success' && (
                            <button
                                onClick={handleUpload}
                                className="w-full bg-primary-navy text-white py-2 px-4 rounded-lg hover:bg-primary-navy-dark transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Upload {uploadType}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
