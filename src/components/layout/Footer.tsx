// Pied de page global, affiché sur toutes les pages (voir layout.tsx).
export function Footer() {
  return (
    <footer className="mt-12 border-t border-zinc-800 py-6 text-center text-sm text-zinc-500">
      Fait par{" "}
      <a
        href="https://webtonny.com"
        target="_blank"
        rel="noreferrer"
        className="text-zinc-400 hover:text-indigo-400 hover:underline"
      >
        Tonny
      </a>{" "}
      avec Next.js
    </footer>
  );
}
