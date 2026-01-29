"use client";

import { useGetSchedulesMe } from "@/lib/api/generated/default/default";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";

export function ScheduleCard() {
    const { data: scheduleData, isLoading } = useGetSchedulesMe();

    // Handle optional wrapper
    const response = scheduleData as Record<string, unknown> | Array<Record<string, unknown>>;
    const schedules = (
      (typeof response === 'object' && response !== null && 'data' in response)
        ? (response as Record<string, unknown>).data
        : response
    ) as any[] || [];

    // Get current day (1=Mon, ..., 7=Sun)
    // JS getDay(): 0=Sun, 1=Mon.
    const jsDay = new Date().getDay();
    const currentDayOfWeek = jsDay === 0 ? 7 : jsDay;

    // Filter for today's schedule and sort by period/startTime
    const todaySchedule = Array.isArray(schedules)
        ? schedules
            .filter((s) => s.dayOfWeek === currentDayOfWeek)
            .sort((a, b) => a.period - b.period)
        : [];

    const todayDate = format(new Date(), "EEEE d MMMM", { locale: th });

    if (isLoading) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0 pb-2">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </Card>
        );
    }

    if (todaySchedule.length === 0) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-brand-secondary" />
                        ตารางเรียนวันนี้
                    </CardTitle>
                    <span className="text-xs text-gray-500 font-medium bg-white/50 px-2 py-1 rounded-full">
                        {todayDate}
                    </span>
                </CardHeader>
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <Calendar className="w-10 h-10 mb-2 opacity-20" />
                    <span className="text-sm">ไม่มีเรียนวันนี้</span>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-secondary" />
                    ตารางเรียนวันนี้
                </CardTitle>
                <span className="text-xs text-gray-500 font-medium bg-white/50 px-2 py-1 rounded-full">
                    {todayDate}
                </span>
            </CardHeader>
            <CardContent className="px-0 flex flex-col gap-3">
                {todaySchedule.map((item) => (
                    <div
                        key={item.id}
                        className="group relative bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4 overflow-hidden"
                    >
                        {/* Left Accent Bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-secondary/80 rounded-l-xl" />

                        {/* Time */}
                        <div className="flex flex-col items-center justify-center min-w-[60px] py-1 bg-gray-50 rounded-lg text-xs font-medium text-gray-600">
                            <span className="text-brand-secondary font-bold text-sm">
                                {item.startTime.slice(0, 5)}
                            </span>
                            <span className="text-[10px] text-gray-400">-</span>
                            <span>{item.endTime.slice(0, 5)}</span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 py-0.5">
                            <h3 className="font-bold text-gray-900 truncate pr-2">
                                {item.subject.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                    {item.subject.code}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {item.room.code}
                                </span>
                            </div>
                        </div>

                        {/* Period Badge */}
                        <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-400">
                                {item.period}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
