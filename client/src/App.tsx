import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Show, SignInButton } from "@clerk/react";
import { Clapperboard } from "lucide-react";

import { Layout } from "@/components/Layout";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { PipelineDemoPage } from "@/pages/PipelineDemoPage";

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-50">Fanzy</span>
        </div>
        <SignInButton mode="modal">
          <button className="bg-gray-50 hover:bg-white text-gray-950 text-sm font-medium px-4 py-1.5 rounded-md transition-colors cursor-pointer">
            Sign in
          </button>
        </SignInButton>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-50">
            Fanzy
          </h1>
          <p className="text-gray-500 text-base max-w-sm mx-auto">
            AI-powered storyboard system for Arabic video production
          </p>
          <SignInButton mode="modal">
            <button className="bg-gray-50 hover:bg-white text-gray-950 font-medium px-6 py-2 rounded-md transition-colors cursor-pointer">
              Get started
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
            <Route path="/pipeline-demo" element={<PipelineDemoPage />} />
          </Route>
        </Routes>
      </Show>
    </BrowserRouter>
  );
}
