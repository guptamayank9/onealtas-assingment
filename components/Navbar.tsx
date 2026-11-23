import Link from "next/link";

const links = [
  { href: "/", label: "Models" },
  { href: "/compare", label: "Compare" },
  { href: "/rankings", label: "Rankings" },
  { href: "/labs", label: "Labs" },
  { href: "/providers", label: "Providers" },
];

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 text-sm">
        <Link href="/" className="text-base font-bold text-gray-900">OneAtlas</Link>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-gray-600 hover:text-gray-900">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}