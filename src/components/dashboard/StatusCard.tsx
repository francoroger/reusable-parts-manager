import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Part, PartStatus } from "@/types/parts";
import { Calendar, Clock, User, Building2, Archive, ArchiveRestore } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StatusCardProps {
  part: Part;
  onClick?: () => void;
  onArchive?: () => void;
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

export const StatusCard = ({ part, onClick, onArchive }: StatusCardProps) => {
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
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Building2 className="w-4 h-4 mr-1" />
            {part.serviceProvider}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              `bg-status-${part.status}/10`,
              `text-status-${part.status}`
            )}
          >
            {getStatusText(part.status)}
          </span>
          {onArchive && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {part.archived ? (
                    <ArchiveRestore className="h-4 w-4" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {part.archived ? "Desarquivar OS" : "Arquivar OS"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {part.archived
                      ? "Deseja desarquivar esta ordem de serviço?"
                      : "Deseja arquivar esta ordem de serviço?"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive();
                    }}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
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
        {part.actualReturnDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Retorno Real:
            </span>
            <span>{part.actualReturnDate.toLocaleDateString()}</span>
          </div>
        )}
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