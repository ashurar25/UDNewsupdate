import { Button } from "@/components/ui/button";
import { X, RefreshCw, Settings } from "lucide-react";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSource: string;
  onSourceFilter: (source: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function HamburgerMenu({
  isOpen,
  onClose,
  selectedSource,
  onSourceFilter,
  onRefresh,
  isRefreshing,
}: HamburgerMenuProps) {
  if (!isOpen) return null;

  const sources = [
    { id: "", name: "ข่าวทั้งหมด" },
    { id: "matichon", name: "ข่าว Matichon" },
    { id: "tnn", name: "ข่าว TNN" },
    { id: "honekrasae", name: "ข่าว Honekrasae" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
      <div className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">เมนูหลัก</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-thai-orange transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-4">
            {sources.map((source) => (
              <Button
                key={source.id}
                onClick={() => onSourceFilter(source.id)}
                variant={selectedSource === source.id ? "default" : "outline"}
                className={`w-full justify-start text-left ${
                  selectedSource === source.id
                    ? "bg-thai-yellow hover:bg-thai-yellow/90 text-gray-800 border-thai-yellow"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {source.name}
              </Button>
            ))}

            <hr className="my-6 border-gray-200" />

            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "กำลังรีเฟรช..." : "รีเฟรชข่าว"}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-5 h-5 mr-2" />
              ตั้งค่า
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
