"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { Bell, Calendar } from "lucide-react"; // Imported CalendarDays for the date icon
import { AnnouncementModal, Announcement } from "./announcement-modal";
import { useGetNotificationsDashboard } from "@/lib/api/generated/default/default";

export function AnnouncementCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    React.useState<Announcement | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: notificationsData, isLoading } = useGetNotificationsDashboard();

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  );

  // Map API data to Announcement type
  const announcements: Announcement[] = React.useMemo(() => {
    const response = notificationsData as
      | Record<string, unknown>
      | Announcement[];
    const rawNotifications =
      ((typeof response === "object" && response !== null && "data" in response
        ? (response as Record<string, unknown>).data
        : response) as unknown[]) || [];

    if (!rawNotifications) return [];

    return (rawNotifications as Array<Record<string, unknown>>).map(
      (n, index) => ({
        id: parseInt(String(n.id)) || index + 1000,
        title: String(n.title),
        content: String(n.content || ""),
        description: n.description ? String(n.description) : undefined,
        imageUrl: n.imageUrl ? String(n.imageUrl) : null,
        externalUrl: n.externalUrl ? String(n.externalUrl) : null,
        date: new Date(String(n.createdAt || n.created_at)).toLocaleDateString(
          "th-TH",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          },
        ),
        image: n.imageUrl ? String(n.imageUrl) : "/announcement-banner.png",
        type: String(n.type),
      }),
    );
  }, [notificationsData]);

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedAnnouncement(null), 300);
  };

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="w-full aspect-[2/1] bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <CardHeader className="px-0 pt-0 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-secondary" />
            ประกาศ
          </CardTitle>
          <span className="text-xs text-gray-500 font-regular bg-white/50 px-2 py-1 rounded-full">
            {announcements.length} รายการ
          </span>
        </CardHeader>
        
        {/* Horizontal Carousel */}
        <div className="relative w-full">
          <Carousel
            className="w-full"
            opts={{
              loop: true,
              align: "center",
              containScroll: "trimSnaps",
            }}
            plugins={[plugin.current]}
            setApi={setApi}
          >
            <CarouselContent className="w-full -ml-2">
              {announcements.map((item, index) => (
              <CarouselItem
                key={`announcement-${item.id}-${index}`}
                className="w-full basis-full pl-2"
              >
                <Card
                className="group/card cursor-pointer shadow-none w-full bg-white"
                onClick={() => handleAnnouncementClick(item)}
                >
                <CardContent className="p-0 w-full rounded-2xl overflow-hidden">
                  {/* Image Container */}
                  <div className="relative w-full aspect-[2/1]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500"
                    sizes="100vw"
                    priority={item.id <= 2}
                  />
                  </div>

                  {/* Text Content */}
                  <div className="pt-3 px-3 pb-4 flex flex-col gap-2">
                  <h3 className="text-gray-900 font-semibold text-base line-clamp-2 leading-tight group-hover/card:text-brand-secondary transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>{item.date}</span>
                  </div>
                  </div>
                </CardContent>
                </Card>
              </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-1.5 mt-4">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={`dot-${index}`}
                className={`transition-all duration-300 rounded-full ${
                  index === current - 1
                    ? "w-6 h-2"
                    : "bg-gray-300 w-2 h-2 hover:bg-gray-400"
                }`}
                style={
                  index === current - 1
                    ? {
                        background:
                          "linear-gradient(90deg, #FF99BE 0%, #FFC2D9 25%, #FFD4E3 50%, #FFC2D9 75%, #FF99BE 100%)",
                      }
                    : undefined
                }
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnnouncementModal
        announcement={selectedAnnouncement}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
