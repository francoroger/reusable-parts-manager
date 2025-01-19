import { Plus, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceProvider } from "@/types/parts";

interface ServiceProviderSelectProps {
  value: string;
  onChange: (value: string) => void;
  providers: ServiceProvider[];
  onAddNew: () => void;
  isLoading?: boolean;
}

export const ServiceProviderSelect = ({ value, onChange, providers, onAddNew, isLoading }: ServiceProviderSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="serviceProvider">Prestador de Serviço</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={value || undefined}
            onValueChange={onChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um prestador" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddNew}
          className="shrink-0"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};