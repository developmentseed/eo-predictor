import { usePassCounter } from "@/hooks/usePassCounter";
import { formatUTCOffset } from "@/utils/timeUtils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Radio,
  Square,
  Maximize,
  Minimize,
  Unlock,
  DollarSign,
} from "lucide-react";
import maplibregl from "maplibre-gl";

interface PassCounterProps {
  mapRef: React.RefObject<maplibregl.Map | null>;
}

export const PassCounter = ({ mapRef }: PassCounterProps) => {
  const { visiblePasses, visiblePassCount } = usePassCounter({
    mapRef,
  });

  // Get timezone offset for table header
  const timezoneOffset =
    visiblePasses.length > 0
      ? formatUTCOffset(new Date(visiblePasses[0].start_time))
      : formatUTCOffset(new Date());

  if (visiblePassCount === null) {
    return null;
  }

  // Show placeholder when there are too many passes to display individual details
  if (visiblePassCount > 98 || visiblePasses.length === 0) {
    if (visiblePassCount > 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            Zoom in or use filters to see individual satellite passes.
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Time ({timezoneOffset})</TableHead>
          <TableHead className="text-xs">Constellation</TableHead>
          <TableHead className="text-xs">Sensor</TableHead>
          <TableHead className="text-xs">Resolution</TableHead>
          <TableHead className="text-xs">Access</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visiblePasses.map((pass, index) => (
          <TableRow key={`${pass.name}-${pass.start_time}-${index}`}>
            <TableCell className="font-medium text-xs">
              {new Date(pass.start_time).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell className="text-xs">
              {pass.constellation || "N/A"}
            </TableCell>
            <TableCell className="text-xs">
              {pass.sensor_type ? (
                <Badge
                  variant={
                    pass.sensor_type === "optical"
                      ? "soft-blue"
                      : pass.sensor_type === "SAR"
                      ? "soft-purple"
                      : "soft-gray"
                  }
                >
                  {pass.sensor_type === "optical" ? (
                    <Eye />
                  ) : pass.sensor_type === "SAR" ? (
                    <Radio />
                  ) : (
                    <Square />
                  )}
                </Badge>
              ) : (
                <Badge variant="outline">N/A</Badge>
              )}
            </TableCell>
            <TableCell className="text-xs">
              {pass.spatial_res_cm ? (
                <Badge
                  variant={
                    pass.spatial_res_cm / 100 < 5
                      ? "soft-green"
                      : pass.spatial_res_cm / 100 <= 30
                      ? "soft-yellow"
                      : "soft-orange"
                  }
                >
                  {pass.spatial_res_cm / 100 < 5 ? (
                    <Maximize />
                  ) : pass.spatial_res_cm / 100 <= 30 ? (
                    <Square />
                  ) : (
                    <Minimize />
                  )}
                </Badge>
              ) : (
                <Badge variant="outline">N/A</Badge>
              )}
            </TableCell>
            <TableCell className="text-xs">
              {pass.data_access ? (
                <Badge
                  variant={
                    pass.data_access === "open" ? "soft-emerald" : "soft-red"
                  }
                >
                  {pass.data_access === "open" ? <Unlock /> : <DollarSign />}
                </Badge>
              ) : (
                <Badge variant="outline">N/A</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
