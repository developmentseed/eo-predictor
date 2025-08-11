import { usePassCounter } from "@/hooks/usePassCounter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PassCounterProps {
  mapRef: React.RefObject<any>;
}

export const PassCounter = ({ mapRef }: PassCounterProps) => {
  const { visiblePasses, visiblePassCount } = usePassCounter({
    mapRef,
  });

  if (
    visiblePassCount === null ||
    visiblePassCount > 25 ||
    visiblePasses.length === 0
  ) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Time</TableHead>
          <TableHead className="text-xs">Satellite</TableHead>
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
            <TableCell className="text-xs">{pass.name}</TableCell>
            <TableCell className="text-xs">
              {pass.sensor_type || "N/A"}
            </TableCell>
            <TableCell className="text-xs">
              {pass.spatial_res_m
                ? pass.spatial_res_m < 1
                  ? `${Math.round(pass.spatial_res_m * 100)}cm`
                  : `${Math.round(pass.spatial_res_m)}m`
                : "N/A"}
            </TableCell>
            <TableCell className="text-xs">
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs ${
                  pass.data_access === "open"
                    ? "bg-green-100 text-green-800"
                    : pass.data_access === "commercial"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {pass.data_access || "N/A"}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
