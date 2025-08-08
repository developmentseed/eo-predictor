import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useFilterStore } from "@/store/filterStore";
import { usePassCounter } from "@/hooks/usePassCounter";

interface ControlsProps {
  mapRef: React.RefObject<any>;
}

export const Controls = ({ mapRef }: ControlsProps) => {
  const [localTimeRange, setLocalTimeRange] = useState<number[]>([]);
  
  const {
    timeRange,
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
    setTimeRange,
    setConstellation,
    setOperator,
    setSensorType,
    setSpatialResolution,
    setDataAccess,
  } = useFilterStore();

  const { getPassCountText } = usePassCounter({ mapRef });

  // Sync local time range with store when timeRange changes from external source
  useEffect(() => {
    if (timeRange.length > 0 && localTimeRange.length === 0) {
      setLocalTimeRange(timeRange);
    }
  }, [timeRange, localTimeRange.length]);

  if (!metadata || !timeRange.length) {
    return null;
  }
  
  return (
    <div className="absolute top-5 left-5 bg-white/80 p-5 rounded-lg flex flex-col gap-4 max-w-sm max-h-[90vh] overflow-y-auto">
      {/* Pass Counter */}
      <div className="bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
        <div className="text-sm font-medium text-blue-900">
          {getPassCountText()}
        </div>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Constellation</label>
        <Select
          onValueChange={setConstellation}
          value={selectedConstellation}
        >
          <SelectTrigger>
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
      
      <div>
        <label className="font-bold mb-2 block">Operator</label>
        <Select
          onValueChange={setOperator}
          value={selectedOperator}
        >
          <SelectTrigger>
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
      
      <div>
        <label className="font-bold mb-2 block">Sensor Types</label>
        <RadioGroup
          value={selectedSensorType}
          onValueChange={setSensorType}
          className="flex flex-wrap gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="sensor-all" />
            <label htmlFor="sensor-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              All
            </label>
          </div>
          {availableSensorTypes.map(({ value, disabled }) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`sensor-${value}`} disabled={disabled} />
              <label
                htmlFor={`sensor-${value}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${disabled ? 'opacity-50' : ''}`}
              >
                {value}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Spatial Resolution</label>
        <RadioGroup
          value={selectedSpatialResolution}
          onValueChange={setSpatialResolution}
          className="flex flex-wrap gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="resolution-all" />
            <label htmlFor="resolution-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              All
            </label>
          </div>
          {availableSpatialResolution.map(({ value, disabled }) => {
            const label = value === 'high' ? 'High (<5m)' : 
                        value === 'medium' ? 'Medium (5-30m)' : 
                        'Low (>30m)';
            return (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={`resolution-${value}`} disabled={disabled} />
                <label
                  htmlFor={`resolution-${value}`}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${disabled ? 'opacity-50' : ''}`}
                >
                  {label}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Data Access</label>
        <RadioGroup
          value={selectedDataAccess}
          onValueChange={setDataAccess}
          className="flex flex-wrap gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="access-all" />
            <label htmlFor="access-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              All
            </label>
          </div>
          {availableDataAccess.map(({ value, disabled }) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`access-${value}`} disabled={disabled} />
              <label
                htmlFor={`access-${value}`}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize ${disabled ? 'opacity-50' : ''}`}
              >
                {value}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div>
        <label className="font-bold mb-2 block">Time Range</label>
        <Slider
          value={localTimeRange.length > 0 ? localTimeRange : timeRange}
          min={metadata.minTime}
          max={metadata.maxTime}
          step={3600000} // 1 hour
          onValueChange={setLocalTimeRange}
          onValueCommit={setTimeRange}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1">
          <span>{new Date((localTimeRange.length > 0 ? localTimeRange : timeRange)[0]).toUTCString()}</span>
          <span>{new Date((localTimeRange.length > 0 ? localTimeRange : timeRange)[1]).toUTCString()}</span>
        </div>
      </div>
    </div>
  );
};