import { Part } from "@/types/parts";
import { StatusCard } from "./StatusCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";

interface KanbanBoardProps {
  parts: Part[];
  onEditPart: (part: Part) => void;
  onArchivePart: (part: Part) => void;
}

interface Column {
  id: Part["status"];
  title: string;
}

const columns: Column[] = [
  { id: "ontime", title: "No Prazo" },
  { id: "warning", title: "Próximo ao Prazo" },
  { id: "delayed", title: "Atrasado" },
];

export const KanbanBoard = ({ parts, onEditPart, onArchivePart }: KanbanBoardProps) => {
  const activeParts = parts.filter((p) => !p.archived);

  const getPartsForColumn = (status: Part["status"]) => {
    return activeParts.filter((part) => part.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`p-4 rounded-lg bg-opacity-10 ${
            column.id === "ontime"
              ? "bg-status-ontime"
              : column.id === "warning"
              ? "bg-status-warning"
              : "bg-status-delayed"
          }`}
        >
          <h3 className="font-semibold mb-4 text-lg">{column.title}</h3>
          <div className="space-y-4">
            {getPartsForColumn(column.id).map((part) => (
              <StatusCard
                key={part.id}
                part={part}
                onClick={() => onEditPart(part)}
                onArchive={() => onArchivePart(part)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};