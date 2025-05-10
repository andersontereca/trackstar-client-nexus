
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusSection from "@/components/dashboard/StatusSection";
import { useNavigate } from "react-router-dom";
import { Search, UploadCloud, Download, UserPlus, RefreshCw } from "lucide-react";

const Dashboard = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const STATUS_INDEX = 17;
  const NAME_INDEX = 4;
  const PHONE_INDEX = 6;
  const CODE_INDEX = 35;
  const TRACKING_STATUS_INDEX = 36;
  
  // Status types
  const statusTypes = ['Agendado', 'Pagamento Aprovado', 'Cancelada', 'Pagamento Atrasado'];
  
  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Carregar dados do localStorage, se existirem
    const savedData = localStorage.getItem('clientData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setTableData(parsedData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }, [navigate]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (e.target?.result) {
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          // @ts-ignore
          const workbook = XLSX.read(data, { type: 'array' });
          // @ts-ignore
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          // @ts-ignore
          const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          if (parsedData.length === 0) {
            toast.error("O arquivo não contém dados.");
            return;
          }

          // Adicionar coluna de status se não existir
          if (!parsedData[0].includes("Status do Pedido")) {
            parsedData[0].push("Status do Pedido");
          }

          setTableData(parsedData);
          localStorage.setItem('clientData', JSON.stringify(parsedData));
          toast.success("Dados carregados com sucesso!");
        }
      } catch (error) {
        toast.error("Erro ao carregar o arquivo Excel. Verifique se é um arquivo válido.");
        console.error('Erro ao carregar Excel:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddClient = () => {
    if (tableData.length === 0) {
      toast.error("Carregue primeiro uma planilha para adicionar clientes.");
      return;
    }
    
    const newRow = Array(tableData[0].length).fill('');
    const newTableData = [...tableData];
    newTableData.push(newRow);
    setTableData(newTableData);
    localStorage.setItem('clientData', JSON.stringify(newTableData));
    toast.success("Novo cliente adicionado!");
  };

  const handleExportExcel = () => {
    if (tableData.length === 0) {
      toast.error("Não há dados para exportar.");
      return;
    }
    
    try {
      // Ordenação personalizada das colunas
      const customColumnOrder = [
        4, 6, 0, 35, 36, 3, 5, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28,
        29, 30, 31, 32, 33, 2, 1, 34
      ];
      
      const reorderedData = tableData.map(row => 
        customColumnOrder.map(i => row[i] || ''));
      
      // @ts-ignore
      const worksheet = XLSX.utils.aoa_to_sheet(reorderedData);
      // @ts-ignore
      const workbook = XLSX.utils.book_new();
      // @ts-ignore
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
      // @ts-ignore
      XLSX.writeFile(workbook, 'clientes_trackmaster.xlsx');
      
      toast.success("Excel exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar Excel.");
      console.error(error);
    }
  };
  
  const updateAllTracking = async () => {
    if (tableData.length === 0) {
      toast.error("Não há dados para atualizar.");
      return;
    }
    
    setIsLoading(true);
    const codigosParaAtualizar = [];
    let count = 0;
    
    toast.info("Iniciando atualização de rastreios...");

    // Coleta os códigos "Agendado" válidos
    for (let i = 1; i < tableData.length; i++) {
      const status = tableData[i][STATUS_INDEX];
      const codigo = tableData[i][CODE_INDEX];
      if (status === 'Agendado' && codigo && codigo !== 'N/A') {
        codigosParaAtualizar.push({ codigo, index: i });
      }
    }
    
    if (codigosParaAtualizar.length === 0) {
      toast.info("Nenhum código de rastreio para atualizar.");
      setIsLoading(false);
      return;
    }

    // Processa em lotes de 5 por segundo
    const loteSize = 5;
    const newTableData = [...tableData];
    
    for (let i = 0; i < codigosParaAtualizar.length; i += loteSize) {
      const lote = codigosParaAtualizar.slice(i, i + loteSize);

      try {
        const promessas = lote.map(({ codigo, index }) =>
          fetch(`rastreio.php?codigo=${codigo}`)
            .then(res => {
              if (!res.ok) throw new Error(`Status: ${res.status}`);
              return res.json();
            })
            .then(data => {
              newTableData[index][TRACKING_STATUS_INDEX] = data?.status || 'N/A';
              count++;
            })
            .catch(e => {
              console.error(`Erro no código ${codigo}:`, e);
              // Adicionar mensagem de erro específica ao status
              newTableData[index][TRACKING_STATUS_INDEX] = 'Erro ao rastrear';
            })
        );

        await Promise.all(promessas);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo entre os lotes
      } catch (error) {
        console.error("Erro ao processar lote de rastreamentos:", error);
      }
    }

    setTableData(newTableData);
    localStorage.setItem('clientData', JSON.stringify(newTableData));
    toast.success(`${count} rastreios atualizados com sucesso!`);
    setIsLoading(false);
  };

  const updateData = (row: number, col: number, value: any) => {
    const newTableData = [...tableData];
    newTableData[row][col] = value;
    setTableData(newTableData);
    localStorage.setItem('clientData', JSON.stringify(newTableData));
  };

  const fetchSingleStatus = async (rowIndex: number) => {
    const codigo = tableData[rowIndex][CODE_INDEX];
    if (!codigo || codigo === 'N/A') {
      toast.error("Código de rastreio inválido.");
      return;
    }

    try {
      const response = await fetch(`rastreio.php?codigo=${codigo}`);
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }
      const data = await response.json();
      
      const newTableData = [...tableData];
      newTableData[rowIndex][TRACKING_STATUS_INDEX] = data?.status || 'N/A';
      setTableData(newTableData);
      localStorage.setItem('clientData', JSON.stringify(newTableData));
      
      toast.success("Status atualizado!");
    } catch (err) {
      toast.error("Erro ao buscar status do pedido.");
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card - Total de Clientes */}
            <div className="dashboard-card">
              <h3 className="text-xl font-medium text-gray-300 mb-2">Total de Clientes</h3>
              <p className="text-3xl font-bold">
                {tableData.length > 0 ? tableData.length - 1 : 0}
              </p>
              <div className="mt-2 text-sm text-gray-400">
                Clientes cadastrados no sistema
              </div>
            </div>

            {/* Card - Pedidos em Andamento */}
            <div className="dashboard-card">
              <h3 className="text-xl font-medium text-gray-300 mb-2">Pedidos em Andamento</h3>
              <p className="text-3xl font-bold text-blue-400">
                {tableData.length > 0 
                  ? tableData.filter((row, i) => 
                      i > 0 && row[STATUS_INDEX] === 'Agendado').length
                  : 0}
              </p>
              <div className="mt-2 text-sm text-gray-400">
                Pedidos em processamento
              </div>
            </div>

            {/* Card - Pedidos Concluídos */}
            <div className="dashboard-card">
              <h3 className="text-xl font-medium text-gray-300 mb-2">Pedidos Concluídos</h3>
              <p className="text-3xl font-bold text-green-400">
                {tableData.length > 0 
                  ? tableData.filter((row, i) => 
                      i > 0 && row[STATUS_INDEX] === 'Pagamento Aprovado').length
                  : 0}
              </p>
              <div className="mt-2 text-sm text-gray-400">
                Pedidos entregues com sucesso
              </div>
            </div>
          </div>
          
          {/* Ações e Ferramentas */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Gerenciamento de Clientes</h2>
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
              <div className="flex flex-1 flex-col sm:flex-row gap-2">
                <label className="btn-secondary flex-1 cursor-pointer">
                  <UploadCloud size={18} />
                  <span>Importar Excel</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <Button 
                  onClick={handleExportExcel}
                  className="btn-outline flex-1"
                >
                  <Download size={18} />
                  <span>Exportar Excel</span>
                </Button>
                <Button 
                  onClick={handleAddClient}
                  className="btn-primary flex-1"
                >
                  <UserPlus size={18} />
                  <span>Novo Cliente</span>
                </Button>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                onClick={updateAllTracking}
                disabled={isLoading}
                className={`px-4 py-3 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                <span>{isLoading ? "Atualizando rastreios..." : "Atualizar Todos os Rastreamentos"}</span>
              </Button>
            </div>
          </div>
          
          {/* Seções de Status */}
          <div className="space-y-6">
            {tableData.length > 0 ? (
              statusTypes.map(status => (
                <StatusSection
                  key={status}
                  title={status}
                  data={tableData}
                  statusIndex={STATUS_INDEX}
                  nameIndex={NAME_INDEX}
                  phoneIndex={PHONE_INDEX}
                  trackingCodeIndex={CODE_INDEX}
                  trackingStatusIndex={TRACKING_STATUS_INDEX}
                  searchTerm={searchTerm}
                  updateData={updateData}
                  fetchStatus={fetchSingleStatus}
                />
              ))
            ) : (
              <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4 opacity-50">📊</div>
                <h3 className="text-xl font-bold mb-2">Sem dados disponíveis</h3>
                <p className="text-gray-400 mb-6">
                  Importe um arquivo Excel ou adicione novos clientes para começar a gerenciar.
                </p>
                <label className="btn-primary cursor-pointer inline-flex items-center justify-center">
                  <UploadCloud size={18} className="mr-2" />
                  <span>Importar Excel</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
