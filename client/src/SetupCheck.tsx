import { Button } from '@/components/ui/button';

// Placeholder until the router lands (plan Task 6). Confirms Tailwind tokens and shadcn render.
export default function SetupCheck() {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <section className="w-full max-w-md rounded-panel border border-line bg-surface p-8">
        <h1 className="text-h1 font-semibold">TaskHive</h1>
        <p className="mt-2 text-small text-muted-foreground">Client scaffold is running.</p>
        <div className="mt-6 flex gap-2">
          <Button>Primary</Button>
          <Button variant="outline">Secondary</Button>
        </div>
      </section>
    </main>
  );
}
