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
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { supabase } from "@/integrations/supabase/client";

// This would typically come from your build process
const APP_VERSION = "1.0.0";

const Index = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    fetchProviders();
    fetchServiceOrders();
  }, []);

  const fetchServiceOrders = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          service_providers (
            name
          )
        `)
        .order('service_order_number');

      if (error) throw error;

      if (orders) {
        const formattedOrders: Part[] = orders.map(order => ({
          ...order,
          service_provider: order.service_providers?.name || '',
          status: calculateStatus(order.expected_return_date),
          images: Array.isArray(order.images) ? order.images : []
        }));
        setParts(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching service orders:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as ordens de serviço.",
        variant: "destructive",
      });
    }
  };

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

  const handleDeletePart = async (part: Part) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', part.id);

      if (error) throw error;

      setParts(parts.filter((p) => p.id !== part.id));
      toast({
        title: "OS excluída",
        description: `OS #${part.service_order_number} foi excluída com sucesso.`,
      });
    } catch (error) {
      console.error('Error deleting service order:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a ordem de serviço.",
        variant: "destructive",
      });
    }
  };

  const handleAddPart = async (newPart: Omit<Part, "id" | "status" | "archived">) => {
    try {
      const { service_provider, ...dbPart } = newPart;
      
      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          ...dbPart,
          archived: false,
          status: calculateStatus(newPart.expected_return_date),
          images: dbPart.images || []
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const formattedPart: Part = {
          ...data,
          service_provider: providers.find(p => p.id === data.service_provider_id)?.name || '',
          status: calculateStatus(data.expected_return_date),
          images: Array.isArray(data.images) ? data.images : []
        };
        setParts([...parts, formattedPart]);
        toast({
          title: "OS adicionada com sucesso",
          description: `OS #${formattedPart.service_order_number} foi adicionada ao sistema.`,
        });
      }
    } catch (error) {
      console.error('Error adding service order:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a ordem de serviço.",
        variant: "destructive",
      });
    }
  };

  const handleEditPart = async (updatedPart: Omit<Part, "id" | "status" | "archived">) => {
    if (!editingPart) return;

    try {
      const { service_provider, ...dbPart } = updatedPart;

      const { data, error } = await supabase
        .from('service_orders')
        .update({
          ...dbPart,
          status: calculateStatus(updatedPart.expected_return_date),
          images: dbPart.images || []
        })
        .eq('id', editingPart.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const formattedPart: Part = {
          ...data,
          service_provider: providers.find(p => p.id === data.service_provider_id)?.name || '',
          status: calculateStatus(data.expected_return_date),
          images: Array.isArray(data.images) ? data.images : []
        };
        setParts(parts.map((p) => (p.id === editingPart.id ? formattedPart : p)));
        toast({
          title: "OS atualizada com sucesso",
          description: `OS #${formattedPart.service_order_number} foi atualizada.`,
        });
      }
    } catch (error) {
      console.error('Error updating service order:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a ordem de serviço.",
        variant: "destructive",
      });
    }
  };

  const handleArchivePart = async (part: Part) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({
          archived: !part.archived
        })
        .eq('id', part.id);

      if (error) throw error;

      const updatedPart = { ...part, archived: !part.archived };
      setParts(parts.map((p) => (p.id === part.id ? updatedPart : p)));
      toast({
        title: part.archived ? "OS desarquivada" : "OS arquivada",
        description: `OS #${part.service_order_number} foi ${part.archived ? 'desarquivada' : 'arquivada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error archiving service order:', error);
      toast({
        title: "Erro",
        description: "Não foi possível arquivar/desarquivar a ordem de serviço.",
        variant: "destructive",
      });
    }
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
              <OrdersTable
                parts={filteredParts}
                onEditPart={setEditingPart}
                onDeletePart={handleDeletePart}
                onArchivePart={handleArchivePart}
              />
            </TabsContent>

            <TabsContent value="archived" className="space-y-6">
              <OrdersTable
                parts={filteredParts}
                onEditPart={setEditingPart}
                onDeletePart={handleDeletePart}
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

        <footer className="mt-8 text-center text-sm text-gray-500">
          Versão {APP_VERSION}
        </footer>
      </div>
    </div>
  );
};

export default Index;
