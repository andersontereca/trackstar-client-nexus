
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
import { Trophy, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    const processExcelData = async () => {
      try {
        setIsLoading(true);
        // Check if window.XLSX is available (loaded in App.tsx)
        if (!window.XLSX) {
          toast.error("Excel library not loaded. Please refresh the page.");
          return;
        }

        // Fetch some sample data or connect to your backend
        const response = await fetch('/examples/orders.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        
        const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = window.XLSX.utils.sheet_to_json(worksheet);
        
        // Process the data for our charts
        processOrderData(jsonData);
        
      } catch (error) {
        console.error("Error processing Excel data:", error);
        toast.error("Falha ao carregar dados do relatório");
      } finally {
        setIsLoading(false);
      }
    };

    processExcelData();
  }, []);

  const processOrderData = (data: any[]) => {
    // Sample data processing - replace with your actual structure
    const orders: OrderData[] = data.map(row => ({
      status: row['Status'] || 'Pendente',
      purchaseDate: row['Data de Compra'] || new Date().toISOString().split('T')[0],
      product: row['Produto'] || 'Desconhecido',
      price: parseFloat(row['Valor'] || 0)
    }));

    setOrderData(orders);
    
    // Process status for pie chart
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
    
    // Process dates for bar chart
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
        value: dateGroups[date].value
      }));
    
    setDateData(dateChartData);
    
    // Process product rankings
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
        totalValue: productData[name].totalValue
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    setTopProducts(productsRanked);
    
    // Calculate total revenue
    const revenue = orders.reduce((sum, order) => sum + order.price, 0);
    setTotalRevenue(revenue);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Relatórios de Vendas</h1>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Produtos Mais Vendidos
                </CardTitle>
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
