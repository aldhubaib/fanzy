interface NameEntry {
  nameAr: string;
  nameEn: string | null;
  role: string | null;
}

interface FactSheetData {
  nameRegistry: NameEntry[];
  facts: string[];
  timeline: string[];
  locations: string[];
}

interface FactSheetViewProps {
  data: FactSheetData;
}

function Section({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: unknown[];
  renderItem: (item: unknown, i: number) => React.ReactNode;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xs font-medium text-gray-500 mb-2">{title}</h3>
      <div className="space-y-1">{items.map(renderItem)}</div>
    </div>
  );
}

export function FactSheetView({ data }: FactSheetViewProps) {
  return (
    <div className="bg-gray-900 border border-gray-800/50 rounded-md p-5 space-y-6">
      <Section
        title="Characters"
        items={data.nameRegistry}
        renderItem={(item, i) => {
          const entry = item as NameEntry;
          return (
            <div
              key={i}
              className="flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-arabic text-gray-200">
                  {entry.nameAr}
                </span>
                {entry.nameEn && (
                  <span className="text-gray-600 text-xs">
                    {entry.nameEn}
                  </span>
                )}
              </div>
              {entry.role && (
                <span className="text-xs text-gray-600">{entry.role}</span>
              )}
            </div>
          );
        }}
      />

      <Section
        title="Facts"
        items={data.facts}
        renderItem={(item, i) => (
          <p
            key={i}
            dir="rtl"
            className="text-sm text-gray-300 font-arabic px-2 py-1 leading-relaxed"
          >
            {item as string}
          </p>
        )}
      />

      <Section
        title="Timeline"
        items={data.timeline}
        renderItem={(item, i) => (
          <p
            key={i}
            dir="rtl"
            className="text-sm text-gray-300 font-arabic px-2 py-1 leading-relaxed"
          >
            {item as string}
          </p>
        )}
      />

      <Section
        title="Locations"
        items={data.locations}
        renderItem={(item, i) => (
          <p
            key={i}
            dir="rtl"
            className="text-sm text-gray-300 font-arabic px-2 py-1 leading-relaxed"
          >
            {item as string}
          </p>
        )}
      />
    </div>
  );
}
