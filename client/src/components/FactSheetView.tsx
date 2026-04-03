import { Users, BookOpen, MapPin, Clock } from "lucide-react";

interface NameEntry {
  canonical: string;
  variants: string[];
  role: string;
}

interface FactEntry {
  key: string;
  value: string;
  source?: string;
}

interface TimelineEvent {
  order: number;
  description: string;
  characters: string[];
}

interface Location {
  name: string;
  description: string;
  events: number[];
}

interface FactSheetData {
  facts: FactEntry[];
  nameRegistry: NameEntry[];
  timeline: TimelineEvent[];
  locations: Location[];
}

interface FactSheetViewProps {
  data: FactSheetData;
}

const FACT_LABELS: Record<string, string> = {
  setting: "الإطار",
  theme: "الموضوع",
  tone: "النبرة",
  conflict: "الصراع",
  resolution: "الحل",
  target_audience: "الجمهور",
  cultural_context: "السياق الثقافي",
};

export function FactSheetView({ data }: FactSheetViewProps) {
  return (
    <div className="space-y-6">
      <Section icon={<BookOpen className="w-5 h-5" />} title="الحقائق">
        <div className="space-y-3">
          {data.facts.map((fact, i) => (
            <div key={i} className="bg-sand-900/50 rounded-lg p-3">
              <span className="text-xs font-medium text-accent">
                {FACT_LABELS[fact.key] ?? fact.key}
              </span>
              <p className="text-sand-200 text-sm mt-1 leading-relaxed">
                {fact.value}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Users className="w-5 h-5" />} title="سجل الأسماء">
        <div className="space-y-3">
          {data.nameRegistry.map((entry, i) => (
            <div key={i} className="bg-sand-900/50 rounded-lg p-3">
              <div className="flex items-baseline gap-2">
                <span className="text-sand-50 font-semibold">
                  {entry.canonical}
                </span>
                {entry.variants.length > 0 && (
                  <span className="text-xs text-sand-500">
                    ({entry.variants.join("، ")})
                  </span>
                )}
              </div>
              <p className="text-sand-400 text-sm mt-0.5">{entry.role}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Clock className="w-5 h-5" />} title="الخط الزمني">
        <div className="relative">
          <div className="absolute right-[11px] top-2 bottom-2 w-0.5 bg-sand-800" />
          <div className="space-y-4">
            {data.timeline.map((event) => (
              <div key={event.order} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-xs text-accent font-mono shrink-0 relative z-10">
                  {event.order + 1}
                </div>
                <div className="pb-1">
                  <p className="text-sand-200 text-sm leading-relaxed">
                    {event.description}
                  </p>
                  {event.characters.length > 0 && (
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {event.characters.map((c, i) => (
                        <span
                          key={i}
                          className="text-xs bg-sand-800 text-sand-400 px-2 py-0.5 rounded-full"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {data.locations.length > 0 && (
        <Section icon={<MapPin className="w-5 h-5" />} title="الأماكن">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {data.locations.map((loc, i) => (
              <div key={i} className="bg-sand-900/50 rounded-lg p-3">
                <span className="text-sand-50 font-medium text-sm">
                  {loc.name}
                </span>
                <p className="text-sand-400 text-xs mt-0.5">
                  {loc.description}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent">{icon}</span>
        <h3 className="text-lg font-semibold text-sand-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}
