import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Features</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/features/conduct" className="block">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full border-gray-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <UserCheck size={24} />
              </div>
              <span className="font-medium text-sm text-gray-700">คะแนนความประพฤติ</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
