import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CharityService } from "@/server/services/charity-service";
import { CharitiesClient } from "./charities-client";

const DEFAULT_CHARITIES = [
  {
    id: "1",
    name: "First Tee Initiative",
    description: "Empowering youth through life skills, character education, and mentorship programs that build confidence.",
    image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop",
    website_url: "https://www.firsttee.org",
    is_featured: true,
    is_active: true,
  },
  {
    id: "2",
    name: "Global Aid Network",
    description: "Connecting athletes and supporters to fund urgent emergency relief, pediatric medical aid, and clean water access.",
    image_url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format&fit=crop",
    website_url: "https://www.golfforcause.org",
    is_featured: true,
    is_active: true,
  },
  {
    id: "3",
    name: "Green Habitat Trust",
    description: "Dedicated to environmental sustainability, water conservation, biodiversity corridors, and eco-friendly land stewardship.",
    image_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop",
    website_url: "https://www.greenfairways.org",
    is_featured: false,
    is_active: true,
  },
  {
    id: "4",
    name: "Youth Inclusion Alliance",
    description: "Providing equipment, coaching, and life opportunities to underprivileged young athletes striving to play.",
    image_url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop",
    website_url: "https://www.youthgolfalliance.org",
    is_featured: false,
    is_active: true,
  },
];

export const dynamic = 'force-dynamic';

export default async function CharitiesPage() {
  let charities = [];

  try {
    const data = await CharityService.list();
    if (data && data.length > 0) {
      charities = data;
    } else {
      charities = DEFAULT_CHARITIES;
    }
  } catch {
    charities = DEFAULT_CHARITIES;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3.5 py-1 rounded-full">
              Vetted Partner Directory
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-4 tracking-tight">
              Our Partner Causes
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Every month, a guaranteed portion of your membership goes directly to empowering these organizations. Select the cause you wish to champion.
            </p>
          </div>

          <CharitiesClient initialCharities={charities} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
