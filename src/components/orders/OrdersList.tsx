
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrdersListProps {
  title: string;
  statuses: string[];
  data: any[];
  statusIndex: number;
  nameIndex: number;
  phoneIndex: number;
  productIndex: number;
  priceIndex: number;
  formatAddress: (row: any[]) => string;
  formatPrice: (price: string) => string;
  searchTerm: string;
  color: string;
}

const OrdersList = ({
  title,
  statuses,
  data,
  statusIndex,
  nameIndex,
  phoneIndex,
  productIndex,
  priceIndex,
  formatAddress,
  formatPrice,
  searchTerm,
  color,
}: OrdersListProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Filtra os dados por status e termo de pesquisa
  const filtered = data.filter((row, idx) => {
    if (idx === 0) return false;
    const rowStatus = row[statusIndex]?.toLowerCase() || "";
    const matchStatus = statuses.some(status => rowStatus === status.toLowerCase());
    const matchSearch = !searchTerm || 
                      (row[nameIndex] && row[nameIndex].toString().toLowerCase().includes(searchTerm)) || 
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

  return (
    <div className="glass-card overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(108,99,255,0.2)]">
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
        <div className="p-3">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell>
                      <Badge variant={
                        color === 'blue' ? 'default' : 
                        color === 'green' ? 'success' : 
                        color === 'yellow' ? 'warning' : 
                        color === 'red' ? 'destructive' : 'secondary'
                      }>
                        {row[statusIndex] || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{row[nameIndex] || 'N/A'}</TableCell>
                    <TableCell>{row[phoneIndex] || 'N/A'}</TableCell>
                    <TableCell className="max-w-[250px] truncate" title={formatAddress(row)}>
                      {formatAddress(row)}
                    </TableCell>
                    <TableCell>{row[productIndex] || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">
                        {formatPrice(row[priceIndex])}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

export default OrdersList;
