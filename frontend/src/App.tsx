import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireRole from './components/RequireRole';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import StallDetailPage from './pages/StallDetailPage';
import StallFormPage from './pages/StallFormPage';
import StallListPage from './pages/StallListPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Publik */}
        <Route index element={<StallListPage />} />
        <Route path="stalls/:id" element={<StallDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Dilindungi: owner & admin. Backend tetap memeriksa ulang (401/403). */}
        <Route
          path="stalls/new"
          element={
            <RequireRole roles={['owner', 'admin']}>
              <StallFormPage />
            </RequireRole>
          }
        />
        <Route
          path="stalls/:id/edit"
          element={
            <RequireRole roles={['owner', 'admin']}>
              <StallFormPage />
            </RequireRole>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
