import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: Option[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  className?: string
  maxDisplayed?: number
}

export function MultiSelect({
  options,
  value = [],
  onValueChange,
  placeholder = "Select items...",
  className,
  maxDisplayed = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onValueChange?.(newValue)
  }

  const handleRemove = (optionValue: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const newValue = value.filter((v) => v !== optionValue)
    onValueChange?.(newValue)
  }

  const getDisplayText = () => {
    if (value.length === 0) return placeholder
    if (value.length <= maxDisplayed) {
      return value.map((v) => options.find((opt) => opt.value === v)?.label || v).join(", ")
    }
    return `${value.length} selected`
  }

  const selectedOptions = value.map((v) => options.find((opt) => opt.value === v)).filter(Boolean) as Option[]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between min-h-9", className)}
        >
          <div className="flex items-center gap-1 flex-wrap flex-1 text-left">
            {value.length <= maxDisplayed ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs"
                >
                  {option.label}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer hover:bg-muted rounded-full"
                    onClick={(e) => handleRemove(option.value, e)}
                  />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{getDisplayText()}</span>
            )}
            {value.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={() => !option.disabled && handleSelect(option.value)}
                  className={cn(
                    "cursor-pointer",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}