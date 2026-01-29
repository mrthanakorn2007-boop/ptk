"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TierConfig {
  min: number;
  label: string;
  color: string;
  status: string;
}

interface OverviewCardProps {
  score: number;
  studentName?: string;
  config: {
    tiers: TierConfig[];
    visualMax: number;
  };
}

export function OverviewCard({ score, studentName, config }: OverviewCardProps) {
  // Find current tier
  // Sort descending to check highest threshold first
  const sortedTiers = [...config.tiers].sort((a, b) => b.min - a.min);
  const currentTier =
    sortedTiers.find((t) => score >= t.min) ||
    sortedTiers[sortedTiers.length - 1];

  const getColorClass = (colorName: string, type: "text" | "bg" | "border") => {
    // Map simple color names to Tailwind classes
    const map: Record<string, string> = {
      green:
        type === "text"
          ? "text-green-600"
          : type === "bg"
          ? "bg-green-500"
          : "border-green-200",
      blue:
        type === "text"
          ? "text-blue-600"
          : type === "bg"
          ? "bg-blue-500"
          : "border-blue-200",
      red:
        type === "text"
          ? "text-red-600"
          : type === "bg"
          ? "bg-red-500"
          : "border-red-200",
      amber:
        type === "text"
          ? "text-amber-600"
          : type === "bg"
          ? "bg-amber-500"
          : "border-amber-200",
    };
    return (
      map[colorName] ||
      (type === "text"
        ? "text-gray-600"
        : type === "bg"
        ? "bg-gray-500"
        : "border-gray-200")
    );
  };

  const getBgSoftClass = (colorName: string) => {
    const map: Record<string, string> = {
      green: "bg-green-100",
      blue: "bg-blue-100",
      red: "bg-red-100",
      amber: "bg-amber-100",
    };
    return map[colorName] || "bg-gray-100";
  };

  // Calculate position for visual indicator
  // We want to show relative position within the visual range (0 to visualMax)
  // But also handle negative scores or scores > visualMax gracefully
  const visualMin = 0;
  const visualMax = config.visualMax;

  // Clamped percentage for the main bar width/position
  let percentage = ((score - visualMin) / (visualMax - visualMin)) * 100;
  percentage = Math.max(0, Math.min(100, percentage));

  return (
    <Card className="border-0 shadow-sm border bg-white overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-900 text-md font-bold">
              คะแนนความประพฤติ
            </h3>
            <h3 className="text-gray-500 text-sm font-medium">
              {studentName || 'นักเรียน'}
            </h3>
            <div
              className={cn(
                "text-5xl font-bold mt-6 tracking-tight",
                getColorClass(currentTier.color, "text")
              )}
            >
              {score}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold border",
                getBgSoftClass(currentTier.color),
                getColorClass(currentTier.color, "text"),
                getColorClass(currentTier.color, "border")
              )}
            >
              {currentTier.label}
            </span>
          </div>
        </div>

        {/* Custom Visual Indicator */}
        <div className="relative pt-6 pb-2">
          {/* Background Track */}
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex relative">
            {/* We can show segments for the tiers if desired, or just a solid track.
                 Let's stick to a clean track with the progress fill for now,
                 or a gradient representing the tiers if complex.

                 User asked for: "indicator like bar or something that show you are here in the bar"
             */}

            {/* Let's make a segmented background to show the 'zones' roughly?
                 Actually, simple progress bar is cleaner, but let's mark the '50' and '150' spots?
             */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-red-100"
              style={{ width: `${(50 / visualMax) * 100}%` }}
            ></div>
            <div
              className="absolute top-0 bottom-0 bg-blue-100"
              style={{
                left: `${(50 / visualMax) * 100}%`,
                width: `${((150 - 50) / visualMax) * 100}%`,
              }}
            ></div>
            <div
              className="absolute top-0 bottom-0 right-0 bg-green-100"
              style={{ left: `${(150 / visualMax) * 100}%` }}
            ></div>
          </div>

          {/* Current Position Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out z-10"
            style={{ left: `${percentage}%` }}
          >
            {/* The Pin/Needle */}
            <div
              className={cn(
                "h-6 w-1 rounded-full absolute -top-3 left-0 -translate-x-1/2 shadow-sm ring-2 ring-white",
                getColorClass(currentTier.color, "bg")
              )}
            />

            {/* Label bubble above? Or just the line is enough?
                 Let's add a small dot at the bottom
             */}
            <div
              className={cn(
                "w-3 h-3 rounded-full absolute top-2 left-0 -translate-x-1/2 shadow-sm ring-2 ring-white",
                getColorClass(currentTier.color, "bg")
              )}
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
            <span>0</span>
            <span className="text-blue-400" style={{ marginLeft: "-10%" }}>
              50
            </span>
            <span className="text-green-500" style={{ marginRight: "-10%" }}>
              150
            </span>
            <span>{visualMax}+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
