import { ServiceProvider } from "@/types/parts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { ServiceProviderForm } from "./ServiceProviderForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ServiceProviderListProps {
  providers: ServiceProvider[];
  onEdit: (provider: ServiceProvider) => void;
  onDelete: (providerId: string) => void;
}

export const ServiceProviderList = ({ providers, onEdit, onDelete }: ServiceProviderListProps) => {
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<ServiceProvider | null>(null);
  const { toast } = useToast();

  const handleDelete = async (providerId: string) => {
    try {
      // First, check if there are any service orders using this provider
      const { data: serviceOrders, error: checkError } = await supabase
        .from('service_orders')
        .select('id')
        .eq('service_provider_id', providerId);

      if (checkError) throw checkError;

      if (serviceOrders && serviceOrders.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: "Este prestador possui ordens de serviço associadas e não pode ser excluído.",
          variant: "destructive",
        });
        return;
      }

      // If no service orders exist, proceed with deletion
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', providerId);

      if (error) throw error;

      onDelete(providerId);
      toast({
        title: "Prestador excluído",
        description: "O prestador foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o prestador.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>{provider.name}</TableCell>
                <TableCell>{provider.contact}</TableCell>
                <TableCell>{provider.phone}</TableCell>
                <TableCell>{provider.email}</TableCell>
                <TableCell>{provider.address}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingProvider(provider)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingProvider(provider)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ServiceProviderForm
        open={!!editingProvider}
        onClose={() => setEditingProvider(null)}
        onSubmit={(provider) => {
          onEdit(provider);
          setEditingProvider(null);
        }}
        initialData={editingProvider || undefined}
      />

      <AlertDialog open={!!deletingProvider} onOpenChange={() => setDeletingProvider(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este prestador de serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingProvider) {
                  handleDelete(deletingProvider.id);
                }
                setDeletingProvider(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};