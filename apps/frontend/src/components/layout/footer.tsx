import Link from "next/link";
import Image from "next/image";
import {
  FaFacebook,
  FaGlobe,
} from "react-icons/fa6";
import schoolConfig from "@/data/school-config.json";

export const Footer = () => {
  return (
    <footer className="text-black mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="gap-8 justify-center text-center">
          {/* School Info */}
          <div className=" md:col-span-2 flex flex-col items-center">
            <Image
              src={schoolConfig.images.logo}
              alt={`${schoolConfig.name.en} Logo`}
              width={200}
              height={100}
              priority
            />
            <p className="text-gray-600 mb-4 mt-4 leading-relaxed text-center">
              {schoolConfig.description.th}
            </p>
            <div className="flex space-x-4 justify-center">
              <Link
                href={schoolConfig.links.facebook}
                className="text-blue-400 hover:text-blue-600 transition-colors"
              >
                <FaFacebook size={24} />
              </Link>
              <Link
                href={schoolConfig.links.website}
                className="text-pink-400 hover:text-pink-600 transition-colors"
              >
                <FaGlobe size={24} />
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} {schoolConfig.name.th}.</p>
          <p>All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
