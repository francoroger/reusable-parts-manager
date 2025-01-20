import { Part } from "@/types/parts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Archive, ArchiveRestore } from "lucide-react";
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

interface OrdersTableProps {
  parts: Part[];
  onEditPart: (part: Part) => void;
  onDeletePart: (part: Part) => void;
  onArchivePart: (part: Part) => void;
  showArchived?: boolean;
}

export const OrdersTable = ({
  parts,
  onEditPart,
  onDeletePart,
  onArchivePart,
  showArchived = false,
}: OrdersTableProps) => {
  const filteredParts = parts.filter((part) => part.archived === showArchived);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>OS #</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Prestador</TableHead>
            <TableHead>Data Saída</TableHead>
            <TableHead>Previsão Retorno</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredParts.map((part) => (
            <TableRow key={part.id}>
              <TableCell>{part.service_order_number}</TableCell>
              <TableCell>{part.client_name}</TableCell>
              <TableCell>{part.service_provider}</TableCell>
              <TableCell>{formatDate(part.departure_date)}</TableCell>
              <TableCell>{formatDate(part.expected_return_date)}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${
                      part.status === 'delayed'
                        ? 'bg-red-100 text-red-800'
                        : part.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                >
                  {part.status === 'delayed'
                    ? 'Atrasado'
                    : part.status === 'warning'
                    ? 'Próximo ao Prazo'
                    : 'No Prazo'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditPart(part)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a OS #{part.service_order_number}?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeletePart(part)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onArchivePart(part)}
                  >
                    {part.archived ? (
                      <ArchiveRestore className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};