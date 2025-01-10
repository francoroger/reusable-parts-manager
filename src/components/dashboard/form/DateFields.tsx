import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, differenceInDays } from "date-fns";
import { useEffect } from "react";

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
      const newExpectedDate = addDays(new Date(value), duration);
      onExpectedReturnChange(newExpectedDate.toISOString().split('T')[0]);
    }
  };

  // Handle duration change
  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    
    // Only proceed if we have a valid number
    if (!isNaN(duration) && duration >= 0) {
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
    onExpectedReturnChange(value);
    
    // Calculate new duration based on the selected return date
    if (departureDate && value) {
      const days = differenceInDays(new Date(value), new Date(departureDate));
      if (days >= 0) {
        onDurationChange(days.toString());
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureDate">Data de Saída</Label>
          <Input
            id="departureDate"
            type="date"
            value={departureDate}
            onChange={(e) => handleDepartureChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expectedReturnDate">Previsão de Retorno</Label>
          <Input
            id="expectedReturnDate"
            type="date"
            value={expectedReturnDate}
            onChange={(e) => handleExpectedDateChange(e.target.value)}
            min={departureDate}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="estimatedDuration">
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
        />
      </div>
      
      {showActualReturn && onActualReturnChange && (
        <div className="space-y-2">
          <Label htmlFor="actualReturnDate">Data de Retorno Real</Label>
          <Input
            id="actualReturnDate"
            type="date"
            value={actualReturnDate}
            onChange={(e) => onActualReturnChange(e.target.value)}
            min={departureDate}
          />
        </div>
      )}
    </div>
  );
};