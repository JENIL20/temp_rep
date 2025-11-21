import { useAppSelector } from '../../../store';

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">Dashboard</h1>

        <div className="mb-5">
          <p className="text-base text-gray-700">
            Welcome, <span className="font-medium text-blue-600">{user?.name}</span>!
          </p>
          <p className="text-gray-600 text-sm">Role: {user?.role || 'User'}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Total Users */}
          <div className="rounded-lg bg-blue-50 p-4 shadow-sm">
            <h2 className="text-xs font-medium text-gray-500">Total Users</h2>
            <p className="mt-1 text-xl font-semibold text-gray-800">1,234</p>
          </div>

          {/* Active Sessions */}
          <div className="rounded-lg bg-green-50 p-4 shadow-sm">
            <h2 className="text-xs font-medium text-gray-500">Active Sessions</h2>
            <p className="mt-1 text-xl font-semibold text-gray-800">456</p>
          </div>

          {/* Revenue */}
          <div className="rounded-lg bg-yellow-50 p-4 shadow-sm">
            <h2 className="text-xs font-medium text-gray-500">Revenue</h2>
            <p className="mt-1 text-xl font-semibold text-gray-800">$12,345</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
