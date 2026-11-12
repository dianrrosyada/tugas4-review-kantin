import StatePanel from '../components/StatePanel';

function NotFoundPage() {
  return (
    <StatePanel
      variant="empty"
      title="Halaman tidak ditemukan"
      message="Alamat yang kamu buka tidak ada di aplikasi ini."
      actionLabel="Ke daftar warung"
      actionTo="/"
    />
  );
}

export default NotFoundPage;
