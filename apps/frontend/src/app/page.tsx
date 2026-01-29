'use client';

import Image from "next/image";
import schoolConfig from "@/data/school-config.json";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <Image
          src={schoolConfig.images.logo}
          alt={`${schoolConfig.name.en} Logo`}
          width={24}
          height={15}
          priority
          className="w-auto h-24 md:h-40 object-contain drop-shadow-sm"
        />
      </div>

      <div className="w-full max-w-sm p-4 rounded-xl">
        <LoginForm />
      </div>
    </div>
  );
}
