import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PipelineView } from "@/components/pipeline/PipelineView";
import { DEMO_PIPELINE } from "@/components/pipeline/demo-data";

export function PipelineDemoPage() {
  return (
    <div className="max-w-[640px] mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Projects
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold text-gray-50 mb-1">
            Saudi Coffee Traditions
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Documentary</span>
            <span>·</span>
            <span>10 min</span>
            <span>·</span>
            <span>Gulf dialect</span>
            <span>·</span>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success">
              Complete
            </span>
          </div>
        </div>
      </div>

      <PipelineView data={DEMO_PIPELINE} />
    </div>
  );
}
