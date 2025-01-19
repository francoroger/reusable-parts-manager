import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, differenceInDays } from "date-fns";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface DateFieldsProps {
  departureDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  estimatedDuration: string;
  onDepartureChange: (value: string) => void;
  onExpectedReturnChange: (value: string) => void;
  onActualReturnChange?: (value: string) => void;
  onDurationChange: (value: string) => void;
  showActualReturn?: boolean;
}

export const DateFields = ({
  departureDate,
  expectedReturnDate,
  actualReturnDate,
  estimatedDuration,
  onDepartureChange,
  onExpectedReturnChange,
  onActualReturnChange,
  onDurationChange,
  showActualReturn,
}: DateFieldsProps) => {
  // Set default departure date to today if not provided
  useEffect(() => {
    if (!departureDate) {
      const today = new Date().toISOString().split('T')[0];
      onDepartureChange(today);
    }
  }, [departureDate, onDepartureChange]);

  // Handle departure date change
  const handleDepartureChange = (value: string) => {
    onDepartureChange(value);
    
    // If we have an estimated duration, update the expected return date
    if (estimatedDuration && !isNaN(parseInt(estimatedDuration))) {
      const duration = parseInt(estimatedDuration);
      if (duration > 0) {
        const newExpectedDate = addDays(new Date(value), duration);
        onExpectedReturnChange(newExpectedDate.toISOString().split('T')[0]);
      }
    }
  };

  // Handle duration change
  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    
    // Only proceed if we have a valid number
    if (!isNaN(duration)) {
      if (duration < 1) {
        toast({
          title: "Duração inválida",
          description: "O tempo previsto deve ser de pelo menos 1 dia.",
          variant: "destructive",
        });
        return;
      }

      onDurationChange(value);
      
      // Calculate new expected return date based on duration
      if (departureDate) {
        const newExpectedDate = addDays(new Date(departureDate), duration);
        onExpectedReturnChange(newExpectedDate.toISOString().split('T')[0]);
      }
    }
  };

  // Handle expected return date change
  const handleExpectedDateChange = (value: string) => {
    const selectedDate = new Date(value);
    const departureDateTime = new Date(departureDate);

    if (selectedDate <= departureDateTime) {
      toast({
        title: "Data inválida",
        description: "A data de retorno deve ser posterior à data de saída.",
        variant: "destructive",
      });
      return;
    }

    onExpectedReturnChange(value);
    
    // Calculate new duration based on the selected return date
    if (departureDate && value) {
      const days = differenceInDays(selectedDate, departureDateTime);
      if (days >= 1) {
        onDurationChange(days.toString());
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="departureDate" className="text-sm font-medium">
            Data de Saída
          </Label>
          <Input
            id="departureDate"
            type="date"
            value={departureDate}
            onChange={(e) => handleDepartureChange(e.target.value)}
            required
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expectedReturnDate" className="text-sm font-medium">
            Previsão de Retorno
          </Label>
          <Input
            id="expectedReturnDate"
            type="date"
            value={expectedReturnDate}
            onChange={(e) => handleExpectedDateChange(e.target.value)}
            required
            className="w-full"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="estimatedDuration" className="text-sm font-medium">
          Tempo Previsto (dias)
        </Label>
        <Input
          id="estimatedDuration"
          type="number"
          min="1"
          value={estimatedDuration}
          onChange={(e) => handleDurationChange(e.target.value)}
          required
          placeholder="Digite o número de dias"
          className="w-full"
        />
      </div>
      
      {showActualReturn && onActualReturnChange && (
        <div className="space-y-2">
          <Label htmlFor="actualReturnDate" className="text-sm font-medium">
            Data de Retorno Real
          </Label>
          <Input
            id="actualReturnDate"
            type="date"
            value={actualReturnDate}
            onChange={(e) => onActualReturnChange(e.target.value)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};