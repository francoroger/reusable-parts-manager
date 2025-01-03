import { StatusCard } from "@/components/dashboard/StatusCard";
import { Part } from "@/types/parts";

interface PartsGridProps {
  parts: Part[];
  onEditPart: (part: Part) => void;
  onArchivePart: (part: Part) => void;
  showArchived?: boolean;
}

export const PartsGrid = ({ parts, onEditPart, onArchivePart, showArchived = false }: PartsGridProps) => {
  const filteredParts = parts.filter((part) => part.archived === showArchived);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredParts.map((part) => (
        <StatusCard
          key={part.id}
          part={part}
          onClick={() => onEditPart(part)}
          onArchive={() => onArchivePart(part)}
        />
      ))}
    </div>
  );
};