import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
import { store } from './store'; // Removed persistor import
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import { useAppDispatch, useAppSelector } from './store';
import { getCurrentUser } from './store/slices/authSlice';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Calendar from './features/calendar/Calendar';
// import Home from './features/home/Home'; // Remove unused import

// Lazy load pages
const Insights = React.lazy(() => import('./features/insights/Insights'));
const Community = React.lazy(() => import('./features/community/Community'));
const Profile = React.lazy(() => import('./features/profile/Profile'));

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-rose-quartz"></div>
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/calendar" replace /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/calendar" replace /> : <Register />} />
        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/calendar" replace />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="insights" element={<Insights />} />
          <Route path="community" element={<Community />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </React.Suspense>
  );
};

function App() {
  return (
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
        <Router>
          <AppContent />
        </Router>
      {/* </PersistGate> */}
    </Provider>
  );
}

export default App;
