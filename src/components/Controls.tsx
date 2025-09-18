import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Info,
  Sun,
  Moon,
} from "lucide-react";

export const Controls = () => {
  const {
    selectedConstellation,
    selectedOperator,
    selectedSensorType,
    selectedSpatialResolution,
    selectedDataAccess,
    selectedTasking,
    selectedDaylight,
    availableConstellations,
    availableOperators,
    availableSensorTypes,
    availableSpatialResolution,
    availableDataAccess,
    availableTasking,
    availableDaylight,
    metadata,
    setConstellation,
    setOperator,
    setSensorType,
    setSpatialResolution,
    setDataAccess,
    setTasking,
    setDaylight,
    resetFilters,
  } = useFilterStore();

  if (!metadata) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sensor Types</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Filter satellites by the type of sensor technology they use
                (optical, synthetic aperture radar, or hyperspectral).
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <ToggleGroup
          type="single"
          value={selectedSensorType}
          onValueChange={(value) => setSensorType(value || "all")}
          variant="outline"
          size="sm"
          className="w-full mt-1"
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

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Spatial Resolution</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Filter by the level of detail satellites can capture (high,
                medium, low)
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <ToggleGroup
          type="single"
          value={selectedSpatialResolution}
          onValueChange={(value) => setSpatialResolution(value || "all")}
          variant="outline"
          size="sm"
          className="w-full mt-1"
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
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Data Access</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Filter by whether satellite data is freely available or requires
                payment
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <ToggleGroup
          type="single"
          value={selectedDataAccess}
          onValueChange={(value) => setDataAccess(value || "all")}
          variant="outline"
          size="sm"
          className="w-full mt-1"
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
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Taskable</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Filter by whether satellites can be pointed to specific
                locations on demand
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <ToggleGroup
          type="single"
          value={selectedTasking}
          onValueChange={(value) => setTasking(value || "all")}
          variant="outline"
          size="sm"
          className="w-full mt-1"
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

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Daylight</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Filter by whether satellite observations occur during daytime or nighttime
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <ToggleGroup
          type="single"
          value={selectedDaylight}
          onValueChange={(value) => setDaylight(value || "all")}
          variant="outline"
          size="sm"
          className="w-full mt-1"
        >
          <ToggleGroupItem value="all" aria-label="All times">
            <Globe />
            ALL
          </ToggleGroupItem>
          {availableDaylight.map(({ value, disabled }) => {
            const isDaytime = value === "daytime";
            const isNighttime = value === "nighttime";

            const getIcon = () => {
              if (isDaytime) return <Sun />;
              if (isNighttime) return <Moon />;
              return <Globe />;
            };

            const iconText = isDaytime
              ? "DAY"
              : isNighttime
              ? "NIGHT"
              : value.toUpperCase();

            return (
              <ToggleGroupItem
                key={value}
                value={value}
                disabled={disabled}
                aria-label={`${value} observations - ${
                  isDaytime
                    ? "during daylight hours"
                    : isNighttime
                    ? "during nighttime hours"
                    : "unknown time"
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
            <SelectTrigger className="w-full mt-1">
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
            <SelectTrigger className="w-full mt-1">
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
