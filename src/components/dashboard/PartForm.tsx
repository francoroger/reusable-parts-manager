import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Part, ServiceProvider } from "@/types/parts";
import { addDays } from "date-fns";
import { Search } from "lucide-react";

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

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        serviceOrderNumber: initialData.serviceOrderNumber,
        clientName: initialData.clientName,
        description: initialData.description,
        serviceProvider: initialData.serviceProvider,
        departureDate: initialData.departureDate.toISOString().split('T')[0],
        expectedReturnDate: initialData.expectedReturnDate.toISOString().split('T')[0],
        actualReturnDate: initialData.actualReturnDate ? initialData.actualReturnDate.toISOString().split('T')[0] : "",
        estimatedDuration: initialData.estimatedDuration.toString(),
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

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.contact?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      departureDate: new Date(formData.departureDate),
      expectedReturnDate: new Date(formData.expectedReturnDate),
      actualReturnDate: formData.actualReturnDate ? new Date(formData.actualReturnDate) : undefined,
      estimatedDuration: parseInt(formData.estimatedDuration),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="serviceProvider">Prestador de Serviço</Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Buscar prestador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={formData.serviceProvider}
                onValueChange={(value) => setFormData({ ...formData, serviceProvider: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um prestador" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.name}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate">Data de Saída</Label>
              <Input
                id="departureDate"
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedReturnDate">Previsão de Retorno</Label>
              <Input
                id="expectedReturnDate"
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) => handleExpectedDateChange(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimatedDuration">Tempo Previsto (dias)</Label>
            <Input
              id="estimatedDuration"
              type="number"
              min="1"
              value={formData.estimatedDuration}
              onChange={(e) => handleDurationChange(e.target.value)}
              required
            />
          </div>
          
          {initialData && (
            <div className="space-y-2">
              <Label htmlFor="actualReturnDate">Data de Retorno Real</Label>
              <Input
                id="actualReturnDate"
                type="date"
                value={formData.actualReturnDate}
                onChange={(e) => setFormData({ ...formData, actualReturnDate: e.target.value })}
              />
            </div>
          )}
          
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
  );
};
