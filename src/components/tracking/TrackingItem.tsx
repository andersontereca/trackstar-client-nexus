
import { Check, Truck, ArrowRight, Package, Clock, ClockCheck, X, MapPin } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TrackingItemProps {
  customerName: string;
  trackingCode: string;
  status: string;
  lastUpdated: string;
  product: string;
}

const TrackingItem = ({
  customerName,
  trackingCode,
  status,
  lastUpdated,
  product
}: TrackingItemProps) => {
  // Get icon based on tracking status
  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("entregue")) return <Check className="h-4 w-4 text-green-500" />;
    if (lowerStatus.includes("saiu para entrega")) return <Truck className="h-4 w-4 text-blue-500" />;
    if (lowerStatus.includes("em trânsito")) return <ArrowRight className="h-4 w-4 text-purple-500" />;
    if (lowerStatus.includes("postado")) return <Package className="h-4 w-4 text-indigo-500" />;
    if (lowerStatus.includes("aguardando")) return <Clock className="h-4 w-4 text-yellow-500" />;
    if (lowerStatus.includes("tentativa")) return <ClockCheck className="h-4 w-4 text-orange-500" />;
    if (lowerStatus.includes("erro")) return <X className="h-4 w-4 text-red-500" />;
    return <MapPin className="h-4 w-4 text-gray-500" />;
  };
  
  // Get badge variant based on tracking status
  const getStatusVariant = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("entregue")) return "success";
    if (lowerStatus.includes("saiu para entrega")) return "default";
    if (lowerStatus.includes("em trânsito")) return "outline";
    if (lowerStatus.includes("postado")) return "secondary";
    if (lowerStatus.includes("aguardando")) return "warning";
    if (lowerStatus.includes("tentativa")) return "destructive";
    if (lowerStatus.includes("erro")) return "destructive";
    return "secondary";
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center justify-center">
          {getStatusIcon(status)}
        </div>
      </TableCell>
      <TableCell className="font-medium">{customerName}</TableCell>
      <TableCell>
        <a 
          href={`https://rastreamento.correios.com.br/app/index.php?objeto=${trackingCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center"
        >
          {trackingCode}
          <ArrowRight className="ml-1 h-3 w-3" />
        </a>
      </TableCell>
      <TableCell>{product}</TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(status) as any}>
          {status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {lastUpdated}
      </TableCell>
    </TableRow>
  );
};

export default TrackingItem;
