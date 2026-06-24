"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface SubCategoryNavProps {
  items: string[];
  current: string;
  catSlug: string;
  couleur: string;
}

export default function SubCategoryNav({
  items,
  current,
  catSlug,
  couleur,
}: SubCategoryNavProps) {
  const searchParams = useSearchParams();

  const buildHref = (item: string) => {
    if (item === "Tout") return `/${catSlug}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sous", item);
    return `/${catSlug}?${params.toString()}`;
  };

  return (
    <div className="border-b border-[#E0E0E0] bg-white sticky top-[56px] md:top-[65px] z-30">
      <div className="container-site">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-3">
          {items.map((item) => {
            const isActive = item === current;
            return (
              <Link
                key={item}
                href={buildHref(item)}
                replace
                className={`flex-shrink-0 px-5 py-2 text-[12px] font-bold tracking-wider uppercase whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? "bg-black text-white"
                    : "text-[#424242] hover:text-black"
                }`}
                style={isActive ? {} : {}}
              >
                {item}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
