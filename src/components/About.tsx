import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

import { ScrollArea } from "@/components/ui/scroll-area";

import { CircleAlert } from "lucide-react";

interface AboutDialogProps {
  children: React.ReactNode;
}

export function AboutDialog({ children }: AboutDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>EO Predictor</DialogTitle>
          <DialogDescription>
            Potential upcoming observations of Earth.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">About</h4>
            <p className="text-sm text-muted-foreground">
              EO Predictor visualizes upcoming potential observations of a
              curated set of satellites that are relevant for humanitarians and
              disaster responders. Using a satellite's location and the "swath
              width" (width of the area the satellite's sensor captures), the
              coverage of potential observations can be predicted.
            </p>
            <Alert className="bg-blue-500/10 dark:bg-blue-600/30 border-blue-300 dark:border-blue-600/70">
              <CircleAlert className="h-4 w-4 !text-blue-800" />
              <AlertTitle className="!text-blue-800">
                Actual observations may vary.
              </AlertTitle>
              <AlertDescription className="font-light !text-blue-800">
                Actual earth observations depend on many factors including the
                angle of observation of the sensor, potential tasking
                prioritization, and potential geopolitical factors. Weather and
                daylight conditions can also impact the usability of
                observations.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Two-day prediction window, calculated every 24h.</li>
                <li>
                  • Interactive 3D globe visualization and optional user
                  geolocation.
                </li>
                <li>
                  • Filter by temporal range, satellite constellation, operator,
                  and sensor type.
                </li>
                <li>
                  • Upcoming passes within the map view and that meet the filter
                  criteria are listed in chronological order.
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Data powered by Skyfield orbital calculations and Two-Line
                Element (TLE) data from{" "}
                <a
                  href="https://celestrak.org/"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline"
                >
                  Celestrak
                </a>
                .
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
