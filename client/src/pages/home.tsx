import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type NewsArticle, type RssSource } from "@shared/schema";
import NewsCard from "@/components/news-card";
import HamburgerMenu from "@/components/hamburger-menu";
import WeatherCard from "@/components/weather-card";
import { Button } from "@/components/ui/button";
import { Menu, RefreshCw, X, EyeOff, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pageSize = 12;
  const offset = (currentPage - 1) * pageSize;

  // Fetch news articles
  const { data: articles = [], isLoading: articlesLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news", { limit: pageSize, offset, category: selectedCategory }],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch RSS sources
  const { data: rssSources = [] } = useQuery<RssSource[]>({
    queryKey: ["/api/rss-sources"],
    refetchInterval: 60 * 1000, // Refetch every minute
  });



  // Refresh feeds mutation
  const refreshFeedsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/refresh-feeds");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rss-sources"] });

      const successCount = data.results.filter((r: any) => r.status === "success").length;
      const errorCount = data.results.filter((r: any) => r.status === "error").length;

      toast({
        title: "อัพเดทข่าวสำเร็จ",
        description: `อัพเดทสำเร็จ ${successCount} แหล่ง${errorCount > 0 ? `, ล้มเหลว ${errorCount} แหล่ง` : ""}`,
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดทข่าวได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    },
  });

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setIsMenuOpen(false);
  };

  const handleSearch = () => {
    setIsSearchOpen(true);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleRefresh = () => {
    refreshFeedsMutation.mutate();
  };

  const getSourceDisplayName = (source: string) => {
    switch (source.toLowerCase()) {
      case "matichon": return "Matichon";
      case "tnn": return "TNN";
      case "honekrasae": return "Honekrasae";
      default: return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case "matichon": return "bg-blue-600";
      case "tnn": return "bg-green-600";
      case "honekrasae": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-thai-orange via-orange-500 to-thai-orange shadow-xl relative z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMenuVisible && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-thai-yellow transition-colors duration-200"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={() => setIsMenuVisible(!isMenuVisible)}
              className="text-white hover:text-thai-yellow transition-colors duration-200"
              title={isMenuVisible ? "ซ่อนเมนู" : "แสดงเมนู"}
            >
              {isMenuVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <h1 className="text-white text-xl lg:text-2xl font-bold text-center flex-1">
            อัพเดทข่าวอุดร - UD News Update
          </h1>

          <div className="w-16" /> {/* Spacer for balance */}
        </div>
      </header>


      {/* Hamburger Menu */}
      {isMenuVisible && (
        <HamburgerMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          selectedCategory={selectedCategory}
          onCategoryFilter={handleCategoryFilter}
          onRefresh={handleRefresh}
          isRefreshing={refreshFeedsMutation.isPending}
          onSearch={handleSearch}
        />
      )}

      {/* Search Modal - placeholder for future implementation */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">ค้นหาข่าว</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-center py-8">
              ฟีเจอร์ค้นหาข่าวจะเพิ่มเข้ามาในอนาคต
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
            <span className="text-thai-orange mr-2">📰</span>
            ข่าวล่าสุด
          </h2>

          {/* Loading State */}
          {articlesLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* News Grid - Multiple Columns */}
          {!articlesLoading && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  sourceDisplayName={getSourceDisplayName(article.source)}
                  sourceColor={getSourceColor(article.source)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!articlesLoading && articles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {selectedCategory ? `ไม่พบข่าวในหมวด ${selectedCategory}` : "ไม่พบข่าวในขณะนี้"}
              </div>
              <Button
                onClick={handleRefresh}
                disabled={refreshFeedsMutation.isPending}
                className="bg-gradient-to-r from-thai-yellow to-yellow-400 hover:from-thai-yellow/90 hover:to-yellow-400/90 text-gray-800 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {refreshFeedsMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    กำลังอัพเดท...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    รีเฟรชข่าว
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Load More Button */}
          {!articlesLoading && articles.length >= pageSize && (
            <div className="text-center mb-12">
              <Button
                onClick={handleLoadMore}
                className="bg-gradient-to-r from-thai-yellow to-yellow-400 hover:from-thai-yellow/90 hover:to-yellow-400/90 text-gray-800 font-medium px-8 py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                โหลดข่าวเพิ่มเติม
              </Button>
            </div>
          )}

          {/* Weather Card Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
              <span className="text-blue-500 mr-2">🌤️</span>
              สภาพอากาศ
            </h2>
            <WeatherCard />
          </section>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-2">อัพเดทข่าวอุดร - UD News Update</h3>
          <p className="text-gray-400 text-sm mb-4">ข่าวสารครบวงจรจากแหล่งข้อมูลที่เชื่อถือได้</p>
          <div className="flex justify-center space-x-4 text-sm text-gray-400">
            <span>© 2024 UD News Update</span>
            <span>•</span>
            <span>ข้อมูลจาก RSS Feeds</span>
            <span>•</span>
            <span>อัพเดทแบบเรียลไทม์</span>
          </div>
        </div>
      </footer>
    </div>
  );
}