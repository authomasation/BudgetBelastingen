import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-blue-600 dark:bg-blue-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo / Titel */}
        <Link href="/" className="text-lg font-bold hover:underline">
          Home
        </Link>

        {/* Menu-items
        <nav className="flex gap-6">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/facturen" className="hover:underline">
            Facturen
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </nav> */}
      </div>
    </header>
  );
}
