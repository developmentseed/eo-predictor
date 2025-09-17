import { Popup } from "react-map-gl/maplibre";
import { Sun, Moon } from "lucide-react";
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

export const SatellitePopup = ({ clickedFeature, onClose }: SatellitePopupProps) => {
  if (!clickedFeature) return null;

  return (
    <Popup
      longitude={clickedFeature.lngLat.lng}
      latitude={clickedFeature.lngLat.lat}
      onClose={onClose}
      closeOnClick={false}
    >
      <div>
        <h3 className="font-bold mb-1">
          Satellite: {clickedFeature.satellite}
        </h3>
        <p>Constellation: {clickedFeature.constellation}</p>
        <p>Operator: {clickedFeature.operator}</p>
        <p>Sensor Type: {clickedFeature.sensor_type}</p>
        <p>Spatial Resolution: {clickedFeature.spatial_res_m} m</p>
        <p>Data Access: {clickedFeature.data_access}</p>
        <p>Tasking: {clickedFeature.tasking ? "Yes" : "No"}</p>
        <p>Start Time: {clickedFeature.start_time}</p>
        <p>End Time: {clickedFeature.end_time}</p>
        <div className="flex items-center gap-1 mt-1">
          <span>Daylight:</span>
          {clickedFeature.is_daytime !== undefined ? (
            <Badge
              variant={clickedFeature.is_daytime ? "soft-yellow" : "soft-purple"}
              className="flex items-center gap-1"
            >
              {clickedFeature.is_daytime ? <Sun size={12} /> : <Moon size={12} />}
              {clickedFeature.is_daytime ? "Day" : "Night"}
            </Badge>
          ) : (
            <Badge variant="outline">N/A</Badge>
          )}
        </div>
      </div>
    </Popup>
  );
};