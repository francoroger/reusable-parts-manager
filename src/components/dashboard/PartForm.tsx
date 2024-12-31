import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Part } from "@/types/parts";

interface PartFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (part: Omit<Part, "id" | "status">) => void;
}

export const PartForm = ({ open, onClose, onSubmit }: PartFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    serviceProvider: "",
    departureDate: "",
    expectedReturnDate: "",
    estimatedDuration: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      departureDate: new Date(formData.departureDate),
      expectedReturnDate: new Date(formData.expectedReturnDate),
      estimatedDuration: parseInt(formData.estimatedDuration),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Peça</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Peça</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <Input
              id="serviceProvider"
              value={formData.serviceProvider}
              onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
              required
            />
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
                onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
              required
            />
          </div>
          
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
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};