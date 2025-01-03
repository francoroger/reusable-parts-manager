import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { PartForm } from "@/components/dashboard/PartForm";
import { ServiceProviderForm } from "@/components/dashboard/ServiceProviderForm";
import { Part, ServiceProvider } from "@/types/parts";
import { Plus, Search, UserPlus, KanbanSquare, LayoutDashboard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [viewMode, setViewMode] = useState<"dashboard" | "kanban">("dashboard");
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
      title: "OS adicionada com sucesso",
      description: `OS #${part.serviceOrderNumber} foi adicionada ao sistema.`,
    });
  };

  const handleAddProvider = (newProvider: Omit<ServiceProvider, "id">) => {
    const provider: ServiceProvider = {
      ...newProvider,
      id: Date.now().toString(),
    };
    
    setProviders([...providers, provider]);
    toast({
      title: "Prestador cadastrado com sucesso",
      description: `${provider.name} foi adicionado ao sistema.`,
    });
  };

  const filteredParts = parts.filter((part) =>
    part.serviceOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderKanbanView = () => {
    const columns = {
      ontime: filteredParts.filter(p => p.status === "ontime"),
      warning: filteredParts.filter(p => p.status === "warning"),
      delayed: filteredParts.filter(p => p.status === "delayed"),
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center text-status-ontime">
            No Prazo ({columns.ontime.length})
          </h3>
          <div className="space-y-4">
            {columns.ontime.map(part => (
              <StatusCard key={part.id} part={part} />
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center text-status-warning">
            Próximo ao Prazo ({columns.warning.length})
          </h3>
          <div className="space-y-4">
            {columns.warning.map(part => (
              <StatusCard key={part.id} part={part} />
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center text-status-delayed">
            Atrasado ({columns.delayed.length})
          </h3>
          <div className="space-y-4">
            {columns.delayed.map(part => (
              <StatusCard key={part.id} part={part} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Controle de Ordens de Serviço</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddingProvider(true)} variant="outline" className="animate-fade-in">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Prestador
            </Button>
            <Button onClick={() => setIsAddingPart(true)} className="animate-fade-in">
              <Plus className="mr-2 h-4 w-4" />
              Nova OS
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              className="pl-10"
              placeholder="Buscar por OS, cliente ou prestador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "dashboard" ? "default" : "outline"}
              onClick={() => setViewMode("dashboard")}
              className="animate-fade-in"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              onClick={() => setViewMode("kanban")}
              className="animate-fade-in"
            >
              <KanbanSquare className="mr-2 h-4 w-4" />
              Kanban
            </Button>
          </div>
        </div>

        {viewMode === "kanban" ? (
          renderKanbanView()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParts.map((part) => (
              <StatusCard
                key={part.id}
                part={part}
                onClick={() => {
                  toast({
                    title: "Detalhes da OS",
                    description: `Visualizando detalhes da OS #${part.serviceOrderNumber}`,
                  });
                }}
              />
            ))}
            
            {filteredParts.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                {searchTerm ? "Nenhuma OS encontrada" : "Nenhuma OS cadastrada"}
              </div>
            )}
          </div>
        )}

        <PartForm
          open={isAddingPart}
          onClose={() => setIsAddingPart(false)}
          onSubmit={handleAddPart}
        />

        <ServiceProviderForm
          open={isAddingProvider}
          onClose={() => setIsAddingProvider(false)}
          onSubmit={handleAddProvider}
        />
      </div>
    </div>
  );
};

export default Index;