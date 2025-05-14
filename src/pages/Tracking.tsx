
import { useState, useEffect } from "react";
import { Search, Package } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TrackingItem from "@/components/tracking/TrackingItem";
import rastreioService from "../../public/rastreio";

interface TrackingItemData {
  rowIndex: number;
  customerName: string;
  trackingCode: string;
  status: string;
  lastUpdated: string;
  product: string;
}

const Tracking = () => {
  const [trackingItems, setTrackingItems] = useState<TrackingItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Same indices as used in the Dashboard
  const NAME_INDEX = 4;
  const TRACKING_CODE_INDEX = 35;
  const TRACKING_STATUS_INDEX = 36;
  const PRODUCT_INDEX = 3;
  
  useEffect(() => {
    loadTrackingData();
  }, []);
  
  const loadTrackingData = async () => {
    setIsLoading(true);
    
    // Load data from localStorage
    const savedData = localStorage.getItem('clientData');
    
    if (!savedData) {
      toast({
        title: "Dados não encontrados",
        description: "Importe dados no Dashboard primeiro",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const parsedData = JSON.parse(savedData);
      
      // Skip header row and collect rows with tracking codes
      const trackingData: TrackingItemData[] = [];
      
      for (let i = 1; i < parsedData.length; i++) {
        const row = parsedData[i];
        const trackingCode = row[TRACKING_CODE_INDEX];
        
        if (trackingCode) {
          trackingData.push({
            rowIndex: i,
            customerName: row[NAME_INDEX] || "Cliente sem nome",
            trackingCode: trackingCode,
            status: row[TRACKING_STATUS_INDEX] || "Sem status",
            lastUpdated: "",
            product: row[PRODUCT_INDEX] || "Produto não especificado"
          });
        }
      }
      
      // Update status for all items that have tracking codes
      const updatedItems = await Promise.all(
        trackingData.map(async (item) => {
          if (item.trackingCode) {
            try {
              const trackingInfo = await rastreioService.getTrackingStatus(item.trackingCode);
              return {
                ...item,
                status: trackingInfo.status || "Status não disponível",
                lastUpdated: trackingInfo.data || "Data não disponível"
              };
            } catch (error) {
              console.error(`Erro ao rastrear ${item.trackingCode}:`, error);
              return item;
            }
          }
          return item;
        })
      );
      
      // Sort items by status priority
      const sortedItems = sortTrackingItemsByStatus(updatedItems);
      setTrackingItems(sortedItems);
      
      toast({
        title: "Rastreamento atualizado",
        description: `${trackingData.length} códigos de rastreio encontrados`,
      });
    } catch (error) {
      console.error("Erro ao processar dados de rastreamento:", error);
      toast({
        title: "Erro ao processar dados",
        description: "Verifique o formato dos dados importados",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };
  
  const sortTrackingItemsByStatus = (items: TrackingItemData[]): TrackingItemData[] => {
    // Define priority order based on status keywords
    const getPriority = (status: string) => {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes("entregue")) return 1;
      if (lowerStatus.includes("saiu para entrega")) return 2;
      if (lowerStatus.includes("em trânsito")) return 3;
      if (lowerStatus.includes("postado")) return 4;
      if (lowerStatus.includes("aguardando")) return 5;
      return 10; // Default priority for other statuses
    };
    
    return [...items].sort((a, b) => getPriority(a.status) - getPriority(b.status));
  };
  
  // Filter items by search term
  const filteredItems = trackingItems.filter(
    item => 
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Rastreamento de Pedidos</h2>
            
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar por cliente ou código de rastreio"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field"
                />
              </div>
              
              <Button 
                onClick={loadTrackingData} 
                className="w-full md:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Atualizando..." : "Atualizar status"}
              </Button>
            </div>
          </div>
          
          <div className="glass-card p-6">
            {isLoading ? (
              <div className="flex justify-center my-8">
                <p>Carregando dados de rastreamento...</p>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Status</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Código de Rastreio</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Status do Rastreio</TableHead>
                      <TableHead className="text-right">Última Atualização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item, index) => (
                      <TrackingItem 
                        key={index}
                        customerName={item.customerName}
                        trackingCode={item.trackingCode}
                        status={item.status}
                        lastUpdated={item.lastUpdated}
                        product={item.product}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum item para rastreamento</h3>
                <p className="text-gray-500">
                  {searchTerm ? 
                    `Nenhum resultado encontrado para "${searchTerm}"` : 
                    "Adicione códigos de rastreio aos pedidos no Dashboard para visualizá-los aqui"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Tracking;
