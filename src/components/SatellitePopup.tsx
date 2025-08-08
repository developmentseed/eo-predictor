import { Popup } from "react-map-gl/maplibre";

interface SatellitePopupProps {
  clickedFeature: any;
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
        <p>Start Time: {clickedFeature.start_time}</p>
        <p>End Time: {clickedFeature.end_time}</p>
      </div>
    </Popup>
  );
};