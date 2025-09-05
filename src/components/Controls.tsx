import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/store/filterStore";
import {
  Globe,
  Eye,
  Radio,
  Maximize,
  Square,
  Minimize,
  DollarSign,
  Unlock,
  RotateCcw,
  Asterisk,
  Target,
  Navigation,
} from "lucide-react";

export const Controls = () => {
  const {
    selectedConstellation,
    selectedOperator,
    selectedSensorType,
    selectedSpatialResolution,
    selectedDataAccess,
    selectedTasking,
    availableConstellations,
    availableOperators,
    availableSensorTypes,
    availableSpatialResolution,
    availableDataAccess,
    availableTasking,
    metadata,
    setConstellation,
    setOperator,
    setSensorType,
    setSpatialResolution,
    setDataAccess,
    setTasking,
    resetFilters,
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
          onValueChange={(value) => setSensorType(value || "all")}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem value="all" aria-label="All sensors">
            <Globe />
            ALL
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
              return <Asterisk />;
            };

            return (
              <ToggleGroupItem
                key={value}
                value={value}
                disabled={disabled}
                aria-label={`${value} sensors`}
              >
                {getIcon()}
                {value.slice(0, 3).toUpperCase()}
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
          onValueChange={(value) => setSpatialResolution(value || "all")}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem value="all" aria-label="All resolutions">
            <Globe />
            ALL
          </ToggleGroupItem>
          {availableSpatialResolution.map(({ value, disabled }) => {
            const getIcon = () => {
              if (value === "high") return <Maximize />;
              if (value === "medium") return <Square />;
              return <Minimize />;
            };

            const iconText =
              { high: "HIGH", medium: "MED", low: "LOW" }[value] ||
              value.slice(0, 2).toUpperCase();
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
                {iconText}
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
          onValueChange={(value) => setDataAccess(value || "all")}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem value="all" aria-label="All data access types">
            <Globe />
            ALL
          </ToggleGroupItem>
          {availableDataAccess.map(({ value, disabled }) => {
            const isOpen = value.toLowerCase().includes("open");
            const isCommercial = value.toLowerCase().includes("commercial");

            const getIcon = () => {
              if (isOpen) return <Unlock />;
              if (isCommercial) return <DollarSign />;
              return <Square />;
            };

            const iconText = isOpen
              ? "FREE"
              : isCommercial
              ? "PAID"
              : value.toUpperCase();

            return (
              <ToggleGroupItem
                key={value}
                value={value}
                disabled={disabled}
                aria-label={`${value} data access - ${
                  isOpen
                    ? "free/open access"
                    : isCommercial
                    ? "paid/proprietary"
                    : "unknown access"
                }`}
              >
                {getIcon()}
                {iconText}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Taskable</label>
        <ToggleGroup
          type="single"
          value={selectedTasking}
          onValueChange={(value) => setTasking(value || "all")}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <ToggleGroupItem value="all" aria-label="All satellites">
            <Globe />
            ALL
          </ToggleGroupItem>
          {availableTasking.map(({ value, disabled }) => {
            const isTasking = value === "tasking";
            const isNonTasking = value === "non-tasking";

            const getIcon = () => {
              if (isTasking) return <Target />;
              if (isNonTasking) return <Navigation />;
              return <Square />;
            };

            const iconText = isTasking
              ? "TASK"
              : isNonTasking
              ? "FIXED"
              : value.toUpperCase();

            return (
              <ToggleGroupItem
                key={value}
                value={value}
                disabled={disabled}
                aria-label={`${value} satellites - ${
                  isTasking
                    ? "can be pointed to specific locations"
                    : isNonTasking
                    ? "fixed angle capture"
                    : "unknown tasking"
                }`}
              >
                {getIcon()}
                {iconText}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
      <div className="flex gap-3 overflow-x-auto">
        <div className="min-w-0 flex-1 space-y-2">
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

        <div className="min-w-0 flex-1 space-y-2">
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

        <div className="flex items-end flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={resetFilters}
            title="Reset all filters"
          >
            <RotateCcw />
          </Button>
        </div>
      </div>
    </div>
  );
};
