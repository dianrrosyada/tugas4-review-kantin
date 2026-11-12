import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TextAreaField, TextField } from '../components/FormField';
import StatePanel from '../components/StatePanel';
import { useAuth } from '../hooks/useAuth';
import { useStall } from '../hooks/useStall';
import { useToast } from '../hooks/useToast';
import { ApiError, createStall, updateStall } from '../lib/api';
import { canEditStall } from '../lib/permissions';
import { CATEGORIES } from '../lib/query';
import { btnPrimary, btnSecondary, cardClass } from '../lib/ui';
import {
  mapServerErrors,
  STALL_LIMITS,
  toStallPayload,
  validateStallForm,
  type StallFormErrors,
  type StallFormValues,
} from '../lib/validation';
import type { Stall } from '../types/stall';

const FIELDS = ['name', 'category', 'location', 'description'] as const;
const emptyValues: StallFormValues = { name: '', category: '', location: '', description: '' };

interface StallFormProps {
  stall: Stall | null;
}

/** Form dipakai untuk tambah (stall = null) dan ubah (stall terisi). */
function StallForm({ stall }: StallFormProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [values, setValues] = useState<StallFormValues>(
    stall
      ? {
          name: stall.name,
          category: stall.category ?? '',
          location: stall.location ?? '',
          description: stall.description ?? '',
        }
      : emptyValues,
  );
  const [errors, setErrors] = useState<StallFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField(field: keyof StallFormValues, value: string): void {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validateStallForm(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = toStallPayload(values);
      const saved = stall ? await updateStall(stall.id, payload) : await createStall(payload);
      showToast({
        type: 'success',
        message: stall ? `Warung "${saved.name}" berhasil diperbarui.` : `Warung "${saved.name}" berhasil ditambahkan.`,
      });
      navigate(`/stalls/${saved.id}`);
    } catch (caught) {
      if (caught instanceof ApiError) {
        // 400: pesan validasi per field dari backend; 403: bukan hakmu; selebihnya tampil di banner.
        const serverErrors = mapServerErrors(caught.details, FIELDS);
        setErrors(serverErrors);
        if (Object.keys(serverErrors).length === 0 || caught.status !== 400) {
          setFormError(caught.status === 403 ? `Ditolak server (403): ${caught.message}` : caught.message);
        }
      } else {
        setFormError('Gagal menyimpan warung.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className={`${cardClass} space-y-4 p-6`}>
      <div>
        <h1 className="font-heading text-[28px] font-bold">{stall ? 'Ubah warung' : 'Tambah warung'}</h1>
        <p className="mt-1 text-sm text-text-muted">
          Warung ini akan terdaftar atas akunmu.
        </p>
      </div>

      {formError ? (
        <div role="alert" className="rounded-control bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
          {formError}
        </div>
      ) : null}

      <TextField
        label="Nama warung"
        value={values.name}
        onChange={(event) => setField('name', event.target.value)}
        error={errors.name}
        placeholder="Mis. Warung Bu Tini"
        maxLength={STALL_LIMITS.name[1] + 20}
        autoComplete="off"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <TextField
            label="Kategori"
            value={values.category}
            onChange={(event) => setField('category', event.target.value)}
            error={errors.category}
            list="stall-categories"
            placeholder="Mis. Bakso"
            autoComplete="off"
          />
          <datalist id="stall-categories">
            {CATEGORIES.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
        <TextField
          label="Lokasi"
          value={values.location}
          onChange={(event) => setField('location', event.target.value)}
          error={errors.location}
          placeholder="Mis. Kantin FEB"
          autoComplete="off"
        />
      </div>

      <TextAreaField
        label="Deskripsi"
        value={values.description}
        onChange={(event) => setField('description', event.target.value)}
        error={errors.description}
        hint={`${values.description.length}/${STALL_LIMITS.description} karakter`}
        placeholder="Ceritakan menu andalan warungmu"
      />

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Link to={stall ? `/stalls/${stall.id}` : '/'} className={btnSecondary}>
          Batal
        </Link>
        <button type="submit" disabled={isSubmitting} className={btnPrimary}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? 'Menyimpan...' : stall ? 'Simpan perubahan' : 'Simpan warung'}
        </button>
      </div>
    </form>
  );
}

function StallFormPage() {
  const { id } = useParams();
  const isEdit = id !== undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={isEdit ? `/stalls/${id}` : '/'}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {isEdit ? 'Kembali ke detail warung' : 'Kembali ke daftar warung'}
      </Link>
      {isEdit ? <EditStall stallId={Number(id)} /> : <StallForm stall={null} />}
    </div>
  );
}

function EditStall({ stallId }: { stallId: number }) {
  const { user } = useAuth();
  const { stall, isLoading, error, reload } = useStall(stallId);

  if (isLoading) return <StatePanel variant="loading" />;

  if (error || !stall) {
    const notFound = error?.status === 404 || error?.status === 400;
    return (
      <StatePanel
        variant={notFound ? 'empty' : 'error'}
        title={notFound ? 'Warung tidak ditemukan' : 'Warung gagal dimuat'}
        message={notFound ? 'Warung yang ingin diubah tidak ada atau sudah dihapus.' : error?.message}
        actionLabel={notFound ? 'Lihat semua warung' : 'Coba lagi'}
        actionTo={notFound ? '/' : undefined}
        onAction={notFound ? undefined : reload}
      />
    );
  }

  // Cermin aturan backend: owner hanya boleh mengubah warung miliknya (admin boleh semua).
  if (!canEditStall(user, stall)) {
    return (
      <StatePanel
        variant="forbidden"
        message="Kamu hanya bisa mengubah warung milikmu sendiri."
        actionLabel="Kembali ke detail warung"
        actionTo={`/stalls/${stall.id}`}
      />
    );
  }

  return <StallForm key={stall.id} stall={stall} />;
}

export default StallFormPage;
