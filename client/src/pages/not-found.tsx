export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-6xl mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-faint)' }}>404</div>
      <p style={{ color: 'var(--color-text-muted)' }}>Page not found.</p>
    </div>
  );
}
