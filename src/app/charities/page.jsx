import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CharityService } from "@/server/services/charity-service";
import { CharitiesClient } from "./charities-client";

const DEFAULT_CHARITIES = [
  {
    id: "1",
    name: "First Tee",
    description: "Empowering youth through life skills, character education, and mentorship programs that build confidence on and off the golf course.",
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&auto=format&fit=crop&q=80",
    website_url: "https://firsttee.org",
    is_featured: true,
    is_active: true,
  },
  {
    id: "2",
    name: "Folds of Honor",
    description: "Providing life-changing educational scholarships to spouses and children of America’s fallen or disabled military and first responders through golf initiatives.",
    image_url: "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&auto=format&fit=crop&q=80",
    website_url: "https://foldsofhonor.org",
    is_featured: true,
    is_active: true,
  },
  {
    id: "3",
    name: "St. Jude Children’s Research Hospital",
    description: "Leading the way the world understands, treats, and defeats childhood cancer and other life-threatening pediatric diseases.",
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    website_url: "https://www.stjude.org",
    is_featured: true,
    is_active: true,
  },
  {
    id: "4",
    name: "Make-A-Wish Foundation",
    description: "Creating life-changing wishes for children with critical illnesses, bringing hope, strength, and joy to families worldwide.",
    image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80",
    website_url: "https://wish.org",
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
