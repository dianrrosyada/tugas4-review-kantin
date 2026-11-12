import { Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { TextField } from '../components/FormField';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ApiError } from '../lib/api';
import { btnPrimary } from '../lib/ui';
import { mapServerErrors, validateLogin, type LoginErrors } from '../lib/validation';
import AuthLayout from './AuthLayout';

interface LocationState {
  from?: string;
  reason?: 'login-required';
}

function LoginPage() {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LocationState;
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user && !isSubmitting) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validateLogin(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const loggedIn = await login({ email: values.email.trim(), password: values.password });
      showToast({ type: 'success', message: `Selamat datang, ${loggedIn.name}.` });
      navigate(state.from ?? '/', { replace: true });
    } catch (caught) {
      setIsSubmitting(false);
      if (caught instanceof ApiError) {
        const serverErrors = mapServerErrors(caught.details, ['email', 'password'] as const);
        setErrors(serverErrors);
        // 401: email/password salah; 400: validasi; status 0: server tidak terjangkau.
        if (Object.keys(serverErrors).length === 0) setFormError(caught.message);
      } else {
        setFormError('Gagal masuk. Coba lagi.');
      }
    }
  }

  return (
    <AuthLayout
      title="Masuk"
      description="Masuk untuk mengelola warung atau memberi ulasan."
      footer={
        <>
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Daftar
          </Link>
        </>
      }
    >
      <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
        {state.reason === 'login-required' ? (
          <div role="status" className="rounded-control bg-warning-bg px-4 py-3 text-sm font-medium text-warning">
            Halaman itu butuh akun. Masuk dulu untuk melanjutkan.
          </div>
        ) : null}

        {formError ? (
          <div role="alert" className="rounded-control bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
            {formError}
          </div>
        ) : null}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          error={errors.email}
          placeholder="nama@email.com"
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
          error={errors.password}
        />

        <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full`}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
