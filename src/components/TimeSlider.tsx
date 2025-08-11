import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useFilterStore } from "@/store/filterStore";

export const TimeSlider = () => {
  const [localTimeRange, setLocalTimeRange] = useState<number[]>([]);

  const { timeRange, metadata, setTimeRange } = useFilterStore();

  // Sync local time range with store when timeRange changes from external source
  useEffect(() => {
    if (timeRange.length > 0 && localTimeRange.length === 0) {
      setLocalTimeRange(timeRange);
    }
  }, [timeRange, localTimeRange.length]);

  if (!metadata || !timeRange.length) {
    return null;
  }

  return (
    <div className="space-y-3 py-2">
      <div className="p-2">
        <Slider
          value={localTimeRange.length > 0 ? localTimeRange : timeRange}
          min={metadata.minTime}
          max={metadata.maxTime}
          step={3600000} // 1 hour
          onValueChange={setLocalTimeRange}
          onValueCommit={setTimeRange}
          className="w-full"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <div className="flex flex-col items-start">
          <span>
            {new Date(
              (localTimeRange.length > 0 ? localTimeRange : timeRange)[0]
            ).toLocaleDateString()}
          </span>
          <span className="text-xs opacity-75">
            {new Date(
              (localTimeRange.length > 0 ? localTimeRange : timeRange)[0]
            ).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}{" "}
            UTC{" "}
            {(() => {
              const date = new Date(
                (localTimeRange.length > 0 ? localTimeRange : timeRange)[0]
              );
              const offsetMinutes = date.getTimezoneOffset();
              const offsetHours = Math.abs(offsetMinutes) / 60;
              const sign = offsetMinutes <= 0 ? "+" : "-";
              if (offsetHours === 0) return "(local time)";
              return `(${sign}${offsetHours}h local)`;
            })()}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span>
            {new Date(
              (localTimeRange.length > 0 ? localTimeRange : timeRange)[1]
            ).toLocaleDateString()}
          </span>
          <span className="text-xs opacity-75">
            {new Date(
              (localTimeRange.length > 0 ? localTimeRange : timeRange)[1]
            ).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}{" "}
            UTC{" "}
            {(() => {
              const date = new Date(
                (localTimeRange.length > 0 ? localTimeRange : timeRange)[1]
              );
              const offsetMinutes = date.getTimezoneOffset();
              const offsetHours = Math.abs(offsetMinutes) / 60;
              const sign = offsetMinutes <= 0 ? "+" : "-";
              if (offsetHours === 0) return "(local time)";
              return `(${sign}${offsetHours}h local)`;
            })()}
          </span>
        </div>
      </div>
    </div>
  );
};
