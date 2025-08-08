import { type RssSource } from "@shared/schema";

interface RssStatusProps {
  rssSources: RssSource[];
}

export default function RssStatus({ rssSources }: RssStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "ออนไลน์";
      case "error":
        return "ออฟไลน์";
      default:
        return "ไม่ทราบ";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (rssSources.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">สถานะ RSS Feeds</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rssSources.map((source) => (
          <div
            key={source.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(source.status || "offline")}`}
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${getStatusDotColor(source.status || "offline")}`}></div>
              <span className={`font-medium ${source.status === "online" ? "text-green-800" : source.status === "error" ? "text-red-800" : "text-gray-800"}`}>
                {source.name}
              </span>
            </div>
            <span className={`text-sm ${getStatusTextColor(source.status || "offline")}`}>
              {getStatusText(source.status || "offline")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
