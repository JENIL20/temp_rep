import LoadingSpinner from './LoadingSpinner';
import PageLoader from './PageLoader';

/**
 * Loading Components Usage Guide
 * 
 * This file demonstrates how to use the themed loading components
 * throughout the application.
 */

// Example 1: Full Page Loading with different variants
export const PageLoadingExamples = () => {
    return (
        <div className="space-y-4">
            {/* Ring variant (default) */}
            <PageLoader message="Loading your dashboard..." variant="ring" />

            {/* Dots variant */}
            <PageLoader message="Fetching data..." variant="dots" />

            {/* Pulse variant */}
            <PageLoader message="Please wait..." variant="pulse" />

            {/* Default variant */}
            <PageLoader message="Loading..." variant="default" />
        </div>
    );
};

// Example 2: Inline Loading Spinner variants
export const InlineLoadingExamples = () => {
    return (
        <div className="space-y-4">
            {/* Default spinner */}
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-navy text-white rounded">
                <LoadingSpinner size="sm" variant="default" />
                <span>Processing...</span>
            </button>

            {/* Dots spinner */}
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary-gold text-primary-navy rounded">
                <LoadingSpinner size="sm" variant="dots" />
                <span>Saving...</span>
            </button>

            {/* Pulse spinner */}
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-navy-light text-white rounded">
                <LoadingSpinner size="sm" variant="pulse" />
                <span>Uploading...</span>
            </button>
        </div>
    );
};

// Example 3: Card/Section Loading with different sizes
export const CardLoadingExamples = () => {
    return (
        <div className="space-y-6">
            {/* Small */}
            <div className="bg-white p-6 rounded-lg shadow">
                <LoadingSpinner size="sm" variant="ring" message="Loading..." />
            </div>

            {/* Medium */}
            <div className="bg-white p-6 rounded-lg shadow">
                <LoadingSpinner size="md" variant="dots" message="Fetching courses..." />
            </div>

            {/* Large */}
            <div className="bg-white p-6 rounded-lg shadow">
                <LoadingSpinner size="lg" variant="pulse" message="Processing data..." />
            </div>

            {/* Extra Large */}
            <div className="bg-white p-6 rounded-lg shadow">
                <LoadingSpinner size="xl" variant="ring" message="Please wait..." />
            </div>
        </div>
    );
};

// Example 4: Full Screen Overlay Loading
export const OverlayLoadingExample = () => {
    const isSubmitting = true;

    return (
        <div>
            {isSubmitting && (
                <LoadingSpinner
                    size="lg"
                    fullScreen
                    variant="ring"
                    message="Saving your changes..."
                />
            )}
            <form>
                {/* Your form content */}
            </form>
        </div>
    );
};

// Example 5: Different variants showcase
export const VariantsShowcase = () => {
    return (
        <div className="grid grid-cols-2 gap-8 p-8">
            <div className="text-center">
                <h3 className="text-primary-navy font-semibold mb-4">Default Spinner</h3>
                <LoadingSpinner size="lg" variant="default" message="Loading..." />
            </div>

            <div className="text-center">
                <h3 className="text-primary-navy font-semibold mb-4">Dots Spinner</h3>
                <LoadingSpinner size="lg" variant="dots" message="Processing..." />
            </div>

            <div className="text-center">
                <h3 className="text-primary-navy font-semibold mb-4">Pulse Spinner</h3>
                <LoadingSpinner size="lg" variant="pulse" message="Uploading..." />
            </div>

            <div className="text-center">
                <h3 className="text-primary-navy font-semibold mb-4">Ring Spinner</h3>
                <LoadingSpinner size="lg" variant="ring" message="Saving..." />
            </div>
        </div>
    );
};

// Example 6: Themed button states
export const ButtonLoadingStates = () => {
    return (
        <div className="flex flex-wrap gap-4">
            {/* Primary button loading */}
            <button
                disabled
                className="flex items-center gap-2 px-6 py-3 bg-primary-navy text-white rounded-lg opacity-75 cursor-not-allowed"
            >
                <LoadingSpinner size="sm" variant="default" />
                <span>Submitting...</span>
            </button>

            {/* Secondary button loading */}
            <button
                disabled
                className="flex items-center gap-2 px-6 py-3 bg-secondary-gold text-primary-navy rounded-lg opacity-75 cursor-not-allowed"
            >
                <LoadingSpinner size="sm" variant="dots" />
                <span>Processing...</span>
            </button>

            {/* Outline button loading */}
            <button
                disabled
                className="flex items-center gap-2 px-6 py-3 border-2 border-primary-navy text-primary-navy rounded-lg opacity-75 cursor-not-allowed"
            >
                <LoadingSpinner size="sm" variant="ring" />
                <span>Loading...</span>
            </button>
        </div>
    );
};
