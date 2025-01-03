import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Part, PartStatus } from "@/types/parts";
import { Calendar, Clock, User } from "lucide-react";

interface StatusCardProps {
  part: Part;
  onClick?: () => void;
}

const getStatusColor = (status: PartStatus) => {
  switch (status) {
    case "ontime":
      return "bg-status-ontime";
    case "warning":
      return "bg-status-warning";
    case "delayed":
      return "bg-status-delayed";
  }
};

const getStatusText = (status: PartStatus) => {
  switch (status) {
    case "ontime":
      return "No Prazo";
    case "warning":
      return "Próximo ao Prazo";
    case "delayed":
      return "Atrasado";
  }
};

export const StatusCard = ({ part, onClick }: StatusCardProps) => {
  const daysLeft = Math.ceil(
    (part.expectedReturnDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  return (
    <Card
      className={cn(
        "p-6 cursor-pointer transition-all duration-300 hover:shadow-lg animate-fade-in",
        "border-l-4",
        `border-l-status-${part.status}`
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">OS #{part.serviceOrderNumber}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <User className="w-4 h-4 mr-1" />
            {part.clientName}
          </div>
        </div>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            `bg-status-${part.status}/10`,
            `text-status-${part.status}`
          )}
        >
          {getStatusText(part.status)}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Saída:
          </span>
          <span>{part.departureDate.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Retorno Previsto:
          </span>
          <span>{part.expectedReturnDate.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Tempo Restante:
          </span>
          <span>{daysLeft} dias</span>
        </div>
      </div>
    </Card>
  );
};