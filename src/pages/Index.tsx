import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartForm } from "@/components/dashboard/PartForm";
import { ServiceProviderForm } from "@/components/dashboard/ServiceProviderForm";
import { Part, ServiceProvider } from "@/types/parts";
import { Plus, Search, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { PartsGrid } from "@/components/dashboard/PartsGrid";

const Index = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | undefined>();
  const { toast } = useToast();

  const calculateStatus = (expectedDate: Date): Part["status"] => {
    const now = new Date();
    const daysUntilReturn = Math.ceil(
      (expectedDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (daysUntilReturn < 0) return "delayed";
    if (daysUntilReturn <= 2) return "warning";
    return "ontime";
  };

  const handleAddPart = (newPart: Omit<Part, "id" | "status" | "archived">) => {
    const part: Part = {
      ...newPart,
      id: Date.now().toString(),
      status: calculateStatus(newPart.expectedReturnDate),
      archived: false,
    };

    setParts([...parts, part]);
    toast({
      title: "OS adicionada com sucesso",
      description: `OS #${part.serviceOrderNumber} foi adicionada ao sistema.`,
    });
  };

  const handleEditPart = (updatedPart: Omit<Part, "id" | "status" | "archived">) => {
    if (!editingPart) return;

    const part: Part = {
      ...updatedPart,
      id: editingPart.id,
      status: calculateStatus(updatedPart.expectedReturnDate),
      archived: editingPart.archived || false,
    };

    setParts(parts.map((p) => (p.id === editingPart.id ? part : p)));
    toast({
      title: "OS atualizada com sucesso",
      description: `OS #${part.serviceOrderNumber} foi atualizada.`,
    });
  };

  const handleArchivePart = (part: Part) => {
    const updatedPart = { ...part, archived: true };
    setParts(parts.map((p) => (p.id === part.id ? updatedPart : p)));
    toast({
      title: "OS arquivada",
      description: `OS #${part.serviceOrderNumber} foi arquivada com sucesso.`,
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

  const filteredParts = parts.filter(
    (part) =>
      part.serviceOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Controle de Ordens de Serviço</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddingProvider(true)}
              variant="outline"
              className="animate-fade-in"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Prestador
            </Button>
            <Button onClick={() => setIsAddingPart(true)} className="animate-fade-in">
              <Plus className="mr-2 h-4 w-4" />
              Nova OS
            </Button>
          </div>
        </div>

        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            className="pl-10"
            placeholder="Buscar por OS, cliente ou prestador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="active">OS Ativas</TabsTrigger>
            <TabsTrigger value="archived">Arquivadas</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardView parts={filteredParts} />
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <PartsGrid
              parts={filteredParts}
              onEditPart={setEditingPart}
              onArchivePart={handleArchivePart}
            />
          </TabsContent>

          <TabsContent value="archived" className="space-y-6">
            <PartsGrid
              parts={filteredParts}
              onEditPart={setEditingPart}
              showArchived={true}
            />
          </TabsContent>
        </Tabs>

        <PartForm
          open={isAddingPart || !!editingPart}
          onClose={() => {
            setIsAddingPart(false);
            setEditingPart(undefined);
          }}
          onSubmit={editingPart ? handleEditPart : handleAddPart}
          providers={providers}
          initialData={editingPart}
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