import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { PartForm } from "@/components/dashboard/PartForm";
import { Part } from "@/types/parts";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingPart, setIsAddingPart] = useState(false);
  const { toast } = useToast();

  const calculateStatus = (expectedDate: Date): Part["status"] => {
    const now = new Date();
    const daysUntilReturn = Math.ceil((expectedDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilReturn < 0) return "delayed";
    if (daysUntilReturn <= 2) return "warning";
    return "ontime";
  };

  const handleAddPart = (newPart: Omit<Part, "id" | "status">) => {
    const part: Part = {
      ...newPart,
      id: Date.now().toString(),
      status: calculateStatus(newPart.expectedReturnDate),
    };
    
    setParts([...parts, part]);
    toast({
      title: "Peça adicionada com sucesso",
      description: `${part.name} foi adicionada ao sistema.`,
    });
  };

  const filteredParts = parts.filter((part) =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Controle de Peças Externas</h1>
          <Button onClick={() => setIsAddingPart(true)} className="animate-fade-in">
            <Plus className="mr-2 h-4 w-4" />
            Nova Peça
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            className="pl-10"
            placeholder="Buscar por nome da peça ou prestador de serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map((part) => (
            <StatusCard
              key={part.id}
              part={part}
              onClick={() => {
                // Implement part details view in the future
                toast({
                  title: "Detalhes da Peça",
                  description: `Visualizando detalhes de ${part.name}`,
                });
              }}
            />
          ))}
          
          {filteredParts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              {searchTerm ? "Nenhuma peça encontrada" : "Nenhuma peça cadastrada"}
            </div>
          )}
        </div>

        <PartForm
          open={isAddingPart}
          onClose={() => setIsAddingPart(false)}
          onSubmit={handleAddPart}
        />
      </div>
    </div>
  );
};

export default Index;