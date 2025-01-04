import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Part, ServiceProvider } from "@/types/parts";
import { addDays } from "date-fns";
import { ServiceProviderForm } from "./ServiceProviderForm";
import { ServiceProviderSelect } from "./form/ServiceProviderSelect";
import { DateFields } from "./form/DateFields";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface PartFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (part: Omit<Part, "id" | "status">) => void;
  providers: ServiceProvider[];
  initialData?: Part;
}

export const PartForm = ({ open, onClose, onSubmit, providers, initialData }: PartFormProps) => {
  const [formData, setFormData] = useState({
    serviceOrderNumber: "",
    clientName: "",
    description: "",
    serviceProvider: "",
    departureDate: "",
    expectedReturnDate: "",
    actualReturnDate: "",
    estimatedDuration: "",
    notes: "",
  });

  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        serviceOrderNumber: initialData.service_order_number,
        clientName: initialData.client_name,
        description: initialData.description || "",
        serviceProvider: initialData.service_provider || "",
        departureDate: initialData.departure_date.split('T')[0],
        expectedReturnDate: initialData.expected_return_date.split('T')[0],
        actualReturnDate: initialData.actual_return_date ? initialData.actual_return_date.split('T')[0] : "",
        estimatedDuration: initialData.estimated_duration.toString(),
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  const handleDurationChange = (duration: string) => {
    if (formData.departureDate && duration) {
      const newExpectedDate = addDays(new Date(formData.departureDate), parseInt(duration));
      setFormData({
        ...formData,
        estimatedDuration: duration,
        expectedReturnDate: newExpectedDate.toISOString().split('T')[0],
      });
    }
  };

  const handleExpectedDateChange = (date: string) => {
    if (formData.departureDate && date) {
      const days = Math.ceil(
        (new Date(date).getTime() - new Date(formData.departureDate).getTime()) / (1000 * 3600 * 24)
      );
      setFormData({
        ...formData,
        expectedReturnDate: date,
        estimatedDuration: days.toString(),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const partData = {
        service_order_number: formData.serviceOrderNumber,
        client_name: formData.clientName,
        description: formData.description,
        service_provider_id: selectedProvider?.id,
        departure_date: formData.departureDate,
        expected_return_date: formData.expectedReturnDate,
        actual_return_date: formData.actualReturnDate || null,
        estimated_duration: parseInt(formData.estimatedDuration),
        notes: formData.notes,
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
            service_provider: selectedProvider?.name || "",
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
    }
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
            <div className="space-y-2">
              <Label htmlFor="serviceOrderNumber">Número da OS</Label>
              <Input
                id="serviceOrderNumber"
                value={formData.serviceOrderNumber}
                onChange={(e) => setFormData({ ...formData, serviceOrderNumber: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <ServiceProviderSelect
              value={formData.serviceProvider}
              onChange={(value) => {
                const provider = providers.find(p => p.name === value);
                setSelectedProvider(provider || null);
                setFormData({ ...formData, serviceProvider: value });
              }}
              providers={providers}
              onAddNew={() => setIsAddingProvider(true)}
            />
            
            <DateFields
              departureDate={formData.departureDate}
              expectedReturnDate={formData.expectedReturnDate}
              actualReturnDate={formData.actualReturnDate}
              estimatedDuration={formData.estimatedDuration}
              onDepartureChange={(value) => setFormData({ ...formData, departureDate: value })}
              onExpectedReturnChange={handleExpectedDateChange}
              onActualReturnChange={(value) => setFormData({ ...formData, actualReturnDate: value })}
              onDurationChange={handleDurationChange}
              showActualReturn={!!initialData}
            />
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">{initialData ? 'Salvar' : 'Adicionar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ServiceProviderForm
        open={isAddingProvider}
        onClose={() => setIsAddingProvider(false)}
        onSubmit={(provider) => {
          setSelectedProvider(provider);
          setFormData({ ...formData, serviceProvider: provider.name });
          setIsAddingProvider(false);
        }}
      />
    </>
  );
};