
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import StatusSection from "@/components/dashboard/StatusSection";
import { toast } from "@/components/ui/use-toast";
import OrdersList from "@/components/orders/OrdersList";

const Orders = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Índices para as colunas do Excel (mesmos usados no Dashboard)
  const STATUS_INDEX = 17;
  const NAME_INDEX = 4;
  const PHONE_INDEX = 6;
  const PRODUCT_INDEX = 3;
  const PRICE_INDEX = 19;
  const ADDRESS_INDEX = 8;  // Rua
  const ADDRESS_NUMBER_INDEX = 9; // Número
  const NEIGHBORHOOD_INDEX = 11; // Bairro
  const CITY_INDEX = 12; // Cidade
  const STATE_INDEX = 13; // Estado
  
  // Status groups with their respective statuses
  const statusGroups = [
    {
      title: 'Em Processamento | Agendado',
      statuses: ['Em Processamento', 'Agendado'],
      color: 'blue'
    },
    {
      title: 'Pagamento Aprovado',
      statuses: ['Pagamento Aprovado'],
      color: 'green'
    },
    {
      title: 'Aguardando Pagamento | Em Análise | Estorno Pendente',
      statuses: ['Aguardando Pagamento', 'Em Análise', 'Estorno Pendente', 'Pagamento Atrasado'],
      color: 'yellow'
    },
    {
      title: 'Cancelada | Chargeback | Devolvida | Frustrada',
      statuses: ['Cancelada', 'Chargeback', 'Devolvida', 'Frustrada'],
      color: 'red'
    }
  ];

  useEffect(() => {
    // Carregar dados do localStorage, se existirem
    const savedData = localStorage.getItem('clientData');
    setIsLoading(true);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setTableData(parsedData);
        toast({
          title: "Dados carregados",
          description: `${parsedData.length - 1} pedidos encontrados`,
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Verifique se há dados disponíveis no Dashboard.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Nenhum dado encontrado",
        description: "Por favor, importe seus dados no Dashboard primeiro.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  }, []);

  // Função para formatar endereço completo
  const formatFullAddress = (row: any[]) => {
    const street = row[ADDRESS_INDEX] || '';
    const number = row[ADDRESS_NUMBER_INDEX] || '';
    const neighborhood = row[NEIGHBORHOOD_INDEX] || '';
    const city = row[CITY_INDEX] || '';
    const state = row[STATE_INDEX] || '';
    
    return `${street}, ${number}, ${neighborhood}, ${city} - ${state}`;
  };

  // Função para formatar valor de compra
  const formatPrice = (price: string) => {
    if (!price) return "R$ 0,00";
    
    const numericPrice = typeof price === 'string' 
      ? parseFloat(price.replace(/[^\d,.-]/g, '').replace(',', '.')) 
      : parseFloat(price);
    
    return isNaN(numericPrice) 
      ? "R$ 0,00" 
      : `R$ ${numericPrice.toFixed(2).replace('.', ',')}`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Lista de Pedidos</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Buscar por nome ou telefone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                    className="pl-10 input-field"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {isLoading ? (
              <div className="glass-card p-8 text-center">
                <p>Carregando dados...</p>
              </div>
            ) : tableData.length > 0 ? (
              statusGroups.map(group => (
                <OrdersList
                  key={group.title}
                  title={group.title}
                  statuses={group.statuses}
                  data={tableData}
                  statusIndex={STATUS_INDEX}
                  nameIndex={NAME_INDEX}
                  phoneIndex={PHONE_INDEX}
                  productIndex={PRODUCT_INDEX}
                  priceIndex={PRICE_INDEX}
                  formatAddress={formatFullAddress}
                  formatPrice={formatPrice}
                  searchTerm={searchTerm}
                  color={group.color}
                />
              ))
            ) : (
              <div className="glass-card p-8 text-center">
                <h3 className="text-xl font-bold mb-2">Sem dados disponíveis</h3>
                <p className="text-gray-400 mb-6">
                  Importe um arquivo Excel no Dashboard para começar a gerenciar pedidos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
