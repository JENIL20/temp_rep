interface PageLoaderProps {
    message?: string;
    variant?: 'default' | 'dots' | 'pulse' | 'ring';
}

const PageLoader = ({ message = 'Loading...', variant = 'ring' }: PageLoaderProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center">
                {/* Animated logo/icon area */}
                <div className="mb-8 flex justify-center">
                    {variant === 'ring' && (
                        <div className="h-20 w-20 relative">
                            {/* Outer ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-navy border-r-primary-navy-light animate-spin"></div>
                            {/* Middle ring */}
                            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-secondary-gold border-r-secondary-gold-light animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                            {/* Inner ring */}
                            <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-primary-navy-dark border-r-secondary-gold-dark animate-spin" style={{ animationDuration: '0.75s' }}></div>
                        </div>
                    )}

                    {variant === 'dots' && (
                        <div className="flex gap-3">
                            <div className="h-4 w-4 rounded-full bg-primary-navy animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-4 w-4 rounded-full bg-secondary-gold animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-4 w-4 rounded-full bg-primary-navy-light animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    )}

                    {variant === 'pulse' && (
                        <div className="h-20 w-20 relative flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-primary-navy opacity-75 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full bg-secondary-gold opacity-75 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-navy to-secondary-gold"></div>
                        </div>
                    )}

                    {variant === 'default' && (
                        <div className="h-20 w-20 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-navy border-r-secondary-gold animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <p className="text-lg font-semibold text-primary-navy">{message}</p>
                    <div className="flex justify-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-navy animate-pulse"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary-gold animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-navy animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
