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
import { AlarmClock, Satellite, Settings2 } from "lucide-react";

interface SidebarContentProps {
  mapRef: React.RefObject<any>;
  variant?: "desktop" | "mobile";
}

export function SidebarContent({ mapRef, variant = "desktop" }: SidebarContentProps) {
  const { getPassCountText } = usePassCounter({ mapRef });
  
  const isDesktop = variant === "desktop";
  const triggerClass = isDesktop 
    ? "text-sm font-medium" 
    : "px-4 text-left font-semibold";
  const contentClass = isDesktop 
    ? undefined 
    : "px-4 pb-4";

  return (
    <Accordion
      type="multiple"
      defaultValue={isDesktop ? ["time-range", "filters", "passes"] : ["time-range"]}
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
          <div className={isDesktop ? "h-full overflow-y-auto" : "max-h-60 overflow-y-auto"}>
            <PassCounter mapRef={mapRef} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}