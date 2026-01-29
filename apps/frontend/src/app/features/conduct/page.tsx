"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, AlertTriangle, Filter, ChevronDown } from "lucide-react";
import { OverviewCard } from "@/components/features/conduct/overview-card";
import { HistoryList } from "@/components/features/conduct/history-list";
import { DisputeModal } from "@/components/features/conduct/dispute-modal";
import { FeatureHeader } from "@/components/feature-header";
import { useConductMe, useConductTerms } from "@/lib/api/conduct.hooks";
import confetti from "canvas-confetti"; // <--- 1. Import library

// Default config for conduct score visualization
const defaultConfig = {
  tiers: [
    { min: 150, label: "ดีเยี่ยม", color: "green", status: "good" },
    { min: 50, label: "ผ่านเกณฑ์", color: "blue", status: "pass" },
    { min: -9999, label: "ต้องปรับปรุง", color: "red", status: "warning" }
  ],
  visualMax: 200
};

export default function ConductPage() {
  const [isDisputeOpen, setIsDisputeOpen] = React.useState(false);
  const [selectedTermId, setSelectedTermId] = React.useState<string | null>(null);
  
  // Ref to ensure confetti only runs once per page load
  const hasCelebrated = React.useRef(false);

  const { data: termsData } = useConductTerms();
  const { data: conductData, isLoading, error } = useConductMe();

  // --- CONFETTI EFFECT LOGIC ---
  React.useEffect(() => {
    // Check if data is loaded, score is high, and we haven't celebrated yet
    if (conductData && conductData.totalScore > 150 && !hasCelebrated.current) {
        
      // Fire Confetti!
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Origins from left and right
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      hasCelebrated.current = true; // Mark as done so it doesn't annoy the user on re-renders
    }
  }, [conductData]);


  // Compute available terms from history
  const availableTerms = React.useMemo(() => {
    if (!conductData?.history || !termsData?.terms) return [];
    const usedTermIds = new Set(conductData.history.map(log => log.termId).filter(Boolean));
    return termsData.terms
      .filter(term => usedTermIds.has(term.id))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [conductData?.history, termsData?.terms]);

  // Effect to set default term
  React.useEffect(() => {
    if (selectedTermId === null && availableTerms.length > 0) {
        setSelectedTermId(availableTerms[0].id);
    } else if (selectedTermId === null && availableTerms.length === 0 && conductData) {
        setSelectedTermId('all');
    }
  }, [availableTerms, selectedTermId, conductData]);

  // Filter history based on selection
  const historyItems = React.useMemo(() => {
    if (!conductData?.history) return [];
    if (!selectedTermId || selectedTermId === 'all') return conductData.history;
    return conductData.history.filter(log => log.termId === selectedTermId);
  }, [conductData?.history, selectedTermId]);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <FeatureHeader title="คะแนนความประพฤติ" href="/dashboard" />

      <div className="px-4 space-y-6 pt-4">

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8 text-gray-500 animate-pulse text-sm">
            กำลังโหลดข้อมูล...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </div>
        )}

        {/* Data Display */}
        {conductData && (
          <>
            <OverviewCard
              score={conductData.totalScore}
              studentName={conductData.studentName}
              config={defaultConfig}
            />

            <div>
                {/* Custom Styled Filter Bar */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Filter size={18} />
                        <span>ประวัติการเปลี่ยนแปลง</span>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedTermId || 'all'}
                            onChange={(e) => setSelectedTermId(e.target.value)}
                            disabled={isLoading || availableTerms.length === 0}
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {availableTerms.length > 0 ? (
                                <>
                                    {availableTerms.map((term) => (
                                        <option key={term.id} value={term.id}>
                                            {term.name}
                                        </option>
                                    ))}
                                    <option value="all">ทั้งหมด</option>
                                </>
                            ) : (
                                <option value="all">ทั้งหมด</option>
                            )}
                        </select>
                        <ChevronDown
                            size={14}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                    </div>
                </div>

                {historyItems.length > 0 ? (
                    <HistoryList items={historyItems} />
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border border-gray-100 border-dashed">
                        ไม่พบประวัติในภาคเรียนนี้
                    </div>
                )}
            </div>
          </>
        )}

        {/* Support Section */}
        <div className="pt-4 border-t border-gray-200">
           <h3 className="text-gray-500 text-sm font-medium mb-3">ช่วยเหลือและข้อมูล</h3>
           <div className="grid grid-cols-2 gap-3">
             <Link
               href="#"
               className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all gap-2"
             >
               <BookOpen className="h-6 w-6 text-brand-primary" />
               <span className="text-sm font-medium text-gray-700">คู่มือนักเรียน</span>
             </Link>

             <button
               onClick={() => setIsDisputeOpen(true)}
               className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all gap-2"
             >
               <AlertTriangle className="h-6 w-6 text-amber-500" />
               <span className="text-sm font-medium text-gray-700">ยื่นคำร้อง</span>
             </button>
           </div>
        </div>
      </div>

      <DisputeModal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
      />
    </div>
  );
}
