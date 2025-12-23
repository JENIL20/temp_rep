// Certificate Types

export interface CreateCertificateRequest {
    userId: number;
    courseId: number;
    score?: number;
}

export interface Certificate {
    id: number;
    userId: number;
    courseId: number;
    certificateCode: string;
    issuedDate: string;
    expiryDate?: string;
    score?: number;
    isRevoked: boolean;
    revokedAt?: string;
    revokedReason?: string;
    course: {
        id: number;
        title: string;
        instructor: string;
        durationHours: number;
    };
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface CertificateValidation {
    isValid: boolean;
    certificate?: Certificate;
    message: string;
}
