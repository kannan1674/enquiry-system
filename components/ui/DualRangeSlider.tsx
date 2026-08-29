import * as React from "react";
import { Slider } from "@/components/ui/slider";

interface DualRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  className?: string;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min = 1,
  max = 9999,
  step = 1,
  value,
  onChange,
  className = "",
}) => {
  const [internalValue, setInternalValue] = React.useState<[number, number]>([
    min,
    max,
  ]);

  // Keep internal state in sync with controlled value
  React.useEffect(() => {
    if (value) setInternalValue(value);
  }, [value]);

  const handleValueChange = (val: number[]) => {
    if (val.length === 2) {
      setInternalValue([val[0], val[1]]);
      onChange?.([val[0], val[1]]);
    }
  };

  return (
    <div className={`w-full max-w-md space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{internalValue[0]}</span>
        <span className="text-sm font-medium text-gray-700">{internalValue[1]}</span>
      </div>
      <Slider
        defaultValue={[min, max]}
        value={internalValue}
        min={min}
        max={max}
        step={step}
        onValueChange={handleValueChange}
        className="w-full slider-purple"
      />
    </div>
  );
}; 