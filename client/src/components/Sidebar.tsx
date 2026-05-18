import { useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

const Logo = () => (
  <svg aria-label="Hard Techno DJ Academy" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 flex-shrink-0">
    <rect width="40" height="40" rx="6" fill="#00f5ff" fillOpacity="0.1"/>
    <rect x="1" y="1" width="38" height="38" rx="5" stroke="#00f5ff" strokeWidth="1" strokeOpacity="0.4"/>
    {/* Waveform mark */}
    <rect x="6" y="20" width="3" height="10" rx="1" fill="#00f5ff"/>
    <rect x="11" y="14" width="3" height="16" rx="1" fill="#00f5ff" fillOpacity="0.8"/>
    <rect x="16" y="10" width="3" height="20" rx="1" fill="#00f5ff"/>
    <rect x="21" y="16" width="3" height="14" rx="1" fill="#00f5ff" fillOpacity="0.8"/>
    <rect x="26" y="12" width="3" height="18" rx="1" fill="#ff0040"/>
    <rect x="31" y="18" width="3" height="12" rx="1" fill="#ff0040" fillOpacity="0.8"/>
  </svg>
);

const navItems = [
  { path: "/", icon: HomeIcon, label: "Dashboard" },
  { path: "/curriculum", icon: BookIcon, label: "Curriculum" },
  { path: "/genre-guide", icon: MusicIcon, label: "Genre Guide" },
  { path: "/dj-deck", icon: DeckIcon, label: "DJ Deck" },
  { path: "/beat-studio", icon: StudioIcon, label: "Beat Studio" },
];

function HomeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function BookIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
}
function MusicIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
}
function DeckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/></svg>;
}
function StudioIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 21V9"/><path d="M12 21V6"/><path d="M16 21V12"/></svg>;
}

export function Sidebar() {
  const [location, setLocation] = useHashLocation();

  return (
    <aside
      style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', width: '220px', flexShrink: 0 }}
      className="flex flex-col h-full"
    >
      {/* Brand */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <div className="font-display text-white text-sm font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              HTDJ<span style={{ color: 'var(--color-primary)' }}>.</span>ACADEMY
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Hard Techno School</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-3 pt-2 pb-1">
          <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-display)' }}>Navigation</span>
        </div>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path || (path !== "/" && location.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className="sidebar-link w-full"
              data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              style={isActive ? {
                color: 'var(--color-primary)',
                background: 'var(--color-primary-dim)',
                borderColor: 'rgba(0, 245, 255, 0.2)',
              } : {}}
            >
              <Icon />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* BPM Status */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="rounded-md p-3" style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Status</span>
            <span className="text-xs" style={{ color: 'var(--color-primary)' }}>● LIVE</span>
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Hard Techno: 140–160 BPM
          </div>
        </div>
      </div>
    </aside>
  );
}
