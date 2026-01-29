"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import QRCode from "qrcode";
import { Sarabun } from "next/font/google";
import schoolConfig from "@/data/school-config.json";
import { useGetStudentsMe } from "@/lib/api/generated/default/default";

// Import Sarabun font
const sarabun = Sarabun({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  display: "swap",
});

export function StudentCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const { data: studentProfile, isLoading } = useGetStudentsMe();
  
  const response = studentProfile as Record<string, unknown>;
  const student = (
    response && typeof response === "object" && "data" in response
      ? (response as Record<string, unknown>).data
      : response
  ) as any;

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      if (student?.studentId) {
        try {
          const url = await QRCode.toDataURL(student.studentId, {
            width: 80,
            margin: 1,
            color: { dark: "#000000", light: "#FFFFFF" },
          });
          setQrCodeUrl(url);
        } catch (err) {
          console.error("Error generating QR code:", err);
          setQrCodeUrl("");
        }
      }
    };
    generateQR();
  }, [student?.studentId]);

  function handleFlip() {
    if (!isAnimating) {
      setIsFlipped(!isFlipped);
      setIsAnimating(true);
    }
  }

  // --- REAL-TIME DATE CALCULATION LOGIC ---
  const { issueDate, expiryDate } = useMemo(() => {
    if (!student?.class) {
      return { issueDate: "-", expiryDate: "-" };
    }

    const sClass = Number(student.class);
    const now = new Date();
    const currentYearAD = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 = Jan, 11 = Dec

    // In Thailand, the new academic year usually starts in May.
    // If we are in Jan, Feb, Mar, or April, we are effectively still in the PREVIOUS academic year.
    // Example: Jan 2026 is still part of the 2025 Academic Year.
    let academicYearAD = currentMonth < 4 ? currentYearAD - 1 : currentYearAD;
    let academicYearTh = academicYearAD + 543;

    // Determine how many years ago the card was issued based on class
    // Class 1 & 4: 0 years ago (Freshmen)
    // Class 2 & 5: 1 year ago
    // Class 3 & 6: 2 years ago
    let yearsAgo = 0;
    if (sClass === 2 || sClass === 5) yearsAgo = 1;
    if (sClass === 3 || sClass === 6) yearsAgo = 2;

    // Calculate Years
    const issueYearTh = academicYearTh - yearsAgo;
    const expiryYearTh = issueYearTh + 3;

    return {
      issueDate: `16 พ.ค. ${issueYearTh}`,
      expiryDate: `31 มี.ค. ${expiryYearTh}`,
    };
  }, [student?.class]);
  // ----------------------------------------

  // Inline styles for animation
  const animatedGradientStyle = {
    background:
      "linear-gradient(90deg, var(--brand-secondary) 0%, color-mix(in srgb, var(--brand-secondary), white 30%) 25%, color-mix(in srgb, var(--brand-secondary), white 50%) 50%, color-mix(in srgb, var(--brand-secondary), white 30%) 75%, var(--brand-secondary) 100%)",
    backgroundSize: "400% 100%",
    animation: "gradientMove 10s ease-in-out infinite",
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-[8.6/5.4] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading Card...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="w-full aspect-[8.6/5.4] rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
        <div className="text-gray-400 text-sm">No Student Data</div>
      </div>
    );
  }

  // Derived Data
  const prefix = student.prefix || "";
  const fullNameThai = `${prefix} ${student.nameTh} ${student.surnameTh}`;
  const fullNameEng = `${student.nameEn || ""} ${student.surnameEn || ""}`.trim() || "Student Name";
  const house = student.house || "บ้าน";
  
  // House Translations
  const houseMap: Record<string, string> = {
    "เขียวเสวย": "Green House",
    "พลอยแดง": "Red House",
    "พยับหมอก": "Blue House",
    "อินทนิล": "Violet House",
    "ชัยพฤกษ์": "Yellow House"
  };
  const houseEng = houseMap[house] || "House";

  const level = (student.class >= 1 && student.class <= 3) ? "ชั้นมัธยมฯ ต้น" 
    : (student.class >= 4 && student.class <= 6) ? "ชั้นมัธยมฯ ปลาย" 
    : "ชั้นมัธยมศึกษา";
    
  const levelEng = (student.class >= 1 && student.class <= 3) ? "Junior High School" 
    : (student.class >= 4 && student.class <= 6) ? "Senior High School" 
    : "High School";

  const imageUrl = student.imageUrl 
    ? student.imageUrl 
    : "https://media.discordapp.net/attachments/935908059291725905/1461060098121011393/2512742.jpg?ex=696dcb00&is=696c7980&hm=e191d5976194c4ed79b62afbf6d86216b7870423d9ef200e38417c13d9f48503&=&format=webp&width=1752&height=1752";

  return (
    <div className="">
      <div
        className={`w-full aspect-[8.6/5.4] cursor-pointer ${sarabun.className}`}
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
      >
        <motion.div
          className="w-86 h-54 relative"
          style={{ transformStyle: "preserve-3d" }}
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          {/* Front Face */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden flex flex-col"
            style={{ ...animatedGradientStyle, backfaceVisibility: "hidden" }}
          >
            {/* Watermark */}
            <div className="absolute bottom-[-60px] left-[-25px] opacity-5">
              <Image src={schoolConfig.images.cardLogo} alt="Watermark" width={200} height={200} className="object-contain" />
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 p-3 flex-shrink-0">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center p-2 shadow-lg flex-shrink-0">
                <Image src={schoolConfig.images.cardLogo} alt="Logo" width={32} height={32} className="object-contain" />
              </div>
              <div className="flex-1 pt-1 min-w-0">
                <h1 className="text-black font-bold text-base leading-tight">บัตรประจำตัวนักเรียน</h1>
                <p className="text-black text-sm font-medium">Student Identity Card</p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-3 pb-3 flex min-h-0">
              <div className="flex gap-3 w-full h-fit">
                {/* Left Info */}
                <div className="flex-1 flex flex-col justify-center space-y-2 min-w-0">
                  <div>
                    <p className="text-black font-bold text-[11px] leading-tight">รหัสประจำตัวนักเรียน: <span className="font-normal">{student.studentId}</span></p>
                    <p className="text-black/70 text-[9px] leading-none">Student ID</p>
                  </div>
                  <div>
                    <p className="text-black font-bold text-[11px] leading-tight">เลขประจำตัวปชช.: <span className="font-normal">{student.citizenId}</span></p>
                    <p className="text-black/70 text-[9px] leading-none">National ID</p>
                  </div>
                  <div>
                    <p className="text-black font-bold text-sm leading-tight">{fullNameThai}</p>
                    <p className="text-black/70 text-[9px] leading-none">{fullNameEng}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-black font-bold text-[11px] leading-tight">{house}</p>
                      <p className="text-black/70 text-[9px] leading-none">{houseEng}</p>
                    </div>
                    <div>
                      <p className="text-black font-bold text-[11px] leading-tight">{level}</p>
                      <p className="text-black/70 text-[9px] leading-none">{levelEng}</p>
                    </div>
                  </div>
                </div>

                {/* Right Photo & Dates */}
                <div className="flex flex-col justify-center items-end gap-1 flex-shrink-0">
                  <div className="w-20 h-24 bg-gray-100 rounded border-2 border-white overflow-hidden">
                    <Image src={imageUrl} alt="Student Photo" width={80} height={96} className="object-cover w-full h-full" />
                  </div>
                  <div className="text-right text-[10px] text-black/80 space-y-0.5 w-full">
                    <p className="font-bold leading-tight">วันออกบัตร: <span className="font-normal">{issueDate}</span></p>
                    <p className="font-bold leading-tight">วันหมดอายุ: <span className="font-normal">{expiryDate}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden"
            style={{ ...animatedGradientStyle, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="absolute bottom-[-60px] left-[-25px] opacity-5">
              <Image src={schoolConfig.images.cardLogo} alt="Watermark" width={200} height={200} className="object-contain" />
            </div>

            <div className="absolute top-4 left-4 max-w-[70%]">
              <h1 className="text-black font-bold text-lg leading-tight">{schoolConfig.name.th}</h1>
              <p className="text-black text-[11px] mb-1 leading-relaxed">{schoolConfig.address.th}</p>
              <h2 className="text-black font-bold text-sm leading-tight">{schoolConfig.name.en}</h2>
              <p className="text-black text-[11px]">{schoolConfig.address.en}</p>
            </div>

            <div className="absolute bottom-4 right-4">
              <div className="bg-white rounded-lg p-2">
                {qrCodeUrl ? (
                  <Image src={qrCodeUrl} alt="QR Code" width={60} height={60} className="rounded" />
                ) : (
                  <div className="w-[60px] h-[60px] bg-black rounded flex items-center justify-center">
                    <div className="w-12 h-12 bg-white flex items-center justify-center border-2 border-black border-dashed">
                      <span className="font-mono text-[8px] font-bold">QR</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-center text-[8px] text-black/70 mt-1">{student.studentId}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
