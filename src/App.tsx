import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import AppRoutes from './routes/AppRoutes.tsx';
import { useEffect } from 'react';
import { useAppDispatch } from './store';
import { setCredentials, logout } from './domains/auth/store/authSlice';
import api from './shared/api/axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Component to handle auth initialization
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      console.log("AuthInitializer - token =", token);

      // if (token) {
      //   try {
      //     // Verify token and get user data
      //     const response = await api.get('/auth/me');
      //     dispatch(setCredentials({ user: response.data, token }));
      //   } catch (error) {
      //     // Token is invalid, clear it
      //     dispatch(logout());
      //   }
      // }
    };

    initAuth();
  }, []);

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <AuthInitializer>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </AuthInitializer>
      </PersistGate>
    </Provider>
  );
}

export default App;