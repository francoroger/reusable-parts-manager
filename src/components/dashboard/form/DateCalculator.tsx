import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, differenceInDays } from "date-fns";
import { toast } from "@/components/ui/use-toast";

interface DateCalculatorProps {
  onDatesChange: (dates: {
    departureDate: string;
    expectedReturnDate: string;
    estimatedDuration: string;
  }) => void;
  initialDates?: {
    departureDate?: string;
    expectedReturnDate?: string;
    estimatedDuration?: string;
  };
}

export const DateCalculator = ({ onDatesChange, initialDates }: DateCalculatorProps) => {
  const [departureDate, setDepartureDate] = useState(initialDates?.departureDate || new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(initialDates?.expectedReturnDate || '');
  const [estimatedDuration, setEstimatedDuration] = useState(initialDates?.estimatedDuration || '');

  // Calculate duration when return date changes
  const handleReturnDateChange = (value: string) => {
    const returnDate = new Date(value);
    const departureDateTime = new Date(departureDate);

    if (returnDate <= departureDateTime) {
      toast({
        title: "Data inválida",
        description: "A data de retorno deve ser posterior à data de saída.",
        variant: "destructive",
      });
      return;
    }

    setExpectedReturnDate(value);
    const days = differenceInDays(returnDate, departureDateTime);
    if (days >= 1) {
      setEstimatedDuration(days.toString());
    }
  };

  // Calculate return date when duration changes
  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    
    if (isNaN(duration) || duration < 1) {
      toast({
        title: "Duração inválida",
        description: "O tempo previsto deve ser de pelo menos 1 dia.",
        variant: "destructive",
      });
      return;
    }

    setEstimatedDuration(value);
    const newExpectedDate = addDays(new Date(departureDate), duration);
    setExpectedReturnDate(newExpectedDate.toISOString().split('T')[0]);
  };

  // Handle departure date change
  const handleDepartureChange = (value: string) => {
    setDepartureDate(value);
    
    // If we have duration, update return date
    if (estimatedDuration && !isNaN(parseInt(estimatedDuration))) {
      const duration = parseInt(estimatedDuration);
      if (duration > 0) {
        const newExpectedDate = addDays(new Date(value), duration);
        setExpectedReturnDate(newExpectedDate.toISOString().split('T')[0]);
      }
    }
  };

  // Notify parent component of changes
  useEffect(() => {
    if (departureDate && expectedReturnDate && estimatedDuration) {
      onDatesChange({
        departureDate,
        expectedReturnDate,
        estimatedDuration,
      });
    }
  }, [departureDate, expectedReturnDate, estimatedDuration, onDatesChange]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureDate">Data de Saída</Label>
          <Input
            id="departureDate"
            type="date"
            value={departureDate}
            onChange={(e) => handleDepartureChange(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expectedReturnDate">Previsão de Retorno</Label>
          <Input
            id="expectedReturnDate"
            type="date"
            value={expectedReturnDate}
            onChange={(e) => handleReturnDateChange(e.target.value)}
            min={departureDate}
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
          value={estimatedDuration}
          onChange={(e) => handleDurationChange(e.target.value)}
          required
          placeholder="Digite o número de dias"
        />
      </div>
    </div>
  );
};