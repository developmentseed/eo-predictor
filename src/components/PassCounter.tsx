import { usePassCounter } from "@/hooks/usePassCounter";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PassCounterProps {
  mapRef: React.RefObject<any>;
}

export const PassCounter = ({ mapRef }: PassCounterProps) => {
  const { getPassCountText, visiblePasses, visiblePassCount } = usePassCounter({
    mapRef,
  });

  return (
    <div className="absolute top-20 right-5 bg-white/80 p-5 rounded-lg flex flex-col gap-4 max-w-sm max-h-[90vh] overflow-y-auto">
      {visiblePassCount !== null &&
      visiblePassCount <= 25 &&
      visiblePasses.length > 0 ? (
        <Table>
          <TableCaption>Satellite passes in current viewport.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Satellite</TableHead>
              <TableHead>Sensor</TableHead>
              <TableHead>Resolution</TableHead>
              <TableHead>Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiblePasses.map((pass, index) => (
              <TableRow key={`${pass.name}-${pass.start_time}-${index}`}>
                <TableCell className="font-medium">
                  {new Date(pass.start_time).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>{pass.name}</TableCell>
                <TableCell>{pass.sensor_type || "N/A"}</TableCell>
                <TableCell>
                  {pass.spatial_res_m
                    ? pass.spatial_res_m < 1
                      ? `${Math.round(pass.spatial_res_m * 100)}cm`
                      : `${Math.round(pass.spatial_res_m)}m`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
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
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                Total: {visiblePasses.length} passes
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      ) : null}
      <div className="text-sm font-medium text-blue-900">
        {getPassCountText()}
      </div>
    </div>
  );
};
