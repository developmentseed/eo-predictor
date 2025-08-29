import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
        <div className="space-y-4">
          <h4 className="text-sm font-medium">About</h4>
          <p className="text-sm text-muted-foreground">
            EO Predictor visualizes upcoming potential observations of a curated
            set of satellites that are relevant for humanitarians and disaster
            responders. Using a satellite's location and the "swath width"
            (width of the area the satellite's sensor captures), the coverage of
            potential observations can be predicted.
          </p>
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
              Built with React, TypeScript, and MapLibre GL. Data powered by
              Skyfield orbital calculations and Two-Line Element (TLE) data from{" "}
              <a
                href="https://celestrak.org/"
                rel="noopener noreferrer"
                target="_blank"
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                Celestrak
              </a>
              .
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
