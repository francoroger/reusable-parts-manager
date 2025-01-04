import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="departureDate">Data de Saída</Label>
          <Input
            id="departureDate"
            type="date"
            value={departureDate}
            onChange={(e) => onDepartureChange(e.target.value)}
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
          onChange={(e) => onDurationChange(e.target.value)}
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