"use client";

import * as React from "react";
import Image from "next/image";
import { Calendar, X, Globe, ExternalLink } from "lucide-react";

export interface Announcement {
  content: React.ReactNode;
  id: number;
  image:  string;
  title: string;
  date: string;
  type?: string; // Add this to match the API data
  targetAudience?: string; // Add this to match the API data
  category?: string;
  description?: string;
  priority?:  "high" | "medium" | "low";
  imageUrl?:  string | null;
  externalUrl?: string | null;
}

interface AnnouncementModalProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementModal({
  announcement,
  isOpen,
  onClose,
}:  AnnouncementModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style. overflow = "hidden";
    } else {
      document.body. style. overflow = "unset"; // Fixed syntax error
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !announcement) return null;

  // Map API type to priority for display
  const getTypeInfo = (type?: string) => {
    switch (type) {
      case "urgent": 
        return {
          color:   "bg-red-50 text-red-600 border-red-200",
          text:   "ด่วน",
          priority: "high" as const
        };
      case "event":
        return {
          color: "bg-green-50 text-green-600 border-green-200",
          text:  "กิจกรรม",
          priority: "medium" as const
        };
      case "general":
      default: 
        return {
          color: "bg-blue-50 text-blue-600 border-blue-200",
          text: "ทั่วไป",
          priority: "low" as const
        };
    }
  };

  const getAudienceInfo = (audience?: string) => {
    switch (audience) {
      case "all": 
        return "ทุกคน";
      case "students": 
        return "นักเรียน";
      case "teachers":
        return "คุณครู";
      default: 
        return "ทุกคน";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": 
        return {
          color: "bg-red-50 text-red-600 border-red-200",
          text: "สำคัญ",
        };
      case "medium": 
        return {
          color:  "bg-amber-50 text-amber-600 border-amber-200",
          text: "ปานกลาง",
        };
      case "low":
        return {
          color: "bg-green-50 text-green-600 border-green-200",
          text:   "ทั่วไป",
        };
      default: 
        return {
          color:  "bg-blue-50 text-blue-600 border-blue-200",
          text: "ทั่วไป",
        };
    }
  };

  const typeInfo = getTypeInfo(announcement. type);

  // Extract website name from URL
  const getWebsiteName = (url: string) => {
    try {
      const urlObj = new URL(url);
      // Remove 'www.' prefix and get the domain
      let domain = urlObj.hostname. replace(/^www\./, '');
      // Get the main domain name (e.g., 'google.com' from 'docs. google.com')
      const parts = domain.split('.');
      if (parts.length > 2) {
        domain = parts. slice(-2).join('.');
      }
      return domain;
    } catch {
      return url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl max-w-[430px] w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
        {/* Header Image with 2:1 aspect ratio */}
        <div className="relative w-full aspect-[2/1]">
          <Image
            src={announcement.imageUrl || announcement. image}
            alt={announcement. title}
            fill
            className="object-cover"
            sizes="(max-width: 430px) 100vw, 430px"
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white rounded-full p-2 hover: bg-black/40 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-215px)]">
          <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
            {announcement.title}
          </h2>

          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar size={14} />
            <span className="text-sm">{announcement.date}</span>
          </div>

          <div className="flex gap-2 mb-4">
            {/* Show type badge (mapped from API data) */}
            {announcement.type && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeInfo.color}`}>
                {typeInfo.text}
              </span>
            )}

            {/* Show target audience badge */}
            {announcement.targetAudience && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                {getAudienceInfo(announcement.targetAudience)}
              </span>
            )}

            {/* Legacy category support */}
            {announcement.category && (
              <span className="bg-white backdrop-blur-sm text-gray-600 text-xs border px-2 py-1 rounded-2xl font-medium">
                {announcement.category}
              </span>
            )}

            {/* Legacy priority support */}
            {announcement.priority && (
              <span
                className={`text-xs px-2 py-1 rounded-2xl font-medium border backdrop-blur-sm bg-white/90 ${
                  getPriorityBadge(announcement.priority).color
                }`}
              >
                {getPriorityBadge(announcement.priority).text}
              </span>
            )}
          </div>

          {/* Display content (short description) */}
          {announcement.content && (
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">เนื้อหา</h3>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                {announcement.content}
              </p>
            </div>
          )}

          {/* Display description (detailed description) */}
          {announcement.description && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">รายละเอียดเพิ่มเติม</h3>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                {announcement.description}
              </p>
            </div>
          )}

          {/* If no description, show content without heading */}
          {!announcement. description && ! announcement.content && (
            <div className="mb-4">
              <p className="text-gray-500 text-sm italic">
                ไม่มีรายละเอียดเพิ่มเติม
              </p>
            </div>
          )}

          {/* External URL Badge */}
          {announcement.externalUrl && (
            <a
              href={announcement.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 mb-4 group"
            >
              <Globe size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {getWebsiteName(announcement.externalUrl)}
              </span>
              <ExternalLink size={14} className="text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-brand-secondary text-white font-medium py-3 px-4 rounded-xl transition-colors mt-2 text-sm"
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
}
