const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "مسودة", color: "bg-sand-700 text-sand-200" },
  RESEARCHING: { label: "جاري البحث", color: "bg-info/20 text-info" },
  WRITING: { label: "جاري الكتابة", color: "bg-accent/20 text-accent-light" },
  EDITING: { label: "جاري التحرير", color: "bg-warning/20 text-warning" },
  DIRECTING: { label: "جاري الإخراج", color: "bg-accent/20 text-accent" },
  QA: { label: "مراجعة الجودة", color: "bg-info/20 text-info" },
  COMPLETED: { label: "مكتمل", color: "bg-success/20 text-success" },
  FAILED: { label: "فشل", color: "bg-error/20 text-error" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    color: "bg-sand-700 text-sand-300",
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
