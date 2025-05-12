
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RefreshCw, Plus } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface StatusSectionProps {
  title: string;
  statuses: string[];
  data: any[];
  statusIndex: number;
  nameIndex: number;
  phoneIndex: number;
  trackingCodeIndex: number;
  trackingStatusIndex: number;
  searchTerm: string;
  updateData: (row: number, col: number, value: any) => void;
  fetchStatus: (row: number) => void;
  color: string;
}

const StatusSection = ({
  title,
  statuses,
  data,
  statusIndex,
  nameIndex,
  phoneIndex,
  trackingCodeIndex,
  trackingStatusIndex,
  searchTerm,
  updateData,
  fetchStatus,
  color,
}: StatusSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // ORDEM PERSONALIZADA DAS COLUNAS
  const customColumnOrder = [
    4, 6, 0, 35, 36, 3, 5, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26, 27, 28,
    29, 30, 31, 32, 33, 2, 1, 34
  ];
  
  // Filtra os dados por status e termo de pesquisa
  const filtered = data.filter((row, idx) => {
    if (idx === 0) return false;
    const rowStatus = row[statusIndex]?.toLowerCase() || "";
    const matchStatus = statuses.some(status => rowStatus === status.toLowerCase());
    const matchSearch = !searchTerm || (row[nameIndex] && row[nameIndex].toString().toLowerCase().includes(searchTerm)) || 
                      (row[phoneIndex] && row[phoneIndex].toString().toLowerCase().includes(searchTerm));
    return matchStatus && matchSearch;
  });
  
  if (filtered.length === 0 && !searchTerm) {
    return null;
  }
  
  // Determina o ícone para o status
  const getStatusIcon = () => {
    switch (color) {
      case 'blue': return '📅';
      case 'green': return '✅';
      case 'red': return '❌';
      case 'yellow': return '⏰';
      default: return '📌';
    }
  };
  
  // Determina a classe de cor de fundo do cabeçalho com base na cor
  const getHeaderClass = () => {
    switch (color) {
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      case 'red': return 'bg-red-600';
      case 'yellow': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };
  
  // Determina a classe para o status de rastreio
  const getTrackingStatusClass = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('entregue')) return 'status-entregue';
    if (statusLower.includes('aguardando')) return 'status-aguardando';
    if (statusLower.includes('postado')) return 'status-postado';
    return 'status-nao-encontrado';
  };

  // Renderiza informações detalhadas do cliente com mapeamento corrigido
  const renderCustomerDetails = (row: any) => {
    // Mapeamento CORRETO de campos do endereço
    const addressFields = [
      { label: "CEP", index: 7 },
      { label: "Rua", index: 8 },
      { label: "Número", index: 9 }, 
      { label: "Bairro", index: 11 },
      { label: "Cidade", index: 12 },
      { label: "Estado", index: 13 }
    ];
    
    // Mapeamento CORRETO dos campos do produto
    const productFields = [
      { label: "Produto", index: 3 },
      { label: "Email", index: 5 },
      { label: "Observações", index: 10 }
    ];
    
    return (
      <div className="p-2">
        <div className="mb-4">
          <h4 className="font-bold text-sm mb-2 border-b pb-1">Dados do Cliente</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Nome:</p>
              <p className="font-medium">{row[nameIndex] || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Telefone:</p>
              <p className="font-medium">{row[phoneIndex] || "N/A"}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-bold text-sm mb-2 border-b pb-1">Endereço</h4>
          <div className="space-y-1">
            {addressFields.map((field) => (
              <div key={field.index} className="grid grid-cols-3 gap-1">
                <p className="text-xs text-gray-500 col-span-1">{field.label}:</p>
                <p className="text-sm col-span-2">{row[field.index] || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-sm mb-2 border-b pb-1">Produto</h4>
          <div className="space-y-1">
            {productFields.map((field) => (
              <div key={field.index} className="grid grid-cols-3 gap-1">
                <p className="text-xs text-gray-500 col-span-1">{field.label}:</p>
                <p className="text-sm col-span-2">{row[field.index] || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(108,99,255,0.2)]`}>
      <div 
        className={`flex justify-between items-center p-4 cursor-pointer ${getHeaderClass()}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="text-xl mr-2">{getStatusIcon()}</span>
          <h3 className="text-lg font-bold">{title}</h3>
          <span className="ml-3 bg-white/20 px-2 py-1 rounded-full text-sm">
            {filtered.length}
          </span>
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {isOpen && (
        <div className="overflow-x-auto px-1 py-2">
          {filtered.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-secondary p-2 text-center" style={{ width: "40px" }}>Info</th>
                  <th className="bg-secondary p-2 text-left">Status</th>
                  {customColumnOrder.slice(0, 4).map((colIndex) => (
                    <th key={colIndex} className="bg-secondary p-2 text-left">
                      {data[0][colIndex] || `Coluna ${colIndex}`}
                    </th>
                  ))}
                  <th className="bg-secondary p-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, rowIdx) => {
                  // Encontra o índice original na array completa de dados
                  const originalIndex = data.findIndex((r, i) => i > 0 && r === row);
                  
                  return (
                    <tr key={rowIdx} className="border-b border-white/10 hover:bg-black/30">
                      <td className="p-2 text-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                              <Plus size={16} />
                              <span className="sr-only">Ver detalhes</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 bg-popover/95 backdrop-blur-sm border border-white/10">
                            {renderCustomerDetails(row)}
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="p-2">
                        <Badge variant={color === 'blue' ? 'default' : 
                                      color === 'green' ? 'success' : 
                                      color === 'yellow' ? 'warning' : 
                                      color === 'red' ? 'destructive' : 'secondary'}>
                          {row[statusIndex] || 'N/A'}
                        </Badge>
                      </td>
                      {customColumnOrder.slice(0, 4).map((colIndex, colIdx) => {
                        const cellValue = row[colIndex] || '';
                        return (
                          <td 
                            key={colIdx} 
                            className={`p-2 ${colIndex === trackingStatusIndex ? getTrackingStatusClass(cellValue) : ''}`}
                          >
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => updateData(originalIndex, colIndex, e.currentTarget.textContent)}
                              className="focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                            >
                              {cellValue}
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-2 text-center">
                        <Button
                          onClick={() => fetchStatus(originalIndex)}
                          className="px-2 py-1 bg-primary/80 hover:bg-primary text-white rounded"
                          size="sm"
                        >
                          <RefreshCw size={16} className="mr-1" />
                          Atualizar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-400">Nenhum resultado encontrado para "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusSection;
