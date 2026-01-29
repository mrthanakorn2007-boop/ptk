import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative px-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="ค้นหาฟีเจอร์"
        className="pl-10 h-8 rounded-full bg-white border-gray-200 text-sm focus-visible:ring-2 focus-visible:ring-brand-secondary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
