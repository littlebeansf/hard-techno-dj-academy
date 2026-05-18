import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useHashLocation } from "wouter/use-hash-location";
import type { Progress } from "@shared/schema";

const modules = [
  { id: "intro", title: "What is Hard Techno?", genre: "hard-techno", desc: "History, origins, and the culture behind the genre.", chapter: 1 },
  { id: "genres", title: "Genre Map", genre: "acid-techno", desc: "Understand subgenre differences: Schranz, Acid, Industrial, Hardcore.", chapter: 1 },
  { id: "bpm", title: "BPM & Rhythm", genre: "schranz", desc: "Tempo theory, kick patterns, and the 4/4 grid.", chapter: 2 },
  { id: "mixing", title: "DJ Mixing Basics", genre: "hard-techno", desc: "Beatmatching, phrasing, and EQ techniques.", chapter: 2 },
  { id: "acid", title: "The Acid Sound", genre: "acid-techno", desc: "TB-303, resonance, and building hypnotic basslines.", chapter: 3 },
  { id: "composition", title: "Composing a Track", genre: "hard-techno", desc: "Structure, arrangement, and layering techniques.", chapter: 3 },
];

const stats = [
  { label: "BPM Range", value: "140–160", sub: "Hard Techno", color: "var(--color-primary)" },
  { label: "BPM Range", value: "150–170", sub: "Schranz", color: "var(--color-energy)" },
  { label: "BPM Range", value: "135–155", sub: "Acid Techno", color: "var(--color-acid)" },
  { label: "BPM Range", value: "160–220", sub: "Hardcore/Gabber", color: "var(--color-purple)" },
];

export function Dashboard() {
  const [, setLocation] = useHashLocation();
  const { data: progressData } = useQuery<Progress[]>({
    queryKey: ["/api/progress"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/progress"); return r.json(); },
  });

  const completedIds = new Set(progressData?.filter(p => p.completed).map(p => p.moduleId) || []);
  const completedCount = completedIds.size;
  const totalModules = modules.length;
  const progressPct = Math.round((completedCount / totalModules) * 100);

  return (
    <div className="p-8 max-w-6xl" style={{ minHeight: '100%' }}>
      {/* Hero */}
      <div className="mb-10 relative">
        <div className="mb-2">
          <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.2em' }}>
            Welcome to
          </span>
        </div>
        <h1 className="mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'white', lineHeight: 1.0, letterSpacing: '-0.02em' }}>
          HARD TECHNO<br />
          <span style={{ color: 'var(--color-primary)', textShadow: '0 0 30px rgba(0,245,255,0.4)' }}>DJ ACADEMY</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '520px', lineHeight: 1.7, fontSize: 'var(--text-sm)' }}>
          Master hard techno, acid, schranz, and hardcore — from genre theory to live mixing. Learn, practice, compose.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 rounded-lg p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Overall Progress</span>
          <span className="text-sm font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>{completedCount}/{totalModules} modules</span>
        </div>
        <div className="progress-track h-2 w-full">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{progressPct}% complete</div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="rounded-md p-3 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="text-xl font-bold mb-0.5 bpm-display" style={{ color: s.color, fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 1.5vw, 1.5rem)' }}>{s.value}</div>
            <div className="text-xs font-semibold" style={{ color: s.color, opacity: 0.8 }}>{s.sub}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Module Grid */}
      <div className="mb-4 flex items-center justify-between">
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'var(--text-lg)', letterSpacing: '-0.01em' }}>Learning Modules</h2>
        <button
          onClick={() => setLocation("/curriculum")}
          className="text-sm"
          style={{ color: 'var(--color-primary)' }}
        >
          View all →
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {modules.map((m) => {
          const done = completedIds.has(m.id);
          return (
            <button
              key={m.id}
              data-testid={`module-card-${m.id}`}
              onClick={() => setLocation(`/curriculum/${m.id}`)}
              className="module-card rounded-lg p-4 text-left w-full"
              style={{
                background: done ? 'rgba(0,245,255,0.05)' : 'var(--color-surface)',
                border: `1px solid ${done ? 'rgba(0,245,255,0.25)' : 'var(--color-border)'}`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`genre-${m.genre} text-xs px-2 py-0.5 rounded border font-semibold`} style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                  Ch.{m.chapter}
                </span>
                {done && <span className="text-xs" style={{ color: 'var(--color-primary)' }}>✓</span>}
              </div>
              <h3 className="font-semibold text-sm mb-1.5 text-left" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{m.title}</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{m.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setLocation("/dj-deck")}
          className="rounded-lg p-5 text-left"
          style={{ background: 'var(--color-primary-dim)', border: '1px solid rgba(0,245,255,0.2)' }}
          data-testid="quick-action-dj-deck"
        >
          <div className="text-2xl mb-2">🎛</div>
          <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Open DJ Deck</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Practice mixing with dual decks and crossfader</div>
        </button>
        <button
          onClick={() => setLocation("/beat-studio")}
          className="rounded-lg p-5 text-left"
          style={{ background: 'var(--color-energy-dim)', border: '1px solid rgba(255,0,64,0.2)' }}
          data-testid="quick-action-beat-studio"
        >
          <div className="text-2xl mb-2">🥁</div>
          <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-energy)', fontFamily: 'var(--font-display)' }}>Beat Studio</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Compose kick patterns and acid basslines</div>
        </button>
      </div>
    </div>
  );
}
