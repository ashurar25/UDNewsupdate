import { type NewsArticle } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { ExternalLink } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
  sourceDisplayName: string;
  sourceColor: string;
}

export default function NewsCard({ article, sourceDisplayName, sourceColor }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: th,
  });

  const handleReadMore = () => {
    window.open(article.link, '_blank', 'noopener,noreferrer');
  };

  const placeholderImage = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";

  return (
    <article className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105 hover:-translate-y-1">
      <div className="relative group">
        <img
          src={article.imageUrl || placeholderImage}
          alt={article.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
        <div className="absolute top-3 right-3">
          <span className={`${sourceColor} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm`}>
            {sourceDisplayName}
          </span>
        </div>
      </div>
      
      <div className="p-6 bg-gradient-to-b from-white to-gray-50">
        <h2 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 hover:text-thai-orange transition-colors cursor-pointer">
          {article.title}
        </h2>
        
        {article.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {article.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <span className="bg-gray-100 px-2 py-1 rounded-full">{timeAgo}</span>
          <button
            onClick={handleReadMore}
            className="text-thai-orange hover:text-white hover:bg-thai-orange font-medium flex items-center gap-1 transition-all duration-200 px-3 py-1 rounded-full border border-thai-orange"
          >
            อ่านต่อ
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
}
