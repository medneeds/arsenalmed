import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-musgo-300 bg-papel/92 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-5xl items-center px-4 md:px-6">
        <a href="/" aria-label="Arsenal Med — início" className="min-w-0">
          <Logo size={30} />
        </a>
      </div>
    </header>
  );
}
