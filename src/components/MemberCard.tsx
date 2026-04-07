import Image from "next/image";

interface Member {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  title: string;
  affiliation: string;
  image: string;
  email: string;
  website?: string;
  research: string[];
  bio: string;
}

export default function MemberCard({ member }: { member: Member }) {
  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="aspect-square relative bg-primary/5 overflow-hidden">
        <Image
          src={member.image}
          alt={member.nameEn}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-primary-dark">{member.nameEn}</h3>
        <p className="text-sm text-gray-500">{member.name}</p>
        <p className="text-sm text-accent mt-1 font-medium">{member.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{member.affiliation}</p>
        {member.website && (
          <a
            href={member.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline mt-1 inline-block"
          >
            Website &rarr;
          </a>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {member.research.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
