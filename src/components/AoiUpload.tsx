import { useRef, useState } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Upload } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import {
  loadAoiFromFile,
  computeAoiFitBounds,
  AoiParseError,
} from "@/utils/aoiUtils";

interface AoiUploadProps {
  mapRef: React.RefObject<MapRef | null>;
}

export const AoiUpload = ({ mapRef }: AoiUploadProps) => {
  const { aoiFileName, setAoi, clearAoi } = useFilterStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const { feature, combinedCount } = await loadAoiFromFile(file);

      // Fit the map to the AOI before committing it to the store, so a
      // failure here (e.g. an unusable bounding box) never leaves the app
      // pointed at an AOI it couldn't actually display.
      if (mapRef.current) {
        mapRef.current.fitBounds(computeAoiFitBounds(feature), {
          padding: 40,
          duration: 800,
        });
      }

      setError(null);
      setInfoMessage(
        combinedCount
          ? `Combined ${combinedCount} shapes from this file into one AOI.`
          : null
      );
      setAoi(feature, file.name);
    } catch (err) {
      setInfoMessage(null);
      setError(
        err instanceof AoiParseError ? err.message : "Could not load this file."
      );
    }
  };

  const handleClear = () => {
    clearAoi();
    setError(null);
    setInfoMessage(null);
  };

  const handleButtonClick = () => {
    if (aoiFileName) {
      if (window.confirm("Remove the uploaded AOI?")) {
        handleClear();
      }
      return;
    }

    inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant={aoiFileName ? "secondary" : "outline"}
          size="sm"
          className={
            aoiFileName
              ? "hover:border-destructive/50 hover:bg-destructive hover:text-white"
              : undefined
          }
          onClick={handleButtonClick}
        >
          {aoiFileName ? <Check /> : <Upload />}
          {aoiFileName ? "AOI uploaded" : "Upload AOI"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".geojson,.json,application/geo+json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {infoMessage && (
        <p className="text-xs text-muted-foreground">{infoMessage}</p>
      )}
    </div>
  );
};
