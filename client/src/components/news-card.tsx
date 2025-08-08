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
    <article className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={article.imageUrl || placeholderImage}
          alt={article.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />
        <div className="absolute top-3 right-3">
          <span className={`${sourceColor} text-white px-3 py-1 rounded-full text-xs font-medium`}>
            {sourceDisplayName}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
          {article.title}
        </h2>
        
        {article.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {article.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{timeAgo}</span>
          <button
            onClick={handleReadMore}
            className="text-thai-orange hover:text-thai-yellow font-medium flex items-center gap-1 transition-colors"
          >
            อ่านต่อ
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
}
