import Image from "next/image";
import Link from "next/link";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  image: string;
  link: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-700",
  notices: "bg-amber-100 text-amber-700",
  newsletter: "bg-green-100 text-green-700",
  workshop: "bg-purple-100 text-purple-700",
};

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link href={item.link} className="group block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="aspect-video relative bg-primary/5 overflow-hidden">
          <Image
            src={`${basePath}${item.image}`}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                categoryColors[item.category] || "bg-gray-100 text-gray-600"
              }`}
            >
              {item.category}
            </span>
            <span className="text-xs text-gray-400">{item.date}</span>
          </div>
          <h3 className="font-bold text-gray-900 group-hover:text-accent transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
        </div>
      </div>
    </Link>
  );
}
