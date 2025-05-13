
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
import { Trophy, Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
};

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [dateData, setDateData] = useState<DateData[]>([]);
  const [topProducts, setTopProducts] = useState<SalesData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const processExcelData = async () => {
      try {
        setIsLoading(true);
        // Verificar se a biblioteca XLSX está carregada
        if (!window.XLSX) {
          toast.error("Biblioteca Excel não carregada. Por favor, atualize a página.");
          return;
        }

        // Buscar o arquivo Excel
        const response = await fetch('/examples/orders.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        
        const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Converter para JSON para processamento
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Processar os dados para os gráficos
        processOrderData(jsonData);
        toast.success("Dados do relatório carregados com sucesso");
        
      } catch (error) {
        console.error("Erro ao processar dados do Excel:", error);
        toast.error("Falha ao carregar dados do relatório");
      } finally {
        setIsLoading(false);
      }
    };

    processExcelData();
  }, [refreshTrigger]);

  // Mapeia os dados do Excel para os campos corretos baseado nas linhas específicas
  const processOrderData = (data: any[][]) => {
    if (!Array.isArray(data) || data.length < 23) {
      toast.error("Formato de dados inválido ou incompleto");
      return;
    }
    
    // Encontrar o cabeçalho (normalmente na primeira linha)
    // E mapear as colunas para os índices corretos
    const headerRow = data[0] || [];
    
    // Índices específicos mencionados pelo usuário
    const STATUS_ROW = 14;  // linha 14 para Status
    const PURCHASE_DATE_ROW = 22; // linha 22 para Data de Compra
    const PRODUCT_ROW = 4; // linha 4 para Produto 
    const PRICE_ROW = 19; // linha 19 para Valor
    
    // Inicializar arrays para armazenar dados processados
    const orders: OrderData[] = [];
    
    // Processar cada coluna (registro) a partir da segunda coluna
    // Cada coluna representa um pedido diferente
    for (let colIndex = 1; colIndex < data[0].length; colIndex++) {
      // Extrair dados das linhas específicas para cada pedido
      const statusValue = data[STATUS_ROW] && data[STATUS_ROW][colIndex];
      const purchaseDateValue = data[PURCHASE_DATE_ROW] && data[PURCHASE_DATE_ROW][colIndex];
      const productValue = data[PRODUCT_ROW] && data[PRODUCT_ROW][colIndex];
      const priceValue = data[PRICE_ROW] && data[PRICE_ROW][colIndex];
      
      // Verificar se temos dados válidos antes de adicionar
      if (statusValue || productValue || purchaseDateValue) {
        const order: OrderData = {
          status: statusValue?.toString() || 'Pendente',
          purchaseDate: formatDate(purchaseDateValue),
          product: productValue?.toString() || 'Desconhecido',
          price: parseFloat(priceValue) || 0
        };
        orders.push(order);
      }
    }
    
    // Atualizar o estado com os pedidos processados
    setOrderData(orders);
    
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
    
    // Calcular faturamento total
    const revenue = orders.reduce((sum, order) => sum + order.price, 0);
    setTotalRevenue(Math.round(revenue * 100) / 100);
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
        // Ignorar erro e retornar a string original
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
                    <div className="flex items-center justify-center h-full">
                      {isLoading ? "Carregando..." : "Não há dados disponíveis"}
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
                    <div className="flex items-center justify-center h-full">
                      {isLoading ? "Carregando..." : "Não há dados disponíveis"}
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
                          <Badge variant={index < 3 ? "success" : "secondary"}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.totalValue)}</TableCell>
                      </TableRow>
                    ))}
                    {topProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          Nenhum dado de produto disponível
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
