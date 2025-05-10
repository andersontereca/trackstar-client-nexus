
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

interface StatusSectionProps {
  title: string;
  data: any[];
  statusIndex: number;
  nameIndex: number;
  phoneIndex: number;
  trackingCodeIndex: number;
  trackingStatusIndex: number;
  searchTerm: string;
  updateData: (row: number, col: number, value: any) => void;
  fetchStatus: (row: number) => void;
}

const StatusSection = ({
  title,
  data,
  statusIndex,
  nameIndex,
  phoneIndex,
  trackingCodeIndex,
  trackingStatusIndex,
  searchTerm,
  updateData,
  fetchStatus,
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
    const matchStatus = row[statusIndex] && row[statusIndex].toLowerCase() === title.toLowerCase();
    const matchSearch = !searchTerm || (row[nameIndex] && row[nameIndex].toString().toLowerCase().includes(searchTerm)) || 
                      (row[phoneIndex] && row[phoneIndex].toString().toLowerCase().includes(searchTerm));
    return matchStatus && matchSearch;
  });
  
  if (filtered.length === 0 && !searchTerm) {
    return null;
  }
  
  // Determina a classe de cor de fundo do cabeçalho com base no status
  const getHeaderClass = () => {
    switch (title.toLowerCase()) {
      case 'agendado': return 'bg-blue-600';
      case 'pagamento aprovado': return 'bg-green-600';
      case 'cancelada': return 'bg-red-600';
      case 'pagamento atrasado': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };
  
  // Determina o ícone para o status
  const getStatusIcon = () => {
    switch (title.toLowerCase()) {
      case 'agendado': return '📅';
      case 'pagamento aprovado': return '✅';
      case 'cancelada': return '❌';
      case 'pagamento atrasado': return '⏰';
      default: return '📌';
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
                  {customColumnOrder.slice(0, 5).map((colIndex) => (
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
                      {customColumnOrder.slice(0, 5).map((colIndex, colIdx) => {
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
