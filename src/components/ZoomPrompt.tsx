import { Alert, AlertDescription } from "@/components/ui/alert";
import { ZoomIn } from "lucide-react";

interface ZoomPromptProps {
  visible: boolean;
}

export function ZoomPrompt({ visible }: ZoomPromptProps) {
  return (
    <div
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none
        transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
    >
      <Alert className="backdrop-blur-sm shadow-2xl">
        <ZoomIn className="" />
        <AlertDescription>Zoom in to see predicted EO passes.</AlertDescription>
      </Alert>
    </div>
  );
}
