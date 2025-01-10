import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays } from "date-fns";

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
  // Set today as default for departure date if not provided
  const today = new Date().toISOString().split('T')[0];
  const defaultDepartureDate = departureDate || today;

  const handleDepartureChange = (value: string) => {
    onDepartureChange(value);
    if (estimatedDuration) {
      const newExpectedDate = addDays(new Date(value), parseInt(estimatedDuration));
      onExpectedReturnChange(newExpectedDate.toISOString().split('T')[0]);
    }
  };

  const handleDurationChange = (value: string) => {
    onDurationChange(value);
    if (value && departureDate) {
      const newExpectedDate = addDays(new Date(departureDate), parseInt(value));
      onExpectedReturnChange(newExpectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureDate">Data de Saída</Label>
          <Input
            id="departureDate"
            type="date"
            value={defaultDepartureDate}
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
            onChange={(e) => onExpectedReturnChange(e.target.value)}
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
          />
        </div>
      )}
    </>
  );
};