import { Syringe, Stethoscope, Pill, Scissors, FileText, Activity } from "lucide-react";

const icons = {
  vaccination: Syringe,
  visit: Stethoscope,
  surgery: Activity,
  medication: Pill,
  prevention: Pill,
  grooming: Scissors,
  default: FileText,
};

type RecordType = keyof typeof icons;

interface RecordIconProps {
  type: string;
  className?: string;
}

export function RecordIcon({ type, className }: RecordIconProps) {
  const Icon = icons[type.toLowerCase() as RecordType] || icons.default;
  
  return <Icon className={className} />;
}
