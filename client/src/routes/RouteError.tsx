import { useRouteError } from 'react-router';
import Button from '@/components/Button';

export default function RouteError() {
  const error = useRouteError();
  console.error(error);
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <h1 className="text-h1 font-semibold">Something broke</h1>
        <p className="mt-2 text-muted-foreground">Reload the page to try again.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    </main>
  );
}
