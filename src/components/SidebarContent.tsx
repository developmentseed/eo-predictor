import { Controls } from "@/components/Controls";
import { PassCounter } from "@/components/PassCounter";
import { TimeSlider } from "@/components/TimeSlider";
import { usePassCounter } from "@/hooks/usePassCounter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlarmClock, Satellite, Settings2 } from "lucide-react";
import { formatLastUpdated } from "@/utils/timeUtils";
import type { FetchStatus } from "@/utils/mapUtils";

interface SidebarContentProps {
  mapRef: React.RefObject<any>;
  variant?: "desktop" | "mobile";
  lastUpdated?: string;
  fetchStatus?: FetchStatus | null;
}

export function SidebarContent({
  mapRef,
  variant = "desktop",
  lastUpdated,
  fetchStatus,
}: SidebarContentProps) {
  const { getPassCountText } = usePassCounter({ mapRef });
  const version = __APP_VERSION__ || "0.1.0";

  const predictedPercent =
    fetchStatus && fetchStatus.activeExpectedCount > 0
      ? Math.round(
          (fetchStatus.fetchedCount / fetchStatus.activeExpectedCount) * 100
        )
      : null;
  const predictedText =
    predictedPercent !== null ? `${predictedPercent}%` : null;
  const predictedHoverText =
    fetchStatus && fetchStatus.activeExpectedCount > 0
      ? `${fetchStatus.fetchedCount} / ${fetchStatus.activeExpectedCount} satellites predicted successfully`
      : undefined;
  const isDesktop = variant === "desktop";
  const triggerClass = isDesktop
    ? "text-sm font-medium"
    : "px-4 text-left font-semibold";
  const contentClass = isDesktop ? undefined : "px-4 pb-4";

  return (
    <>
      <Accordion
        type="multiple"
        defaultValue={
          isDesktop ? ["time-range", "filters", "passes"] : ["time-range"]
        }
        className={isDesktop ? "flex-1 flex flex-col" : undefined}
      >
        <AccordionItem value="time-range">
          <AccordionTrigger className={triggerClass}>
            <div className="flex items-center gap-4">
              <AlarmClock />
              Time Range
            </div>
          </AccordionTrigger>
          <AccordionContent className={contentClass}>
            <TimeSlider />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="filters">
          <AccordionTrigger className={triggerClass}>
            <div className="flex items-center gap-4">
              <Settings2 />
              Satellite Filters
            </div>
          </AccordionTrigger>
          <AccordionContent className={contentClass}>
            <Controls />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="passes"
          className={isDesktop ? "flex-1 flex flex-col" : undefined}
        >
          <AccordionTrigger className={triggerClass}>
            <div className="flex items-center gap-4">
              <Satellite />
              {getPassCountText()}
            </div>
          </AccordionTrigger>
          <AccordionContent
            className={isDesktop ? "flex-1 overflow-hidden" : contentClass}
          >
            <div
              className={
                isDesktop
                  ? "h-full overflow-y-auto"
                  : "max-h-60 overflow-y-auto"
              }
            >
              <PassCounter mapRef={mapRef} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <CardFooter
        className={
          isDesktop
            ? "justify-between border-t mt-4 pt-4 px-0"
            : "justify-between border-t px-4 py-4"
        }
      >
        <div className="flex items-center gap-4">
          {predictedText && predictedHoverText && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={
                    predictedPercent !== null && predictedPercent < 100
                      ? "border-red-200 text-red-600"
                      : undefined
                  }
                >
                  {predictedText}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{predictedHoverText}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <span className="text-xs text-muted-foreground">
            Last updated: {formatLastUpdated(lastUpdated || "")}
          </span>
        </div>
        <a
          href={`https://github.com/developmentseed/eo-predictor/releases/tag/${version}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Badge variant="outline">v{version}</Badge>
        </a>
      </CardFooter>
    </>
  );
}
