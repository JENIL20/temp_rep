interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fullScreen?: boolean;
    message?: string;
    className?: string;
    variant?: 'default' | 'dots' | 'pulse' | 'ring';
}

const LoadingSpinner = ({
    size = 'md',
    fullScreen = false,
    message,
    className = '',
    variant = 'default'
}: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24'
    };

    const dotSizes = {
        sm: 'h-2 w-2',
        md: 'h-3 w-3',
        lg: 'h-4 w-4',
        xl: 'h-5 w-5'
    };

    // Default spinner with gradient
    const DefaultSpinner = () => (
        <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-navy border-r-secondary-gold animate-spin"></div>
        </div>
    );

    // Dots spinner
    const DotsSpinner = () => (
        <div className="flex gap-2">
            <div className={`${dotSizes[size]} rounded-full bg-primary-navy animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${dotSizes[size]} rounded-full bg-secondary-gold animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${dotSizes[size]} rounded-full bg-primary-navy-light animate-bounce`} style={{ animationDelay: '300ms' }}></div>
        </div>
    );

    // Pulse spinner
    const PulseSpinner = () => (
        <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
            <div className="absolute inset-0 rounded-full bg-primary-navy opacity-75 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-secondary-gold opacity-75 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-navy to-secondary-gold`}></div>
        </div>
    );

    // Ring spinner with multiple circles
    const RingSpinner = () => (
        <div className={`${sizeClasses[size]} relative`}>
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-navy border-r-primary-navy-light animate-spin"></div>
            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-secondary-gold border-r-secondary-gold-light animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            {/* Inner ring */}
            <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-primary-navy-dark border-r-secondary-gold-dark animate-spin" style={{ animationDuration: '0.75s' }}></div>
        </div>
    );

    const renderSpinner = () => {
        switch (variant) {
            case 'dots':
                return <DotsSpinner />;
            case 'pulse':
                return <PulseSpinner />;
            case 'ring':
                return <RingSpinner />;
            default:
                return <DefaultSpinner />;
        }
    };

    const spinnerElement = (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            {renderSpinner()}
            {message && (
                <p className="text-sm text-primary-navy font-medium animate-pulse">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                    {spinnerElement}
                </div>
            </div>
        );
    }

    return spinnerElement;
};

export default LoadingSpinner;
