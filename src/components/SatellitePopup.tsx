import { Popup } from "react-map-gl/maplibre";
import {
  Sun,
  Moon,
  Eye,
  Radio,
  Asterisk,
  Maximize,
  Square,
  Minimize,
  Unlock,
  DollarSign,
  Target,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClickedFeature {
  lngLat: { lng: number; lat: number };
  satellite: string;
  constellation: string;
  operator: string;
  sensor_type: string;
  spatial_res_m: number;
  data_access: string;
  tasking: boolean;
  start_time: string;
  end_time: string;
  is_daytime?: boolean;
}

interface SatellitePopupProps {
  clickedFeature: ClickedFeature | null;
  onClose: () => void;
}

export const SatellitePopup = ({
  clickedFeature,
  onClose,
}: SatellitePopupProps) => {
  if (!clickedFeature) return null;

  return (
    <Popup
      longitude={clickedFeature.lngLat.lng}
      latitude={clickedFeature.lngLat.lat}
      onClose={onClose}
      closeOnClick={false}
    >
      <div className="space-y-2">
        <h3 className="font-bold mb-2">
          Satellite: {clickedFeature.satellite}
        </h3>
        <p className="text-xs">Constellation: {clickedFeature.constellation}</p>
        <p className="text-xs">Operator: {clickedFeature.operator}</p>

        <div className="flex items-center gap-2">
          <span className="text-xs">Sensor Type:</span>
          {clickedFeature.sensor_type ? (
            <Badge
              variant={
                clickedFeature.sensor_type === "optical"
                  ? "soft-blue"
                  : clickedFeature.sensor_type === "SAR"
                  ? "soft-purple"
                  : "soft-orange"
              }
              className="flex items-center gap-1"
            >
              {clickedFeature.sensor_type === "optical" ? (
                <Eye size={12} />
              ) : clickedFeature.sensor_type === "SAR" ? (
                <Radio size={12} />
              ) : (
                <Asterisk size={12} />
              )}
              {clickedFeature.sensor_type === "optical"
                ? "Optical"
                : clickedFeature.sensor_type === "SAR"
                ? "SAR"
                : "Hyperspectral"}
            </Badge>
          ) : (
            <Badge variant="outline">N/A</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs">Spatial Resolution:</span>
          <span className="text-xs">{clickedFeature.spatial_res_m} m</span>
          {clickedFeature.spatial_res_m && (
            <Badge
              variant={
                clickedFeature.spatial_res_m < 5
                  ? "soft-green"
                  : clickedFeature.spatial_res_m <= 30
                  ? "soft-yellow"
                  : "soft-orange"
              }
              className="flex items-center gap-1"
            >
              {clickedFeature.spatial_res_m < 5 ? (
                <Maximize size={12} />
              ) : clickedFeature.spatial_res_m <= 30 ? (
                <Square size={12} />
              ) : (
                <Minimize size={12} />
              )}
              {clickedFeature.spatial_res_m < 5
                ? "High"
                : clickedFeature.spatial_res_m <= 30
                ? "Medium"
                : "Low"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs">Data Access:</span>
          {clickedFeature.data_access ? (
            <Badge
              variant={
                clickedFeature.data_access === "open"
                  ? "soft-emerald"
                  : "soft-red"
              }
              className="flex items-center gap-1"
            >
              {clickedFeature.data_access === "open" ? (
                <Unlock size={12} />
              ) : (
                <DollarSign size={12} />
              )}
              {clickedFeature.data_access === "open" ? "Open" : "Commercial"}
            </Badge>
          ) : (
            <Badge variant="outline">N/A</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs">Tasking:</span>
          {clickedFeature.tasking !== undefined ? (
            <Badge
              variant={clickedFeature.tasking ? "soft-green" : "soft-blue"}
              className="flex items-center gap-1"
            >
              {clickedFeature.tasking ? (
                <Target size={12} />
              ) : (
                <Navigation size={12} />
              )}
              {clickedFeature.tasking ? "Yes" : "No"}
            </Badge>
          ) : (
            <Badge variant="outline">N/A</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs">Daylight:</span>
          {clickedFeature.is_daytime !== undefined ? (
            <Badge
              variant={
                clickedFeature.is_daytime ? "soft-yellow" : "soft-purple"
              }
              className="flex items-center gap-1"
            >
              {clickedFeature.is_daytime ? (
                <Sun size={12} />
              ) : (
                <Moon size={12} />
              )}
              {clickedFeature.is_daytime ? "Day" : "Night"}
            </Badge>
          ) : (
            <Badge variant="outline">N/A</Badge>
          )}
        </div>

        <div className="font-medium text-xs mt-2 space-y-1">
          <p>Start: {clickedFeature.start_time}</p>
          <p>End: {clickedFeature.end_time}</p>
        </div>
      </div>
    </Popup>
  );
};
