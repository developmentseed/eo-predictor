import { Popup } from "react-map-gl/maplibre";

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
      </div>
    </Popup>
  );
};