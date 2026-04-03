import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Show, SignInButton } from "@clerk/react";
import { Clapperboard } from "lucide-react";

import { Layout } from "@/components/Layout";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ProjectPage } from "@/pages/ProjectPage";

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-sand-800/50">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-6 h-6 text-accent" />
          <span className="text-lg font-semibold text-sand-50">Fanzy</span>
        </div>
        <SignInButton mode="modal">
          <button className="bg-accent hover:bg-accent-dark text-sand-950 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
            تسجيل الدخول
          </button>
        </SignInButton>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Clapperboard className="w-10 h-10 text-accent" />
            <h1 className="text-4xl font-bold tracking-tight text-sand-50">
              Fanzy
            </h1>
          </div>
          <p className="text-sand-400 text-lg max-w-md mx-auto">
            نظام الستوريبورد الذكي لإنتاج الفيديو العربي
          </p>
          <SignInButton mode="modal">
            <button className="bg-accent hover:bg-accent-dark text-sand-950 font-semibold px-8 py-3 rounded-xl text-lg transition-colors cursor-pointer">
              ابدأ الآن
            </button>
          </SignInButton>
        </div>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Show when="signed-out">
        <LandingPage />
      </Show>
      <Show when="signed-in">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
          </Route>
        </Routes>
      </Show>
    </BrowserRouter>
  );
}
