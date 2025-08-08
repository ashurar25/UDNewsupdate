import { type RssSource } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface StatusBarProps {
  rssSources: RssSource[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function StatusBar({ rssSources, onRefresh, isRefreshing }: StatusBarProps) {
  const getLastUpdate = () => {
    const activeSources = rssSources.filter(source => source.isActive);
    if (activeSources.length === 0) return null;
    
    const lastFetched = activeSources
      .map(source => source.lastFetched)
      .filter(Boolean)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];
    
    if (!lastFetched) return null;
    
    return formatDistanceToNow(new Date(lastFetched), {
      addSuffix: true,
      locale: th,
    });
  };

  const lastUpdate = getLastUpdate();
  const activeSourcesCount = rssSources.filter(source => source.isActive).length;
  const onlineSourcesCount = rssSources.filter(source => source.status === "online").length;

  return (
    <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium">
            {lastUpdate ? `อัพเดทล่าสุด: ${lastUpdate}` : "กำลังโหลดข่าว..."}
          </span>
        </div>
        <span className="text-gray-500 text-sm">
          • RSS ออนไลน์: {onlineSourcesCount}/{activeSourcesCount} แหล่ง
        </span>
      </div>
      
      <Button
        onClick={onRefresh}
        disabled={isRefreshing}
        variant="ghost"
        size="sm"
        className="text-thai-orange hover:text-thai-yellow hover:bg-thai-orange/10 transition-colors text-sm font-medium"
      >
        {isRefreshing ? (
          <>
            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            กำลังรีเฟรช...
          </>
        ) : (
          "รีเฟรชตอนนี้"
        )}
      </Button>
    </div>
  );
}
