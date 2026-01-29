"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetStudentsMe } from "@/lib/api/generated/default/default";

export function FloatingHeader() {
  const { data: studentProfile } = useGetStudentsMe();

  // Handle both wrapped { data: Student, status: 200 } and direct Student object responses
  const response = studentProfile as Record<string, unknown>;
  const student = (response && typeof response === 'object' && 'data' in response
    ? (response as Record<string, unknown>).data
    : response) as any;

  // Derived data
  const prefix = student?.prefix || "";
  const firstName = student?.nameTh || "Guest";
  const lastName = student?.surnameTh || "";
  const className = student?.class && student?.room ? `ม.${student.class}/${student.room}` : "";

  return (
    <header className="sticky top-4 z-50 mx-4 mb-6 flex items-center justify-between px-3 py-2 rounded-[100px] border border-black/15 bg-white/5 shadow-[0_0_5px_1px_rgba(0,0,0,0.1)] backdrop-blur-[7.5px]">
      {/* Left: User Avatar + Name */}
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8 border border-white/20">
          <AvatarImage src="https://media.discordapp.net/attachments/935908059291725905/1461060098121011393/2512742.jpg?ex=696dcb00&is=696c7980&hm=e191d5976194c4ed79b62afbf6d86216b7870423d9ef200e38417c13d9f48503&=&format=webp&width=1752&height=1752" alt="Student" />
          <AvatarFallback>{student?.nameTh?.[0] || "ST"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900 leading-none">
            {prefix} {firstName} {lastName}
          </span>
          <span className="text-[10px] text-gray-500">{className}</span>
        </div>
      </div>

      {/* Right: Logout Button */}
      <Button variant="ghost" size="icon" asChild className="text-gray-500 hover:text-red-500 h-8 w-8 rounded-full">
        <Link href="/">
          <LogOut className="h-4 w-4" />
        </Link>
      </Button>
    </header>
  );
}
