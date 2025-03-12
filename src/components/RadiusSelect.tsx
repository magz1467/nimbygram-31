import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface RadiusSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const RadiusSelect = ({ value, onChange }: RadiusSelectProps) => {
  return (
    <div className="space-y-3">
      <Label>Notification radius</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-col space-y-2"
        aria-label="Select notification radius"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="100" id="r100" />
          <Label htmlFor="r100">Within 100 metres</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="500" id="r500" />
          <Label htmlFor="r500">Within 500 metres</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1000" id="r1000" />
          <Label htmlFor="r1000">Within 1 kilometre</Label>
        </div>
      </RadioGroup>
    </div>
  );
};