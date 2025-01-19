import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Part, ServiceProvider } from "@/types/parts";
import { ServiceProviderForm } from "./ServiceProviderForm";
import { ServiceProviderSelect } from "./form/ServiceProviderSelect";
import { DateCalculator } from "./form/DateCalculator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { FormField } from "./form/FormFields";

interface PartFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (part: Omit<Part, "id" | "status" | "archived">) => void;
  providers: ServiceProvider[];
  initialData?: Part;
}

export const PartForm = ({ open, onClose, onSubmit, providers, initialData }: PartFormProps) => {
  const [formData, setFormData] = useState({
    serviceOrderNumber: "",
    clientName: "",
    description: "",
    serviceProvider: "",
    departureDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: "",
    actualReturnDate: "",
    estimatedDuration: "",
    notes: "",
  });

  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localProviders, setLocalProviders] = useState<ServiceProvider[]>(providers);

  useEffect(() => {
    setLocalProviders(providers);
  }, [providers]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        serviceOrderNumber: initialData.service_order_number,
        clientName: initialData.client_name,
        description: initialData.description || "",
        serviceProvider: initialData.service_provider_id || "",
        departureDate: initialData.departure_date.split('T')[0],
        expectedReturnDate: initialData.expected_return_date.split('T')[0],
        actualReturnDate: initialData.actual_return_date ? initialData.actual_return_date.split('T')[0] : "",
        estimatedDuration: initialData.estimated_duration.toString(),
        notes: initialData.notes || "",
      });
      const provider = providers.find(p => p.id === initialData.service_provider_id);
      setSelectedProvider(provider || null);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        serviceOrderNumber: "",
        clientName: "",
        description: "",
        serviceProvider: "",
        departureDate: today,
        expectedReturnDate: "",
        actualReturnDate: "",
        estimatedDuration: "",
        notes: "",
      });
      setSelectedProvider(null);
    }
  }, [initialData, providers, open]);

  const calculateStatus = (expected_return_date: string): Part["status"] => {
    const now = new Date();
    const daysUntilReturn = Math.ceil(
      (new Date(expected_return_date).getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (daysUntilReturn < 0) return "delayed";
    if (daysUntilReturn <= 2) return "warning";
    return "ontime";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedProvider) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um prestador de serviço.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const partData = {
        service_order_number: formData.serviceOrderNumber,
        client_name: formData.clientName,
        description: formData.description,
        service_provider_id: selectedProvider.id,
        departure_date: formData.departureDate,
        expected_return_date: formData.expectedReturnDate,
        actual_return_date: formData.actualReturnDate || null,
        estimated_duration: parseInt(formData.estimatedDuration),
        notes: formData.notes,
        status: calculateStatus(formData.expectedReturnDate),
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('service_orders')
          .update(partData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast({
          title: "OS atualizada",
          description: "A ordem de serviço foi atualizada com sucesso.",
        });
      } else {
        const { data, error } = await supabase
          .from('service_orders')
          .insert([partData])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const transformedData: Omit<Part, "id" | "status"> = {
            service_order_number: data.service_order_number,
            client_name: data.client_name,
            description: data.description,
            service_provider_id: data.service_provider_id,
            service_provider: selectedProvider.name,
            departure_date: data.departure_date,
            expected_return_date: data.expected_return_date,
            actual_return_date: data.actual_return_date,
            estimated_duration: data.estimated_duration,
            notes: data.notes,
          };
          onSubmit(transformedData);
          toast({
            title: "OS criada",
            description: "Nova ordem de serviço foi criada com sucesso.",
          });
        }
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar OS:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a ordem de serviço.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDatesChange = (dates: { departureDate: string; expectedReturnDate: string; estimatedDuration: string }) => {
    setFormData(prev => ({
      ...prev,
      departureDate: dates.departureDate,
      expectedReturnDate: dates.expectedReturnDate,
      estimatedDuration: dates.estimatedDuration,
    }));
  };

  const handleNewProvider = async (provider: ServiceProvider) => {
    setLocalProviders(prev => [...prev, provider]);
    setSelectedProvider(provider);
    setFormData(prev => ({ ...prev, serviceProvider: provider.id }));
    setIsAddingProvider(false);
    toast({
      title: "Prestador adicionado",
      description: "Novo prestador foi adicionado com sucesso.",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] w-full overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{initialData ? 'Editar' : 'Nova'} Ordem de Serviço</DialogTitle>
            <DialogDescription>
              Preencha os dados da ordem de serviço. As datas serão calculadas automaticamente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              id="serviceOrderNumber"
              label="Número da OS"
              value={formData.serviceOrderNumber}
              onChange={(value) => setFormData({ ...formData, serviceOrderNumber: value })}
              required
            />
            
            <FormField
              id="clientName"
              label="Nome do Cliente"
              value={formData.clientName}
              onChange={(value) => setFormData({ ...formData, clientName: value })}
              required
            />
            
            <FormField
              id="description"
              label="Descrição"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
            />
            
            <ServiceProviderSelect
              value={formData.serviceProvider}
              onChange={(value) => {
                const provider = localProviders.find(p => p.id === value);
                setSelectedProvider(provider || null);
                setFormData({ ...formData, serviceProvider: value });
              }}
              providers={localProviders}
              onAddNew={() => setIsAddingProvider(true)}
            />
            
            <DateCalculator
              onDatesChange={handleDatesChange}
              initialDates={{
                departureDate: formData.departureDate,
                expectedReturnDate: formData.expectedReturnDate,
                estimatedDuration: formData.estimatedDuration,
              }}
            />
            
            {initialData && (
              <FormField
                id="actualReturnDate"
                label="Data de Retorno Real"
                value={formData.actualReturnDate}
                onChange={(value) => setFormData({ ...formData, actualReturnDate: value })}
                type="date"
              />
            )}
            
            <FormField
              id="notes"
              label="Observações"
              value={formData.notes}
              onChange={(value) => setFormData({ ...formData, notes: value })}
            />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {initialData ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ServiceProviderForm
        open={isAddingProvider}
        onClose={() => setIsAddingProvider(false)}
        onSubmit={handleNewProvider}
      />
    </>
  );
};