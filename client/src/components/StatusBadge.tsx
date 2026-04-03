const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-800 text-gray-400" },
  RESEARCHING: { label: "Researching", color: "bg-info/10 text-info" },
  WRITING: { label: "Writing", color: "bg-warning/10 text-warning" },
  EDITING: { label: "Editing", color: "bg-gray-800 text-gray-300" },
  DIRECTING: { label: "Directing", color: "bg-gray-800 text-gray-300" },
  QA: { label: "QA Review", color: "bg-info/10 text-info" },
  COMPLETED: { label: "Completed", color: "bg-success/10 text-success" },
  FAILED: { label: "Failed", color: "bg-error/10 text-error" },
  PENDING: { label: "Pending", color: "bg-gray-800 text-gray-500" },
  PROCESSING: { label: "Processing", color: "bg-info/10 text-info" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    color: "bg-gray-800 text-gray-400",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
