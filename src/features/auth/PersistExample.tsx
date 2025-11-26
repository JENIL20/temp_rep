import { useAppSelector, useAppDispatch } from '../../store';
import { setCredentials, logout } from './authSlice';

/**
 * Example component demonstrating Redux Persist usage
 * 
 * This component shows how to:
 * 1. Access persisted state
 * 2. Update state (which will be automatically persisted)
 * 3. Clear persisted state
 */
export const PersistExample = () => {
    const dispatch = useAppDispatch();
    const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);

    // Example: Login (state will be automatically persisted)
    const handleLogin = () => {
        dispatch(
            setCredentials({
                user: {
                    id: '123',
                    email: 'user@example.com',
                    name: 'John Doe',
                    role: 'user',
                },
                token: 'sample-jwt-token',
            })
        );
    };

    // Example: Logout (persisted state will be cleared)
    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Redux Persist Demo</h2>

            <div className="mb-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold mb-2">Current State:</h3>
                <p className="text-sm">
                    <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
                </p>
                {user && (
                    <>
                        <p className="text-sm">
                            <strong>User:</strong> {user.name}
                        </p>
                        <p className="text-sm">
                            <strong>Email:</strong> {user.email}
                        </p>
                        <p className="text-sm">
                            <strong>Role:</strong> {user.role}
                        </p>
                    </>
                )}
                {token && (
                    <p className="text-sm">
                        <strong>Token:</strong> {token.substring(0, 20)}...
                    </p>
                )}
            </div>

            <div className="space-y-2">
                {!isAuthenticated ? (
                    <button
                        onClick={handleLogin}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Login (Test Persist)
                    </button>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Logout (Clear Persist)
                    </button>
                )}

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                        💡 <strong>Try this:</strong> Login, then refresh the page (F5).
                        Your login state will persist!
                    </p>
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-sm mb-2">How it works:</h4>
                <ul className="text-xs space-y-1 text-gray-700">
                    <li>✅ State is automatically saved to localStorage</li>
                    <li>✅ State is restored on page refresh</li>
                    <li>✅ No manual localStorage calls needed</li>
                    <li>✅ Works with all Redux actions</li>
                </ul>
            </div>
        </div>
    );
};

export default PersistExample;
