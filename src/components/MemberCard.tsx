import Image from "next/image";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
  const Wrapper = member.website
    ? ({ children }: { children: React.ReactNode }) => (
        <a href={member.website} target="_blank" rel="noopener noreferrer" className="block">
          {children}
        </a>
      )
    : ({ children }: { children: React.ReactNode }) => <>{children}</>;

  return (
    <Wrapper>
      <div className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${member.website ? "cursor-pointer" : ""}`}>
        <div className="aspect-square relative bg-primary/5 overflow-hidden">
          <Image
            src={`${basePath}${member.image}`}
            alt={member.nameEn}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-5">
          <h3 className="font-bold text-lg text-primary-dark group-hover:text-accent transition-colors">
            {member.nameEn}{member.name ? ` (${member.name})` : ""}
          </h3>
          <p className="text-sm text-accent mt-1 font-medium">{member.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{member.affiliation}</p>
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
    </Wrapper>
  );
}
