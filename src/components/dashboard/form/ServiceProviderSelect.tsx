import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceProvider } from "@/types/parts";

interface ServiceProviderSelectProps {
  value: string;
  onChange: (value: string) => void;
  providers: ServiceProvider[];
  onAddNew: () => void;
}

export const ServiceProviderSelect = ({ value, onChange, providers, onAddNew }: ServiceProviderSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.contact?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
        <div className="flex gap-2">
          <Select
            value={value}
            onValueChange={onChange}
            className="flex-1"
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
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddNew}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};