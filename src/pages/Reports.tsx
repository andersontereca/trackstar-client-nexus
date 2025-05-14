
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from "recharts";
import { Trophy, Download, FileSpreadsheet, RefreshCw, Upload, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Interfaces para organização dos dados
interface OrderData {
  status: string;
  purchaseDate: string;
  product: string;
  price: number;
}

interface SalesData {
  name: string;
  quantity: number;
  totalValue: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface DateData {
  date: string;
  orders: number;
  value: number;
}

// Cores para os diferentes status no gráfico de pizza
const STATUS_COLORS = {
  "Em processamento": "#8B5CF6",
  "Enviado": "#0EA5E9",
  "Entregue": "#10B981",
  "Cancelado": "#F97316",
  "Devolvido": "#ea384c",
  "Pendente": "#D946EF",
  "Agendado": "#0082C8",
  "Pagamento Aprovado": "#008000",
  "Aguardando Pagamento": "#FFD700",
  "Em Análise": "#FFA500",
  "Estorno Pendente": "#FF4500",
  "Chargeback": "#FF0000",
  "Frustrada": "#8B0000",
};

// Dados de exemplo para quando não há dados disponíveis
const EXAMPLE_DATA = [
  {
    status: "Em processamento",
    purchaseDate: "2025-05-10",
    product: "Smartphone XYZ",
    price: 1299.99
  },
  {
    status: "Enviado",
    purchaseDate: "2025-05-11",
    product: "Notebook ABC",
    price: 3499.99
  },
  {
    status: "Entregue",
    purchaseDate: "2025-05-09",
    product: "Fone de Ouvido",
    price: 299.99
  },
  {
    status: "Cancelado",
    purchaseDate: "2025-05-12",
    product: "Mouse Gamer",
    price: 199.99
  }
];

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [dateData, setDateData] = useState<DateData[]>([]);
  const [topProducts, setTopProducts] = useState<SalesData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [useExampleData, setUseExampleData] = useState(false);

  // Índices para as colunas do Excel (mesmos usados no Dashboard)
  const STATUS_INDEX = 17;  // Status do pedido
  const NAME_INDEX = 4;     // Nome do produto
  const PHONE_INDEX = 6;    // Não usado no relatório
  const CODE_INDEX = 35;    // Código de rastreio
  const PRICE_INDEX = 19;   // Valor do pedido
  const PURCHASE_DATE_INDEX = 22;  // Data de compra

  useEffect(() => {
    // Verificar se há dados no localStorage (como o Dashboard faz)
    const savedData = localStorage.getItem('clientData');
    if (savedData) {
      try {
        console.log("Dados encontrados no localStorage, processando...");
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          processClientDataFromLocalStorage(parsedData);
          return;
        }
      } catch (error) {
        console.error("Erro ao processar dados do localStorage:", error);
      }
    }
    
    // Se não houver dados no localStorage, carregue a biblioteca XLSX
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js';
      script.async = true;
      script.onload = () => {
        console.log("XLSX library loaded");
        loadExcelFile();
      };
      script.onerror = () => {
        setError("Falha ao carregar biblioteca XLSX");
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao carregar biblioteca XLSX"
        });
      };
      document.body.appendChild(script);
    } else {
      loadExcelFile();
    }
  }, [refreshTrigger]);

  // Nova função para processar dados do localStorage (como Dashboard faz)
  const processClientDataFromLocalStorage = (data: any[][]) => {
    try {
      setIsLoading(true);
      setError(null);
      setUseExampleData(false);
      
      console.log("Processando dados do localStorage...");
      
      if (!Array.isArray(data) || data.length < 2) {
        throw new Error("Formato de dados inválido ou vazio");
      }
      
      // Inicializar arrays para armazenar dados processados
      const orders: OrderData[] = [];
      
      // A primeira linha geralmente contém os cabeçalhos
      // Processar cada linha a partir da segunda linha (índice 1)
      for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];
        if (!row || !Array.isArray(row)) continue;
        
        // Extrair dados das colunas específicas
        const status = row[STATUS_INDEX];
        const productName = row[NAME_INDEX];
        const price = row[PRICE_INDEX];
        const purchaseDate = row[PURCHASE_DATE_INDEX];
        
        // Verificar se temos dados válidos antes de adicionar
        if (status || productName) {
          const order: OrderData = {
            status: status?.toString() || 'Pendente',
            purchaseDate: formatDate(purchaseDate),
            product: productName?.toString() || 'Desconhecido',
            price: typeof price === 'number' ? price : 
                 (typeof price === 'string' ? parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.')) : 0)
          };
          orders.push(order);
        }
      }
      
      console.log("Pedidos processados do localStorage:", orders.length);
      
      if (orders.length === 0) {
        throw new Error("Nenhum pedido encontrado nos dados");
      }
      
      // Atualizar o estado com os pedidos processados
      setOrderData(orders);
      processOrdersForCharts(orders);
      setIsLoading(false);
      toast({
        title: "Sucesso",
        description: "Dados do relatório carregados com sucesso"
      });
      
    } catch (error) {
      console.error("Erro ao processar dados:", error);
      setError(`Falha ao carregar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Falha ao processar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    }
  };

  const loadExcelFile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setUseExampleData(false);
      
      console.log("Fetching Excel file...");
      // Buscar o arquivo Excel
      const response = await fetch('/examples/orders.xlsx');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log("Excel file fetched, processing data...");
      
      const workbook = window.XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      if (!worksheet) {
        throw new Error("Planilha não encontrada no arquivo Excel");
      }
      
      // Converter para JSON para processamento
      const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log("Excel data converted to JSON");
      
      // Processar os dados para os gráficos
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        // Salvar no localStorage como o Dashboard faz
        localStorage.setItem('clientData', JSON.stringify(jsonData));
        processClientDataFromLocalStorage(jsonData);
      } else {
        throw new Error("Formato de dados inválido ou vazio");
      }
      
    } catch (error) {
      console.error("Erro ao processar dados do Excel:", error);
      setError(`Falha ao carregar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Falha ao carregar dados do relatório: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      
      // Use dados de exemplo para demonstração se não conseguir carregar
      processOrderDataFromExample();
    }
  };

  // Função para processar dados de exemplo quando o arquivo real não está disponível
  const processOrderDataFromExample = () => {
    setUseExampleData(true);
    
    // Usar dados de exemplo para demonstração
    const orders = [...EXAMPLE_DATA];
    setOrderData(orders);
    
    // Processar os dados para os gráficos
    processOrdersForCharts(orders);
  };
  
  // Função centralizada para processar pedidos para os gráficos
  const processOrdersForCharts = (orders: OrderData[]) => {
    // Processar dados para o gráfico de pizza (status)
    const statusCounts: Record<string, number> = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    const statusChartData = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status],
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#9b87f5"
    }));
    
    setStatusData(statusChartData);
    console.log("Status data for pie chart:", statusChartData);
    
    // Processar dados para o gráfico de barras (datas)
    const dateGroups: Record<string, { orders: number, value: number }> = {};
    orders.forEach(order => {
      if (!dateGroups[order.purchaseDate]) {
        dateGroups[order.purchaseDate] = { orders: 0, value: 0 };
      }
      dateGroups[order.purchaseDate].orders += 1;
      dateGroups[order.purchaseDate].value += order.price;
    });
    
    const dateChartData = Object.keys(dateGroups)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => ({
        date,
        orders: dateGroups[date].orders,
        value: Math.round(dateGroups[date].value * 100) / 100
      }));
    
    setDateData(dateChartData);
    console.log("Date data for bar chart:", dateChartData);
    
    // Processar ranking de produtos
    const productData: Record<string, { quantity: number, totalValue: number }> = {};
    orders.forEach(order => {
      if (!productData[order.product]) {
        productData[order.product] = { quantity: 0, totalValue: 0 };
      }
      productData[order.product].quantity += 1;
      productData[order.product].totalValue += order.price;
    });
    
    const productsRanked = Object.keys(productData)
      .map(name => ({
        name,
        quantity: productData[name].quantity,
        totalValue: Math.round(productData[name].totalValue * 100) / 100
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
    
    setTopProducts(productsRanked);
    console.log("Top products:", productsRanked);
    
    // Calcular faturamento total
    const revenue = orders.reduce((sum, order) => sum + order.price, 0);
    setTotalRevenue(Math.round(revenue * 100) / 100);
    console.log("Total revenue:", revenue);
  };

  // Função para formatar a data do Excel
  const formatDate = (excelDate: any): string => {
    // Se já for uma string formatada, retornar
    if (typeof excelDate === 'string') {
      // Tentar formatar se for uma data válida
      try {
        const date = new Date(excelDate);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Error formatting date string:", e);
      }
      return excelDate;
    }
    
    // Se for um número (formato Excel), converter para data
    if (typeof excelDate === 'number') {
      try {
        // O Excel armazena datas como dias desde 01/01/1900
        // com uma diferença de 1 (bug histórico do Excel)
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
      } catch (e) {
        console.error("Erro ao converter data do Excel:", e);
      }
    }
    
    // Retornar data atual se não for possível converter
    return new Date().toISOString().split('T')[0];
  };

  // Formatar para moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para atualizar os dados
  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Relatórios de Vendas</h1>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw size={16} />
            Atualizar Dados
          </Button>
        </div>
        
        {useExampleData && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Usando dados de exemplo</AlertTitle>
            <AlertDescription>
              O sistema está usando dados de exemplo para demonstração. Para visualizar dados reais, 
              importe uma planilha Excel no Dashboard.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{orderData.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Faturamento Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {orderData.length > 0 
                  ? formatCurrency(totalRevenue / orderData.length) 
                  : formatCurrency(0)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Pedidos</CardTitle>
                  <CardDescription>Distribuição por status</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {!isLoading && statusData.length > 0 ? (
                    <ChartContainer 
                      config={{
                        status: {
                          label: "Status dos Pedidos",
                          theme: {
                            light: "#9b87f5",
                            dark: "#9b87f5"
                          }
                        }
                      }}
                    >
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => 
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      {isLoading ? (
                        <p>Carregando dados...</p>
                      ) : error ? (
                        <div className="text-center space-y-2">
                          <p className="text-destructive">{error}</p>
                          <div className="flex gap-2 justify-center mt-2">
                            <Button size="sm" variant="outline" onClick={handleRefresh}>
                              Tentar novamente
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <p>Não há dados disponíveis</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileSpreadsheet size={16} />
                            <span>Importe uma planilha Excel no Dashboard para visualizar os dados</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Orders by Date Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Compras por Data</CardTitle>
                  <CardDescription>Quantidade de compras por data</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {!isLoading && dateData.length > 0 ? (
                    <ChartContainer
                      config={{
                        orders: {
                          label: "Pedidos",
                          theme: {
                            light: "#8B5CF6",
                            dark: "#8B5CF6"
                          }
                        },
                        value: {
                          label: "Valor (R$)",
                          theme: {
                            light: "#0EA5E9",
                            dark: "#0EA5E9"
                          }
                        }
                      }}
                    >
                      <BarChart data={dateData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar 
                          yAxisId="left"
                          dataKey="orders" 
                          name="Pedidos" 
                          fill="#8B5CF6" 
                        />
                        <Bar 
                          yAxisId="right"
                          dataKey="value" 
                          name="Valor (R$)" 
                          fill="#0EA5E9"
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      {isLoading ? (
                        <p>Carregando dados...</p>
                      ) : error ? (
                        <div className="text-center space-y-2">
                          <p className="text-destructive">{error}</p>
                          <div className="flex gap-2 justify-center mt-2">
                            <Button size="sm" variant="outline" onClick={handleRefresh}>
                              Tentar novamente
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <p>Não há dados disponíveis</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileSpreadsheet size={16} />
                            <span>Importe uma planilha Excel no Dashboard para visualizar os dados</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                </div>
                <CardDescription>Top 10 produtos por faturamento</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Ranking</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd. Vendida</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={product.name}>
                        <TableCell className="font-medium">
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.totalValue)}</TableCell>
                      </TableRow>
                    ))}
                    {isLoading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          Carregando dados...
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && topProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          {error ? (
                            <div className="space-y-2">
                              <p className="text-destructive">{error}</p>
                              <div className="flex gap-2 justify-center mt-2">
                                <Button size="sm" variant="outline" onClick={handleRefresh}>
                                  Tentar novamente
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p>Nenhum dado de produto disponível</p>
                              <div className="flex justify-center items-center gap-2 text-sm">
                                <FileSpreadsheet size={16} />
                                <span>Importe uma planilha Excel no Dashboard para visualizar os dados</span>
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Total: {topProducts.reduce((sum, p) => sum + p.quantity, 0)} itens vendidos
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download size={14} />
                  Exportar
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;

