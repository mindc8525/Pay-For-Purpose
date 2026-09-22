import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CharityService } from "@/server/services/charity-service";
import { SubscriptionService } from "@/server/services/subscription-service";
import { getAuthUser } from "@/lib/supabase/server";
import { CharityActionButton } from "@/features/charities/charity-action-button";

// Fallback data if database is empty or not seeded
const FALLBACK_CHARITIES = {
  "1": {
    id: "1",
    name: "First Tee",
    description:
      "Empowering youth through life skills, character education, and mentorship programs that build confidence on and off the golf course.",
    image_url:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&auto=format&fit=crop&q=80",
    website_url: "https://firsttee.org",
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e1",
        charity_id: "1",
        title: "Annual Youth Mentorship Day 2026",
        description: "Join junior golfers and community mentors for an inspiring charity invitational.",
        event_date: "2026-06-15",
        event_type: "golf_day",
        created_at: new Date().toISOString(),
      },
      {
        id: "e2",
        charity_id: "1",
        title: "Life Skills & Mentorship Clinic",
        description: "An inspiring workshop introducing underprivileged kids to leadership fundamentals.",
        event_date: "2026-08-20",
        event_type: "workshop",
        created_at: new Date().toISOString(),
      },
    ],
  },
  "2": {
    id: "2",
    name: "Folds of Honor",
    description:
      "Providing life-changing educational scholarships to spouses and children of America’s fallen or disabled military and first responders through golf initiatives.",
    image_url:
      "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&auto=format&fit=crop&q=80",
    website_url: "https://foldsofhonor.org",
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e3",
        charity_id: "2",
        title: "Patriot Golf Day Invitational",
        description: "A premier charity tournament raising academic scholarships for families of fallen heroes.",
        event_date: "2026-05-25",
        event_type: "golf_day",
        created_at: new Date().toISOString(),
      },
    ],
  },
  "3": {
    id: "3",
    name: "St. Jude Children’s Research Hospital",
    description:
      "Leading the way the world understands, treats, and defeats childhood cancer and other life-threatening pediatric diseases.",
    image_url:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
    website_url: "https://www.stjude.org",
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e4",
        charity_id: "3",
        title: "St. Jude Charity Pro-Am Classic",
        description: "Annual scramble raising critical funding for pediatric cancer research and patient families.",
        event_date: "2026-07-18",
        event_type: "golf_day",
        created_at: new Date().toISOString(),
      },
    ],
  },
  "4": {
    id: "4",
    name: "Make-A-Wish Foundation",
    description:
      "Creating life-changing wishes for children with critical illnesses, bringing hope, strength, and joy to families worldwide.",
    image_url:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80",
    website_url: "https://wish.org",
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    charity_events: [
      {
        id: "e5",
        charity_id: "4",
        title: "Wishes on the Fairway Scramble",
        description: "Community golf day granting wishes for children with life-threatening illnesses.",
        event_date: "2026-09-10",
        event_type: "golf_day",
        created_at: new Date().toISOString(),
      },
    ],
  },
};

FALLBACK_CHARITIES["4279b35e-c635-4ee0-9946-7b051ff32278"] = FALLBACK_CHARITIES["1"];
FALLBACK_CHARITIES["fc3c6044-b1fe-4c1c-9070-fc4e1d7b7e9d"] = FALLBACK_CHARITIES["2"];
FALLBACK_CHARITIES["7076a5df-e700-4f75-83dc-176f8e207621"] = FALLBACK_CHARITIES["3"];
FALLBACK_CHARITIES["3a7f396c-5222-409f-9239-e26def6b910a"] = FALLBACK_CHARITIES["4"];

export const dynamic = 'force-dynamic';

export default async function CharityDetailPage({ params }) {
  const { id } = await params;

  let charity = null;
  let user = null;
  let userPreference = null;
  let hasActiveSubscription = false;

  try {
    charity = await CharityService.getById(id);
  } catch {
    // If Supabase query fails or offline, fallback to mock data
  }

  try {
    user = await getAuthUser();
    if (user) {
      const [pref, sub] = await Promise.all([
        CharityService.getUserPreference(user.id).catch(() => null),
        SubscriptionService.getUserSubscription(user.id).catch(() => null),
      ]);
      userPreference = pref;
      hasActiveSubscription = sub?.status === 'active';
    }
  } catch {
    // ignore
  }

  if (!charity) {
    charity = FALLBACK_CHARITIES[id] || null;
  }

  if (!charity) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Charity Not Found</h1>
          <p className="text-gray-600 mb-6">
            The charity you are looking for does not exist or has been deactivated.
          </p>
          <Link href="/charities">
            <Button variant="outline">← Back to Charity Directory</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/charities"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            ← Back to Partner Causes
          </Link>

          {/* Hero Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
              {charity.image_url ? (
                <img
                  src={charity.image_url}
                  alt={charity.name}
                  className="w-full h-full object-cover opacity-85"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex items-end p-6 sm:p-10">
                <div className="text-white space-y-2">
                  {charity.is_featured && (
                    <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs">
                      Featured Partner
                    </span>
                  )}
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{charity.name}</h1>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-8">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">About the Organization</h2>
                  <p className="text-sm text-slate-500">Verified Non-Profit Partner</p>
                </div>
                <div className="flex gap-3">
                  {charity.website_url && (
                    <a
                      href={charity.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-slate-700"
                    >
                      Official Website ↗
                    </a>
                  )}
                  <CharityActionButton
                    charityId={charity.id}
                    charityName={charity.name}
                    isAuthenticated={!!user}
                    hasActiveSubscription={hasActiveSubscription}
                    isCurrentCause={userPreference?.charity_id === charity.id}
                    currentPercentage={userPreference?.contribution_percentage || 10}
                    variant="primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="prose max-w-none text-slate-700 text-base md:text-lg leading-relaxed">
                {charity.description}
              </div>

              {/* Giving Impact Info */}
              <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-emerald-950">
                    How Your Membership Directly Empowers {charity.name}
                  </h3>
                  <p className="text-sm text-emerald-900/80 leading-relaxed">
                    When you select this cause, at least 10% (up to 100%) of your recurring subscription fee is remitted directly to fund their frontline community operations.
                  </p>
                </div>
                <CharityActionButton
                  charityId={charity.id}
                  charityName={charity.name}
                  isAuthenticated={!!user}
                  hasActiveSubscription={hasActiveSubscription}
                  isCurrentCause={userPreference?.charity_id === charity.id}
                  currentPercentage={userPreference?.contribution_percentage || 10}
                  variant="banner"
                />
              </div>

              {/* Upcoming Events Section */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Upcoming Charity Events & Golf Days
                </h3>
                {charity.charity_events && charity.charity_events.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {charity.charity_events.map((evt) => (
                      <Card key={evt.id} className="border border-gray-200/80 hover:shadow-md transition-shadow">
                        <CardContent className="p-5 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 capitalize">
                              {evt.event_type.replace("_", " ")}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {new Date(evt.event_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-base">{evt.title}</h4>
                          <p className="text-sm text-gray-600">{evt.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
                    No upcoming events listed at this time. Check back soon!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
