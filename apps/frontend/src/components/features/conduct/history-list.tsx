"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HistoryItem {
  id: string;
  studentId: string;
  teacherId: string;
  scoreChange: number;
  reason: string;
  createdAt: string;
}

interface HistoryListProps {
  items: HistoryItem[];
}

export function HistoryList({ items }: HistoryListProps) {
  const getIcon = () => {
    // For MVP, we'll use a single icon for all entries
    return <AlertCircle className="h-5 w-5 text-gray-500" />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (items.length === 0) {
    return (
        <div className="text-center py-8 text-gray-500 text-sm">
            ไม่มีประวัติการเปลี่ยนแปลงคะแนน
        </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4"
        >
          <div className="p-2 bg-gray-50 rounded-full shrink-0">
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-800 text-sm truncate">
                {item.reason}
              </h4>
              <span
                className={cn(
                  "text-sm font-bold whitespace-nowrap ml-2",
                  item.scoreChange > 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {item.scoreChange > 0 ? "+" : ""}
                {item.scoreChange}
              </span>
            </div>

            <div className="flex justify-between items-end mt-1">
               <div className="text-xs text-gray-400">
                 {formatDate(item.createdAt)}
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
