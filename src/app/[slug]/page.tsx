import { notFound } from "next/navigation";
import { plays, people } from "@/lib/content";
import { TheatreSite } from "@/components/sites/odinteatr/site";
const routes = ["plays", "we", "theatre", "faq", "contacts", "arenda", "krasnodar1", ...plays.map(p => p.slug), ...people.map(p => p.slug)];
export function generateStaticParams() { return routes.map(slug => ({ slug })); }
export const dynamicParams = false;
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!routes.includes(slug)) notFound();
  return <TheatreSite route={slug} />;
}
