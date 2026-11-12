import { Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { TextField } from '../components/FormField';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ApiError } from '../lib/api';
import { btnPrimary } from '../lib/ui';
import { mapServerErrors, validateRegister, type RegisterErrors } from '../lib/validation';
import AuthLayout from './AuthLayout';

function RegisterPage() {
  const { user, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user && !isSubmitting) return <Navigate to="/" replace />;

  function setField(field: keyof typeof values, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);

    const payload = { name: values.name.trim(), email: values.email.trim(), password: values.password };
    const clientErrors = validateRegister(payload);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const created = await register(payload);
      showToast({ type: 'success', message: `Akun dibuat. Selamat datang, ${created.name}.` });
      navigate('/', { replace: true });
    } catch (caught) {
      setIsSubmitting(false);
      if (caught instanceof ApiError) {
        const serverErrors = mapServerErrors(caught.details, ['name', 'email', 'password'] as const);
        // 409: email sudah terdaftar (backend tidak mengirim errors[], jadi tempelkan ke field email).
        if (caught.status === 409) serverErrors.email = caught.message;
        setErrors(serverErrors);
        if (Object.keys(serverErrors).length === 0) setFormError(caught.message);
      } else {
        setFormError('Gagal mendaftar. Coba lagi.');
      }
    }
  }

  return (
    <AuthLayout
      title="Daftar"
      description="Akun baru otomatis berperan sebagai customer."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={(event) => void handleSubmit(event)} noValidate className="space-y-4">
        {formError ? (
          <div role="alert" className="rounded-control bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
            {formError}
          </div>
        ) : null}

        <TextField
          label="Nama"
          autoComplete="name"
          value={values.name}
          onChange={(event) => setField('name', event.target.value)}
          error={errors.name}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => setField('email', event.target.value)}
          error={errors.email}
          placeholder="nama@email.com"
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => setField('password', event.target.value)}
          error={errors.password}
          hint="Minimal 8 karakter."
        />

        <button type="submit" disabled={isSubmitting} className={`${btnPrimary} w-full`}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? 'Memproses...' : 'Buat akun'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
