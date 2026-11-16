import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  ChevronRight,
  Code2,
  Hammer,
  HeartHandshake,
  House,
  Paintbrush,
  Search,
  Scissors,
  Sparkles,
  Wrench
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SectionHeading } from "@/components/ui/section-heading";
import { LocationChips } from "@/features/marketplace/components/location-chips";
import { ActiveProvidersRow } from "@/features/marketplace/components/active-providers-row";
import { TrustStrip } from "@/features/marketplace/components/trust-strip";

const categories = [
  { name: "Home services", detail: "Repairs, cleaning & maintenance", icon: House, tone: "mint" },
  { name: "Creative & media", detail: "Photography, design & video", icon: Camera, tone: "lime" },
  { name: "Business & tech", detail: "Web, digital & professional services", icon: Code2, tone: "peach" },
  { name: "Beauty & lifestyle", detail: "Personal care & styling", icon: Scissors, tone: "lavender" },
  { name: "Events & experiences", detail: "Make every occasion count", icon: Sparkles, tone: "sky" },
  { name: "Building & trades", detail: "Skilled hands for every project", icon: Hammer, tone: "sand" }
];

const steps = [
  { number: "01", title: "Find your service", text: "Search by what you need and where you are. Browse real provider profiles and published services." },
  { number: "02", title: "Compare with confidence", text: "Check areas served, ratings from completed jobs, and verification badges only when they are real." },
  { number: "03", title: "Connect and arrange", text: "Enquire or request a booking, message the provider, and agree payment directly with them." }
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="availability-pill"><span /> A better way to find local services</div>
              <h1>The right people.<br /><em>For the right</em> service.</h1>
              <p className="hero-description">
                Discover skilled professionals and trusted businesses across Nigeria.
                Compare profiles, request work, and connect directly — without the platform holding your money.
              </p>
              <TrustStrip />
              <form className="search-panel" action="/services" method="GET">
                <label className="search-field">
                  <Search size={19} />
                  <input name="q" placeholder="What service do you need?" aria-label="What service do you need?" />
                </label>
                <span className="search-divider" />
                <label className="location-field">
                  <House size={18} />
                  <input name="city" placeholder="City or area" aria-label="City or area" />
                </label>
                <button className="button button-primary search-button" type="submit">
                  Search <ArrowUpRight size={17} />
                </button>
              </form>
              <div className="hero-location-chips">
                <p className="chips-label">Popular areas</p>
                <LocationChips />
              </div>
              <div className="hero-proof">
                <p><strong>Rooted in Nigeria.</strong><br />Search by service and neighbourhood. Verification and ratings only when they are real. Pay providers directly.</p>
              </div>
            </div>
            <div className="hero-art" aria-label="Illustration representing people connecting through services">
              <div className="art-backdrop" />
              <div className="art-card art-card-top">
                <span className="art-icon"><BriefcaseBusiness size={20} /></span>
                <span><strong>Great work, nearby</strong><small>Discover people with the skills you need</small></span>
                <BadgeCheck className="art-check" size={20} />
              </div>
              <div className="connection-graphic">
                <div className="connection-ring ring-one" />
                <div className="connection-ring ring-two" />
                <div className="connection-core"><HeartHandshake size={64} strokeWidth={1.4} /></div>
                <span className="node node-one"><Paintbrush size={20} /></span>
                <span className="node node-two"><Wrench size={20} /></span>
                <span className="node node-three"><Camera size={20} /></span>
                <span className="node node-four"><Code2 size={20} /></span>
                <span className="sparkle sparkle-one">✳</span>
                <span className="sparkle sparkle-two">✦</span>
              </div>
              <div className="art-card art-card-bottom">
                <div className="mini-avatar">D</div>
                <span><strong>People. Services. Connections.</strong><small>One place to make it happen.</small></span>
                <span className="online-dot" />
              </div>
              <div className="art-sticker">Local talent<br /><b>Big possibilities.</b></div>
            </div>
          </div>
          <div className="container hero-bottom-line"><span>BUILT AROUND PEOPLE</span><span>MADE FOR EVERYDAY NEEDS</span><span>ROOTED IN NIGERIA</span></div>
        </section>

        <section className="categories-section" id="categories">
          <div className="container">
            <SectionHeading
              eyebrow="EXPLORE THE MARKETPLACE"
              title="Whatever you need, start here."
              description="From everyday essentials to specialist skills, find the people who can get the job done."
            />
            <div className="category-grid">
              {categories.map(({ name, detail, icon: Icon, tone }) => (
                <Link href={`/services?category=${encodeURIComponent(name)}`} className="category-card" key={name}>
                  <span className={`category-icon ${tone}`}><Icon size={24} strokeWidth={1.8} /></span>
                  <span className="category-name">{name}</span>
                  <span className="category-detail">{detail}</span>
                  <span className="category-arrow"><ArrowUpRight size={18} /></span>
                </Link>
              ))}
            </div>
            <div className="center-action"><Link className="button button-outline" href="/services">Explore all services <ArrowRight size={17} /></Link></div>
          </div>
        </section>

        <ActiveProvidersRow />

        <section className="how-section" id="how-it-works">
          <div className="container how-grid">
            <div className="how-intro">
              <p className="eyebrow">SIMPLE BY DESIGN</p>
              <h2>Good connections<br /><em>make things happen.</em></h2>
              <p>Finding the right person should feel straightforward. Dúnarà brings discovery and connection into one clear experience.</p>
              <Link className="text-link arrow-link" href="/services">Start exploring <ArrowUpRight size={17} /></Link>
            </div>
            <div className="steps-list">
              {steps.map((step) => (
                <div className="step-row" key={step.number}>
                  <span className="step-number">{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.text}</p></div>
                  <ChevronRight className="step-chevron" size={20} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="provider-section" id="providers">
          <div className="container provider-banner">
            <div className="provider-copy">
              <span className="provider-kicker"><Sparkles size={15} /> FOR SKILLED PROFESSIONALS</span>
              <h2>Your skill deserves<br />to be <em>discovered.</em></h2>
              <p>Put your services in front of people looking for what you do. Build your profile, show your work and grow through better connections.</p>
              <Link href="/join" className="button button-light">Become a provider <ArrowUpRight size={17} /></Link>
            </div>
            <div className="provider-visual">
              <div className="provider-visual-circle circle-a" />
              <div className="provider-visual-circle circle-b" />
              <div className="provider-symbol"><HeartHandshake size={94} strokeWidth={1.1} /></div>
              <div className="floating-label label-a"><BadgeCheck size={16} /> Show your work</div>
              <div className="floating-label label-b"><ArrowUpRight size={16} /> Grow your reach</div>
            </div>
          </div>
        </section>

        <section className="closing-section">
          <div className="container closing-inner">
            <div><p className="eyebrow">LET’S GET CONNECTED</p><h2>What can we help<br /><em>you find today?</em></h2></div>
            <Link href="/services" className="button button-primary">Find a service <ArrowUpRight size={18} /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
