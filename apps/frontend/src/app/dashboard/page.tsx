"use client";

import { useState } from "react";
import { FloatingHeader } from "@/components/dashboard/header";
import { StudentCard } from "@/components/dashboard/student-card";
import { SearchBar } from "@/components/dashboard/search-bar";
import { AnnouncementCarousel } from "@/components/dashboard/announcement-carousel";
import Link from "next/link";
import { LayoutGrid, Calendar, Award } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    name: "คะแนนความประพฤติ",
    icon: Award,
    href: "/features/conduct",
    color: "text-brand-secondary",
    active: true,
  },
  {
    name: "ตารางเรียน",
    icon: Calendar,
    href: "/features/schedule",
    color: "text-brand-secondary",
    active: true,
  },
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFeatures = features.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen">
      <FloatingHeader />

      <main className="flex-1 px-4 gap-5 flex flex-col">
        {/* Student Card Section */}
        <section className="flex justify-center">
          <StudentCard />
        </section>

        {/* Search Section */}
        <section>
          <div className="flex items-center justify-between">
            {/* Header (left) */}
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-brand-secondary" />
              ฟีเจอร์
            </CardTitle>
            {/* Search Bar (right) */}
            <div className="flex items-center">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section>
          <div className="grid grid-cols-4 gap-4">
            {filteredFeatures.map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className={`flex flex-col items-center gap-2 group ${
                  !feature.active ? "opacity-100" : ""
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center ${
                    feature.color
                  } ${
                    feature.active
                      ? "group-hover:shadow-sm transition-all group-hover:-translate-y-1"
                      : ""
                  }`}
                >
                  <feature.icon size={24} />
                </div>
                <span
                  className={`text-xs font-medium text-center text-gray-600 ${feature.active ? "group-hover:text-gray-800" : "text-gray-400"}`}
                >
                  {feature.name}
                </span>
              </Link>
            ))}
            {filteredFeatures.length === 0 && (
              <div className="col-span-4 text-center text-gray-400 text-sm py-4">
                No features found.
              </div>
            )}
          </div>
        </section>

        {/* PR / Announcements */}
        <section>
          <AnnouncementCarousel />
        </section>
      </main>
    </div>
  );
}
