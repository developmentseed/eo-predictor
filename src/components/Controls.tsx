import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretDown } from "phosphor-react";
import { useFilterStore } from "@/store/filterStore";
import { TimeSlider } from "@/components/TimeSlider";

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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Satellite Filters</CardTitle>
        <CardDescription>
          Filter based on properties of the satellite.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Range */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline [&[data-state=open]>svg]:rotate-180">
            Time Range
            <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="[&>*]:border-0 [&>*]:shadow-none [&>*]:bg-transparent [&>*]:p-0">
              <TimeSlider />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Location Filters */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline [&[data-state=open]>svg]:rotate-180">
            Location & Platform
            <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Constellation</label>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Operator</label>
              <Select onValueChange={setOperator} value={selectedOperator}>
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
          </CollapsibleContent>
        </Collapsible>

        {/* Data Characteristics */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline [&[data-state=open]>svg]:rotate-180">
            Data Characteristics
            <CaretDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sensor Types</label>
              <RadioGroup
                value={selectedSensorType}
                onValueChange={setSensorType}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="sensor-all" />
                  <label htmlFor="sensor-all" className="text-sm">
                    All
                  </label>
                </div>
                {availableSensorTypes.map(({ value, disabled }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={value}
                      id={`sensor-${value}`}
                      disabled={disabled}
                    />
                    <label
                      htmlFor={`sensor-${value}`}
                      className={`text-sm ${disabled ? "opacity-50" : ""}`}
                    >
                      {value}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Spatial Resolution</label>
              <RadioGroup
                value={selectedSpatialResolution}
                onValueChange={setSpatialResolution}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="resolution-all" />
                  <label htmlFor="resolution-all" className="text-sm">
                    All
                  </label>
                </div>
                {availableSpatialResolution.map(({ value, disabled }) => {
                  const label =
                    value === "high"
                      ? "High (<5m)"
                      : value === "medium"
                      ? "Medium (5-30m)"
                      : "Low (>30m)";
                  return (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={value}
                        id={`resolution-${value}`}
                        disabled={disabled}
                      />
                      <label
                        htmlFor={`resolution-${value}`}
                        className={`text-sm ${disabled ? "opacity-50" : ""}`}
                      >
                        {label}
                      </label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Access</label>
              <RadioGroup
                value={selectedDataAccess}
                onValueChange={setDataAccess}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="access-all" />
                  <label htmlFor="access-all" className="text-sm">
                    All
                  </label>
                </div>
                {availableDataAccess.map(({ value, disabled }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={value}
                      id={`access-${value}`}
                      disabled={disabled}
                    />
                    <label
                      htmlFor={`access-${value}`}
                      className={`text-sm capitalize ${
                        disabled ? "opacity-50" : ""
                      }`}
                    >
                      {value}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
