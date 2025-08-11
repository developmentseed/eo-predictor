import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFilterStore } from "@/store/filterStore";

export const TimeSlider = () => {
  const [localTimeRange, setLocalTimeRange] = useState<number[]>([]);

  const {
    timeRange,
    metadata,
    setTimeRange,
  } = useFilterStore();

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
    <Card className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-96 max-w-[90vw]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Time Range</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Slider
            value={localTimeRange.length > 0 ? localTimeRange : timeRange}
            min={metadata.minTime}
            max={metadata.maxTime}
            step={3600000} // 1 hour
            onValueChange={setLocalTimeRange}
            onValueCommit={setTimeRange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {new Date(
                (localTimeRange.length > 0 ? localTimeRange : timeRange)[0]
              ).toLocaleDateString()}
            </span>
            <span>
              {new Date(
                (localTimeRange.length > 0 ? localTimeRange : timeRange)[1]
              ).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};