import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
