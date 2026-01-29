"use client";

import { ChevronDown, Filter } from "lucide-react";

interface FilterBarProps {
  semesters: string[];
  currentSemester: string;
  onSemesterChange: (semester: string) => void;
}

export function FilterBar({ semesters, currentSemester, onSemesterChange }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 text-gray-700 font-medium">
        <Filter size={18} />
        <span>ประวัติการเปลี่ยนแปลง</span>
      </div>

      <div className="relative">
        <select
          value={currentSemester}
          onChange={(e) => onSemesterChange(e.target.value)}
          className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
        >
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              เทอม {sem}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}
