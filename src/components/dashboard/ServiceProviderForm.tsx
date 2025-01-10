import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ServiceProvider } from "@/types/parts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { FormField } from "./form/FormFields";
import { DeleteConfirmation } from "./form/DeleteConfirmation";

interface ServiceProviderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (provider: ServiceProvider) => void;
  initialData?: ServiceProvider;
}

export const ServiceProviderForm = ({ open, onClose, onSubmit, initialData }: ServiceProviderFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        contact: initialData.contact || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
      });
    } else {
      setFormData({
        name: "",
        contact: "",
        phone: "",
        email: "",
        address: "",
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from('service_providers')
          .update(formData)
          .eq('id', initialData.id);

        if (error) throw error;
        
        const updatedProvider: ServiceProvider = {
          ...formData,
          id: initialData.id,
          created_at: initialData.created_at,
          updated_at: new Date().toISOString(),
        };
        
        onSubmit(updatedProvider);
        toast({
          title: "Prestador atualizado",
          description: "As informações foram atualizadas com sucesso.",
        });
      } else {
        const { data, error } = await supabase
          .from('service_providers')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const provider: ServiceProvider = {
            id: data.id,
            name: data.name,
            contact: data.contact,
            phone: data.phone,
            email: data.email,
            address: data.address,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
          onSubmit(provider);
          toast({
            title: "Prestador cadastrado",
            description: "Novo prestador foi adicionado com sucesso.",
          });
        }
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar prestador:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as informações.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    try {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', initialData.id);

      if (error) throw error;
      
      toast({
        title: "Prestador removido",
        description: "O prestador foi removido com sucesso.",
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao deletar prestador:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o prestador.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] w-full">
          <DialogHeader>
            <DialogTitle>{initialData ? 'Editar' : 'Cadastrar'} Prestador de Serviço</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              id="name"
              label="Nome da Empresa"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />
            
            <FormField
              id="contact"
              label="Pessoa de Contato"
              value={formData.contact}
              onChange={(value) => setFormData({ ...formData, contact: value })}
            />
            
            <FormField
              id="phone"
              label="Telefone"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
            />
            
            <FormField
              id="email"
              label="Email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              type="email"
            />
            
            <FormField
              id="address"
              label="Endereço"
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
            />
            
            <div className="flex justify-between items-center">
              {initialData && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">{initialData ? 'Salvar' : 'Cadastrar'}</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};