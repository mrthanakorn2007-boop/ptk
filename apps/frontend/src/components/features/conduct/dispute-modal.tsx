"use client";

import * as React from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DisputeModal({ isOpen, onClose }: DisputeModalProps) {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log("Submitting dispute:", reason);
    alert("ส่งคำร้องเรียบร้อยแล้ว");
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl max-w-[430px] w-full overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle size={24} />
                <h2 className="text-xl font-bold text-gray-800">ยื่นคำร้อง/ชี้แจง</h2>
            </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-4">
            หากพบว่าคะแนนมีความผิดพลาด หรือต้องการชี้แจงเหตุผล สามารถส่งคำร้องได้ที่นี่
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="ระบุเหตุผลหรือข้อเท็จจริง..."
            className="w-full h-32 p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
            required
          />
          <Button type="submit" className="w-full bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90">
            ส่งคำร้อง
          </Button>
        </form>
      </div>
    </div>
  );
}
