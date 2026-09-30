import { Fragment } from 'react';

// Renders the two inline marks used in content.ts: `code` and _test name_.
export default function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|_[^_]+_)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('`')) {
          return (
            <code key={i} className="font-mono text-[0.92em] break-words text-ink">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
          return (
            <span key={i} className="text-ink">
              {part.slice(1, -1)}
            </span>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
