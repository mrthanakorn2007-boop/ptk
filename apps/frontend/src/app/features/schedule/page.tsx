"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Data Structure expected from backend
export interface ScheduleItem {
  id: string;
  dayOfWeek: number; // 1=Mon .. 7=Sun
  period: number;
  startTime: string; // "08:30"
  endTime: string; // "09:20"
  subjectCode: string;
  subjectName: string;
  room: string;
  teacher: string;
}

// Mock schedule data (few items across days and periods)
const MOCK_SCHEDULE_DATA: ScheduleItem[] = [
  {
    id: "s1",
    dayOfWeek: 1,
    period: 1,
    startTime: "08:30",
    endTime: "09:20",
    subjectCode: "MATH101",
    subjectName: "คณิตศาสตร์",
    room: "A101",
    teacher: "ครูวิทย์",
  },
  {
    id: "s2",
    dayOfWeek: 2,
    period: 2,
    startTime: "09:30",
    endTime: "10:20",
    subjectCode: "ENG201",
    subjectName: "ภาษาอังกฤษ",
    room: "B203",
    teacher: "ครูแอน",
  },
  {
    id: "s3",
    dayOfWeek: 2,
    period: 3,
    startTime: "10:30",
    endTime: "11:20",
    subjectCode: "SCI110",
    subjectName: "วิทยาศาสตร์",
    room: "A101",
    teacher: "ครูเอ๋",
  },
  {
    id: "s4",
    dayOfWeek: 3,
    period: 1,
    startTime: "08:30",
    endTime: "09:20",
    subjectCode: "HIST01",
    subjectName: "ประวัติศาสตร์",
    room: "C102",
    teacher: "ครูปอย",
  },
  {
    id: "s5",
    dayOfWeek: 4,
    period: 4,
    startTime: "13:30",
    endTime: "14:20",
    subjectCode: "PE01",
    subjectName: "พลศึกษา",
    room: "GYM",
    teacher: "ครูบอล",
  },
  {
    id: "s6",
    dayOfWeek: 5,
    period: 2,
    startTime: "09:30",
    endTime: "10:20",
    subjectCode: "ART01",
    subjectName: "ศิลปะ",
    room: "A201",
    teacher: "ครูนา",
  },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SchedulePage() {
  const [tab, setTab] = useState<"mine" | "room">("mine");

  // Mock current time / period selection for highlighting
  const mockCurrent = useMemo(() => ({ dayOfWeek: 2, period: 2 }), []);

  // Room search state (mock)
  const [building, setBuilding] = useState<string>("");
  const [floor, setFloor] = useState<string>("");
  const [room, setRoom] = useState<string>("");

  // Derived data
  const todaysSchedule = useMemo(
    () => MOCK_SCHEDULE_DATA.filter((s) => s.dayOfWeek === mockCurrent.dayOfWeek).sort((a,b)=>a.period-b.period),
    [mockCurrent.dayOfWeek],
  );

  const periods = [1, 2, 3, 4, 5, 6];
  const weekdays = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
              ตารางเรียน
            </h1>
            <p className="text-sm text-gray-500">ปีการศึกษา 1/2569</p>
          </div>
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setTab("mine")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${tab === "mine" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
          >
            ตารางของฉัน
          </button>
          <button
            onClick={() => setTab("room")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${tab === "room" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}
          >
            ค้นหาห้องเรียน
          </button>
        </div>

        {/* Content */}
        {tab === "mine" ? (
          <section>
            {/* Mobile: Timeline / Agenda */}
            <div className="block md:hidden">
              <div className="space-y-3">
                {todaysSchedule.length === 0 && (
                  <div className="text-center text-gray-400 py-8">ไม่มีเรียนวันนี้</div>
                )}
                {todaysSchedule.map((item) => {
                  const isNow = item.dayOfWeek === mockCurrent.dayOfWeek && item.period === mockCurrent.period;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-20 text-xs text-gray-500 text-right flex-shrink-0">
                        <div>{item.startTime}</div>
                        <div className="text-gray-400">{item.endTime}</div>
                      </div>
                      <div className={`flex-1 p-3 rounded-lg border transition-all ${isNow ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50" : "border-gray-100 bg-white"}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-bold text-gray-900">{item.subjectName}</div>
                            <div className="text-xs text-gray-600 mt-1">{item.subjectCode}</div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {item.room}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 text-right flex-shrink-0 ml-2">{item.teacher}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop: Weekly Grid */}
            <div className="hidden md:block">
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* Header Row */}
                <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b border-gray-200 bg-gray-50">
                  <div className="p-3 text-xs font-semibold text-gray-700 text-center">Period</div>
                  {weekdays.map((d) => (
                    <div key={d} className="p-3 text-sm font-semibold text-gray-900 text-center border-l border-gray-200">
                      {DAY_LABELS[d - 1]}
                    </div>
                  ))}
                </div>

                {/* Period Rows */}
                {periods.map((p, idx) => (
                  <div key={p} className={`grid grid-cols-[100px_repeat(5,1fr)] ${idx < periods.length - 1 ? "border-b border-gray-200" : ""}`}>
                    {/* Period Header */}
                    <div className="p-3 text-sm font-semibold text-gray-700 text-center bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                      {p}
                    </div>

                    {/* Schedule Cells */}
                    {weekdays.map((d) => {
                      const item = MOCK_SCHEDULE_DATA.find((s) => s.dayOfWeek === d && s.period === p);
                      const isNow = d === mockCurrent.dayOfWeek && p === mockCurrent.period;
                      return (
                        <div
                          key={d}
                          className={`p-2 min-h-[120px] border-l border-gray-200 flex items-center justify-center transition-all ${
                            isNow ? "bg-indigo-50 ring-2 ring-indigo-400" : "bg-white hover:bg-gray-50"
                          }`}
                        >
                          {item ? (
                            <div className={`w-full h-full p-3 rounded-lg flex flex-col justify-center ${isNow ? "bg-white border-2 border-indigo-400" : "bg-blue-50 border border-blue-200"}`}>
                              <div className="text-sm font-bold text-gray-900 line-clamp-2">{item.subjectName}</div>
                              <div className="text-xs text-gray-600 mt-1">{item.subjectCode}</div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" /> {item.room}
                              </div>
                              <div className="text-xs text-gray-400 mt-2">{item.startTime} - {item.endTime}</div>
                              <div className="text-xs text-gray-600 mt-1">{item.teacher}</div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-300">—</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section>
            {/* Room Search Mock UI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <select value={building} onChange={(e)=>setBuilding(e.target.value)} className="p-2 border rounded">
                <option value="">Select Building</option>
                <option value="A">Building A</option>
                <option value="B">Building B</option>
                <option value="C">Building C</option>
              </select>
              <select value={floor} onChange={(e)=>setFloor(e.target.value)} className="p-2 border rounded">
                <option value="">Select Floor</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
              </select>
              <select value={room} onChange={(e)=>setRoom(e.target.value)} className="p-2 border rounded">
                <option value="">Select Room</option>
                <option value="A101">A101</option>
                <option value="A201">A201</option>
                <option value="B203">B203</option>
              </select>
            </div>

            {!room ? (
              <div className="py-16 text-center text-gray-400 border rounded">Select a room to view schedule</div>
            ) : (
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Schedule for {room}</h3>
                <div className="space-y-2">
                  {MOCK_SCHEDULE_DATA.filter(s=>s.room===room).map(s=> (
                    <div key={s.id} className="p-3 border rounded flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold">{s.subjectName} <span className="text-xs text-gray-400">({s.subjectCode})</span></div>
                        <div className="text-xs text-gray-500">{DAY_LABELS[s.dayOfWeek-1]} • {s.startTime} - {s.endTime}</div>
                      </div>
                      <div className="text-xs text-gray-400">{s.teacher}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
