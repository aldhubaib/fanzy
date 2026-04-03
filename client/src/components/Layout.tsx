import { Outlet, Link } from "react-router-dom";
import { UserButton } from "@clerk/react";
import { Clapperboard } from "lucide-react";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-sand-800/50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Clapperboard className="w-6 h-6 text-accent" />
          <span className="text-lg font-semibold text-sand-50">Fanzy</span>
        </Link>
        <UserButton />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
