import { Outlet, Link } from "react-router-dom";
import { UserButton } from "@clerk/react";
import { Clapperboard } from "lucide-react";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800/50">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Clapperboard className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-50">Fanzy</span>
        </Link>
        <UserButton />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
