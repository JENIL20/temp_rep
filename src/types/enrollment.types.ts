// User Course Enrollment Types

export interface SubscribeRequest {
    courseId: number;
}

export interface EnrolledCourse {
    id: number;
    courseId: number;
    userId: number;
    enrolledAt: string;
    completedAt?: string;
    progress: number;
    status: 'Active' | 'Completed' | 'Dropped';
    course: {
        id: number;
        title: string;
        description: string;
        instructor: string;
        thumbnailUrl?: string;
        difficulty: string;
        durationHours: number;
        price: number;
        rating?: number;
    };
}

export interface SubscriptionStatus {
    isSubscribed: boolean;
    enrollmentId?: number;
    enrolledAt?: string;
    progress?: number;
}
