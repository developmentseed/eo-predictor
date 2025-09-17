import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useFilterStore } from "@/store/filterStore";
import { formatTimeDisplay } from "@/utils/timeUtils";

export const TimeSlider = () => {
  const { timeRange, metadata, setTimeRange } = useFilterStore();
  const [localTimeRange, setLocalTimeRange] = useState<number[]>([]);

  // Sync local state when store changes
  useEffect(() => {
    if (timeRange.length > 0) {
      setLocalTimeRange(timeRange);
    }
  }, [timeRange]);

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
        {(localTimeRange.length > 0 ? localTimeRange : timeRange).map(
          (timestamp, index) => {
            const { date, time, timezone } = formatTimeDisplay(timestamp);
            return (
              <div
                key={index}
                className={`flex flex-col ${
                  index === 0 ? "items-start" : "items-end"
                }`}
              >
                <span>{date}</span>
                <span className="text-xs opacity-75">
                  {time} {timezone}
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};
