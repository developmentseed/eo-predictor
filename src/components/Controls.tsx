import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useFilterStore } from "@/store/filterStore";
import {
  Globe,
  Eye,
  Radio,
  Maximize,
  Square,
  Minimize,
  Unlock,
  Lock,
} from "lucide-react";

interface ControlsProps {
  mapRef: React.RefObject<any>;
}

export const Controls = ({ mapRef }: ControlsProps) => {
  const {
    selectedConstellation,
    selectedOperator,
    selectedSensorType,
    selectedSpatialResolution,
    selectedDataAccess,
    availableConstellations,
    availableOperators,
    availableSensorTypes,
    availableSpatialResolution,
    availableDataAccess,
    metadata,
    setConstellation,
    setOperator,
    setSensorType,
    setSpatialResolution,
    setDataAccess,
  } = useFilterStore();

  if (!metadata) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Sensor Types</label>
        <ToggleGroup
          type="single"
          value={selectedSensorType}
          onValueChange={setSensorType}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem value="all" aria-label="All sensors">
            <Globe />
          </ToggleGroupItem>
          {availableSensorTypes.map(({ value, disabled }) => {
            const getIcon = () => {
              if (
                value.toLowerCase().includes("optical") ||
                value.toLowerCase().includes("multispectral")
              ) {
                return <Eye />;
              }
              if (
                value.toLowerCase().includes("sar") ||
                value.toLowerCase().includes("radar")
              ) {
                return <Radio />;
              }
              return <Square />;
            };

            return (
              <ToggleGroupItem
                key={value}
                value={value}
                disabled={disabled}
                aria-label={`${value} sensors`}
              >
                {getIcon()}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Spatial Resolution</label>
        <ToggleGroup
          type="single"
          value={selectedSpatialResolution}
          onValueChange={setSpatialResolution}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem value="all" aria-label="All resolutions">
            <Globe />
          </ToggleGroupItem>
          {availableSpatialResolution.map(({ value, disabled }) => {
            const getIcon = () => {
              if (value === "high") return <Maximize />;
              if (value === "medium") return <Square />;
              return <Minimize />;
            };

            const label =
              value === "high" ? "High" : value === "medium" ? "Medium" : "Low";

            return (
              <ToggleGroupItem
                key={value}
                value={value}
                disabled={disabled}
                aria-label={`${label} resolution`}
              >
                {getIcon()}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Data Access</label>
        <ToggleGroup
          type="single"
          value={selectedDataAccess}
          onValueChange={setDataAccess}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem value="all" aria-label="All data access types">
            <Globe />
          </ToggleGroupItem>
          {availableDataAccess.map(({ value, disabled }) => {
            const getIcon = () => {
              if (value.toLowerCase().includes("open")) {
                return <Unlock />;
              }
              if (value.toLowerCase().includes("commercial")) {
                return <Lock />;
              }
              return <Square />;
            };

            return (
              <ToggleGroupItem
                key={value}
                value={value}
                disabled={disabled}
                aria-label={`${value} data access`}
              >
                {getIcon()}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
      <div className="flex gap-12">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Constellation</label>
          <Select
            onValueChange={setConstellation}
            value={selectedConstellation}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a constellation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {availableConstellations.map(({ value, disabled }) => (
                <SelectItem
                  key={value}
                  value={value}
                  disabled={disabled}
                  className={disabled ? "opacity-50" : ""}
                >
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Operator</label>
          <Select onValueChange={setOperator} value={selectedOperator}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {availableOperators.map(({ value, disabled }) => (
                <SelectItem
                  key={value}
                  value={value}
                  disabled={disabled}
                  className={disabled ? "opacity-50" : ""}
                >
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
