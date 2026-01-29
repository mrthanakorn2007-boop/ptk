"use client";

import * as React from "react";
import { Search, Plus, Minus } from "lucide-react";
import { FeatureHeader } from "@/components/feature-header";
import { useQuery } from "@tanstack/react-query";
import { customInstance } from "@/lib/api/axios-instance";
import { useCreateConductLog } from "@/lib/api/conduct.hooks";
import { useConductStudent } from "@/lib/api/conduct.hooks";

interface Student {
  id: string;
  studentId: string;
  nameTh: string;
  surnameTh: string;
  nameEn: string;
  surnameEn: string;
  prefix: string;
  class: number;
  room: number;
  conductScore: number;
}

export default function AffairsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [scoreChange, setScoreChange] = React.useState<number>(5);
  const [reason, setReason] = React.useState("");
  const [actionType, setActionType] = React.useState<"add" | "deduct">("deduct");
  const [submitStatus, setSubmitStatus] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const createLog = useCreateConductLog();

  // Search students
  const { data: studentsData, isLoading: isSearching } = useQuery({
    queryKey: ["students", "search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return { data: [] };
      const response = await customInstance<{ data: Student[] }>(
        `/students?search=${encodeURIComponent(searchQuery)}`,
        { method: "GET" }
      );
      return response;
    },
    enabled: searchQuery.length >= 2,
  });

  // Get selected student's conduct data
  const { data: conductData, refetch: refetchConduct } = useConductStudent(
    selectedStudent?.id || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !reason) return;

    const finalScoreChange = actionType === "deduct" ? -scoreChange : scoreChange;

    try {
      setSubmitStatus(null);
      await createLog.mutateAsync({
        studentId: selectedStudent.id,
        scoreChange: finalScoreChange,
        reason,
      });

      // Reset form
      setReason("");
      setScoreChange(5);
      setSubmitStatus({ type: "success", message: "บันทึกสำเร็จ!" });
      
      // Refetch conduct data
      refetchConduct();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error: unknown) {
      console.error("Error creating log:", error);
      
      // Check if it's an error object and has a message
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง";
      
      setSubmitStatus({ 
        type: "error", 
        message: errorMessage
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-gray-50">
      <FeatureHeader title="จัดการคะแนนความประพฤติ" href="/dashboard" />

      <div className="px-4 space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-sm">
              <strong>💡 การใช้งาน:</strong> หากพบข้อผิดพลาด 403 (ไม่มีสิทธิ์) กรุณาตรวจสอบว่าได้ Login ด้วยบัญชี <code className="bg-blue-100 px-1 rounded">affairs@schoolptk.ac.th</code> แล้ว 
              หรือรัน <code className="bg-blue-100 px-1 rounded">bun run seed</code> เพื่อสร้างบัญชีทดสอบ
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-900 text-md font-bold mb-3">ค้นหานักเรียน</h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ชื่อหรือรหัสนักเรียน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="mt-3 text-sm text-gray-500">กำลังค้นหา...</div>
          )}

          {studentsData && studentsData.data && studentsData.data.length > 0 && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {studentsData.data.map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student);
                    setSearchQuery("");
                  }}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="font-medium text-gray-900">
                    {student.prefix} {student.nameTh} {student.surnameTh}
                  </div>
                  <div className="text-sm text-gray-500">
                    รหัส: {student.studentId} | ชั้น: ม.{student.class}/{student.room}
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 &&
            studentsData &&
            studentsData.data &&
            studentsData.data.length === 0 && (
              <div className="mt-3 text-sm text-gray-500">ไม่พบนักเรียน</div>
            )}
        </div>

        {/* Selected Student Section */}
        {selectedStudent && (
          <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-900 text-md font-bold mb-3">
                นักเรียนที่เลือก
              </h3>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedStudent.prefix} {selectedStudent.nameTh}{" "}
                    {selectedStudent.surnameTh}
                  </div>
                  <div className="text-sm text-gray-500">
                    รหัส: {selectedStudent.studentId} | ชั้น: ม.
                    {selectedStudent.class}/{selectedStudent.room}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-primary">
                    {conductData?.totalScore ?? selectedStudent.conductScore}
                  </div>
                  <div className="text-xs text-gray-500">คะแนนปัจจุบัน</div>
                </div>
              </div>
            </div>

            {/* Score Management Form */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-900 text-md font-bold mb-4">
                บันทึกคะแนน
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Action Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภท
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActionType("deduct")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        actionType === "deduct"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      <Minus className="h-5 w-5" />
                      <span className="font-medium">ตัดคะแนน</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionType("add")}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        actionType === "add"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">เพิ่มคะแนน</span>
                    </button>
                  </div>
                </div>

                {/* Score Amount */}
                <div>
                  <label
                    htmlFor="scoreChange"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    จำนวนคะแนน
                  </label>
                  <input
                    type="number"
                    id="scoreChange"
                    min="1"
                    max="100"
                    value={scoreChange}
                    onChange={(e) => setScoreChange(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    required
                  />
                </div>

                {/* Reason */}
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    เหตุผล
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="ระบุเหตุผลในการเปลี่ยนแปลงคะแนน..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    required
                  />
                </div>

                {/* Status Message */}
                {submitStatus && (
                  <div
                    className={`p-4 rounded-lg text-sm ${
                      submitStatus.type === "success"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    <div className="whitespace-pre-line">{submitStatus.message}</div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={createLog.isPending}
                  className="w-full py-3 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLog.isPending ? "กำลังบันทึก..." : "ยืนยันบันทึก"}
                </button>
              </form>
            </div>

            {/* History */}
            {conductData && conductData.history.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-gray-900 text-md font-bold mb-3">
                  ประวัติการเปลี่ยนแปลงคะแนน
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {conductData.history.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {log.reason}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            log.scoreChange > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {log.scoreChange > 0 ? "+" : ""}
                          {log.scoreChange}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!selectedStudent && (
          <div className="text-center py-12 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>ค้นหานักเรียนเพื่อเริ่มบันทึกคะแนน</p>
          </div>
        )}
      </div>
    </div>
  );
}
