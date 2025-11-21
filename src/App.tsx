import { Provider } from 'react-redux';
import { store } from './store';
import AppRoutes from './routes/AppRoutes';
import { useEffect } from 'react';
import { useAppDispatch } from './store';
import { setCredentials, logout } from './features/auth/authSlice';
import api from './api/axios';
import './index.css';

// Component to handle auth initialization
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Verify token and get user data
          const response = await api.get('/auth/me');
          dispatch(setCredentials({ user: response.data, token }));
        } catch (error) {
          // Token is invalid, clear it
          dispatch(logout());
        }
      }
    };

    initAuth();
  }, [dispatch]);

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <AppRoutes />
      </AuthInitializer>
    </Provider>
  );
}

export default App;