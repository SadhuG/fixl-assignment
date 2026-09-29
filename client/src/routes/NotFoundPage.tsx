import { NotFoundView } from '@/components/States';

export default function NotFoundPage() {
  return (
    <main className="px-4">
      <NotFoundView title="Page not found" body="Check the address, or head back to your organizations." />
    </main>
  );
}
