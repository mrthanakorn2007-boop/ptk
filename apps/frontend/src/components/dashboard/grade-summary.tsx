"use client";

import { useGetAcademicScores } from "@/lib/api/generated/default/default";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Award, BookOpen } from "lucide-react";

export function GradeSummary() {
    const { data: scoresData, isLoading } = useGetAcademicScores();

    const response = scoresData as Record<string, unknown> | Array<Record<string, unknown>>;
    const scores = (
      (typeof response === 'object' && response !== null && 'data' in response)
        ? (response as Record<string, unknown>).data
        : response
    ) as Array<Record<string, unknown>> || [];

    // Calculate GPA (Mock calculation for display if not provided)
    // Assuming credit * grade_value / total_credit
    // This is a rough estimation for display purposes
    const calculateGPA = (courses: Array<Record<string, unknown>>) => {
        let totalPoints = 0;
        let totalCredits = 0;

        courses.forEach(course => {
            const grade = parseFloat(course.grade as string);
            const credit = Number(course.credit);
            if (!isNaN(grade)) {
                totalPoints += grade * credit;
                totalCredits += credit;
            }
        });

        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    };

    const gpa = calculateGPA(scores);

    if (isLoading) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0 pb-2">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </Card>
        );
    }

    if (scores.length === 0) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0 pb-2">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-brand-secondary" />
                        ผลการเรียน
                    </CardTitle>
                </CardHeader>
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <BookOpen className="w-10 h-10 mb-2 opacity-20" />
                    <span className="text-sm">ไม่พบข้อมูลผลการเรียน</span>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-brand-secondary" />
                    ผลการเรียนล่าสุด
                </CardTitle>
                <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                    <Award className="w-3 h-3" />
                    GPA: {gpa}
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid grid-cols-1 gap-3">
                    {scores.slice(0, 5).map((item: any, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900 line-clamp-1">{item.subjectName}</span>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{item.subjectCode}</span>
                                    <span>{item.credit} หน่วยกิต</span>
                                </div>
                            </div>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${item.grade === '4' ? 'bg-green-100 text-green-700' :
                                    item.grade === '3.5' || item.grade === '3' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {item.grade}
                            </div>
                        </div>
                    ))}
                    {scores.length > 5 && (
                        <button className="text-xs text-center text-gray-400 hover:text-brand-secondary mt-1">
                            ดูทั้งหมด ({scores.length})
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
