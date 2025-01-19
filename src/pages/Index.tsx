import { useState, useEffect } from "react";
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
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { ServiceProviderList } from "@/components/dashboard/ServiceProviderList";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | undefined>();
  const { toast } = useToast();

  // Fetch providers on component mount
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) {
        setProviders(data);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os prestadores.",
        variant: "destructive",
      });
    }
  };

  const calculateStatus = (expected_return_date: string): Part["status"] => {
    const now = new Date();
    const daysUntilReturn = Math.ceil(
      (new Date(expected_return_date).getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (daysUntilReturn < 0) return "delayed";
    if (daysUntilReturn <= 2) return "warning";
    return "ontime";
  };

  const handleAddPart = (newPart: Omit<Part, "id" | "status" | "archived">) => {
    const part: Part = {
      ...newPart,
      id: Date.now().toString(),
      status: calculateStatus(newPart.expected_return_date),
      archived: false,
    };

    setParts([...parts, part]);
    toast({
      title: "OS adicionada com sucesso",
      description: `OS #${part.service_order_number} foi adicionada ao sistema.`,
    });
  };

  const handleEditPart = (updatedPart: Omit<Part, "id" | "status" | "archived">) => {
    if (!editingPart) return;

    const part: Part = {
      ...updatedPart,
      id: editingPart.id,
      status: calculateStatus(updatedPart.expected_return_date),
      archived: editingPart.archived || false,
    };

    setParts(parts.map((p) => (p.id === editingPart.id ? part : p)));
    toast({
      title: "OS atualizada com sucesso",
      description: `OS #${part.service_order_number} foi atualizada.`,
    });
  };

  const handleArchivePart = (part: Part) => {
    const updatedPart = { ...part, archived: !part.archived };
    setParts(parts.map((p) => (p.id === part.id ? updatedPart : p)));
    toast({
      title: part.archived ? "OS desarquivada" : "OS arquivada",
      description: `OS #${part.service_order_number} foi ${part.archived ? 'desarquivada' : 'arquivada'} com sucesso.`,
    });
  };

  const handleAddProvider = async (provider: ServiceProvider) => {
    await fetchProviders(); // Refresh the providers list after adding
    toast({
      title: "Prestador adicionado",
      description: `${provider.name} foi adicionado com sucesso.`,
    });
  };

  const handleUpdateProvider = async (updatedProvider: ServiceProvider) => {
    await fetchProviders(); // Refresh the providers list after updating
    toast({
      title: "Prestador atualizado",
      description: `${updatedProvider.name} foi atualizado com sucesso.`,
    });
  };

  const handleDeleteProvider = async (providerId: string) => {
    await fetchProviders(); // Refresh the providers list after deleting
    toast({
      title: "Prestador removido",
      description: "O prestador foi removido com sucesso.",
    });
  };

  const filteredParts = parts.filter(
    (part) =>
      part.service_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (part.service_provider || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 bg-gray-50 z-10 pb-4">
          <h1 className="text-3xl font-bold">Controle de OS Externa</h1>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={() => setIsAddingProvider(true)}
              variant="outline"
              className="animate-fade-in flex-1 md:flex-none whitespace-nowrap"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Prestador
            </Button>
            <Button 
              onClick={() => setIsAddingPart(true)} 
              className="animate-fade-in flex-1 md:flex-none whitespace-nowrap"
            >
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

        <div className="overflow-x-auto">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="active">OS Ativas</TabsTrigger>
              <TabsTrigger value="archived">Arquivadas</TabsTrigger>
              <TabsTrigger value="providers">Prestadores</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardView parts={filteredParts} />
            </TabsContent>

            <TabsContent value="kanban" className="space-y-6">
              <KanbanBoard
                parts={filteredParts}
                onEditPart={setEditingPart}
                onArchivePart={handleArchivePart}
              />
            </TabsContent>

            <TabsContent value="active" className="space-y-6">
              <PartsGrid
                parts={filteredParts.filter(part => !part.archived)}
                onEditPart={setEditingPart}
                onArchivePart={handleArchivePart}
              />
            </TabsContent>

            <TabsContent value="archived" className="space-y-6">
              <PartsGrid
                parts={filteredParts.filter(part => part.archived)}
                onEditPart={setEditingPart}
                onArchivePart={handleArchivePart}
                showArchived={true}
              />
            </TabsContent>

            <TabsContent value="providers" className="space-y-6">
              <ServiceProviderList
                providers={providers}
                onEdit={handleUpdateProvider}
                onDelete={handleDeleteProvider}
              />
            </TabsContent>
          </Tabs>
        </div>

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