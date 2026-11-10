import type { Metadata } from "next";
import { ListingDetail } from "@/components/listing-detail";
import { getListingBySlug } from "@/lib/listings";
import { huf } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

/**
 * Built on the first visit, then served ready-made from Vercel's edge instead of rendered on
 * every request — and as a ready page, links to it can be prefetched in full, so tapping a
 * listing opens it at once. Every admin save calls revalidatePath("/", "layout"), which
 * clears these, so edits still show immediately; the hour is only a backstop.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = await getListingBySlug(slug);
  if (!l) return { title: "Nem található" };
  return {
    title: l.title,
    description: l.description?.slice(0, 160) || `${l.title} — ${huf(l.priceHuf)}`,
    openGraph: {
      title: l.title,
      description: l.description?.slice(0, 160),
      images: l.images.slice(0, 1).map((i) => i.url),
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ListingDetail slug={slug} kind="wheel" />;
}
