import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useHashLocation } from "wouter/use-hash-location";
import type { Progress } from "@shared/schema";

const curriculum = [
  {
    chapter: 1,
    title: "Foundation: The World of Hard Techno",
    color: "var(--color-primary)",
    modules: [
      {
        id: "intro",
        title: "What is Hard Techno?",
        duration: "15 min",
        type: "lesson",
        desc: "History, culture, underground roots, and why hard techno is having a global resurgence.",
        topics: ["Origins in Berlin & Detroit", "The underground scene", "Modern revival (2018–present)", "Key festivals & clubs"],
      },
      {
        id: "genres",
        title: "Genre Map",
        duration: "20 min",
        type: "lesson + quiz",
        desc: "Deep dive into Hard Techno, Acid Techno, Schranz, Hardcore, and Industrial Techno.",
        topics: ["Subgenre differences", "BPM ranges", "Sound signatures", "Genre quiz"],
      },
    ],
  },
  {
    chapter: 2,
    title: "Rhythm & Technique",
    color: "var(--color-energy)",
    modules: [
      {
        id: "bpm",
        title: "BPM & Rhythm Theory",
        duration: "25 min",
        type: "lesson + interactive",
        desc: "Understand tempo, the 4/4 grid, kick drum patterns, and how rhythm drives a crowd.",
        topics: ["4/4 time signature", "Kick patterns (straight vs swing)", "Hi-hat programming", "Using the beat sequencer"],
      },
      {
        id: "mixing",
        title: "DJ Mixing Fundamentals",
        duration: "30 min",
        type: "lesson + practice",
        desc: "Beatmatching, harmonic mixing, EQ techniques, and working with transitions.",
        topics: ["Beatmatching theory", "Phrasing & counting bars", "EQ kill switches", "Transition techniques"],
      },
    ],
  },
  {
    chapter: 3,
    title: "Sound Design & Composition",
    color: "var(--color-acid)",
    modules: [
      {
        id: "acid",
        title: "The Acid Sound (TB-303)",
        duration: "25 min",
        type: "lesson + synth",
        desc: "Master the TB-303's resonance filter and create hypnotic acid basslines.",
        topics: ["TB-303 history", "Resonance & cutoff", "Accent & slide programming", "Creating acid patterns"],
      },
      {
        id: "composition",
        title: "Composing a Track",
        duration: "40 min",
        type: "lesson + studio",
        desc: "Learn song structure, layering techniques, and build your first hard techno pattern.",
        topics: ["Intro-Build-Drop-Outro structure", "Layering kicks & basslines", "Using tension & release", "Export & mix preparation"],
      },
    ],
  },
];

const typeColors: Record<string, string> = {
  "lesson": "var(--color-text-muted)",
  "lesson + quiz": "var(--color-acid)",
  "lesson + interactive": "var(--color-primary)",
  "lesson + practice": "var(--color-energy)",
  "lesson + synth": "var(--color-purple)",
  "lesson + studio": "var(--color-energy)",
};

export function Curriculum() {
  const [, setLocation] = useHashLocation();
  const { data: progressData } = useQuery<Progress[]>({
    queryKey: ["/api/progress"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/progress"); return r.json(); },
  });

  const completedIds = new Set(progressData?.filter(p => p.completed).map(p => p.moduleId) || []);
  const totalModules = curriculum.flatMap(c => c.modules).length;
  const completedCount = completedIds.size;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="mb-2" style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'var(--text-xl)', letterSpacing: '-0.02em' }}>
          Curriculum
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          A progressive course from genre theory to DJ performance and track composition.
        </p>
        <div className="flex items-center gap-3">
          <div className="progress-track h-1.5 flex-1">
            <div className="progress-fill" style={{ width: `${Math.round((completedCount / totalModules) * 100)}%` }} />
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)', minWidth: '80px', textAlign: 'right' }}>
            {completedCount}/{totalModules} complete
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {curriculum.map(chapter => (
          <div key={chapter.chapter}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${chapter.color}15`, color: chapter.color, border: `1px solid ${chapter.color}40`, fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
                CH.{chapter.chapter}
              </div>
              <h2 className="text-sm font-semibold" style={{ color: 'white', fontFamily: 'var(--font-display)' }}>{chapter.title}</h2>
            </div>

            <div className="space-y-3">
              {chapter.modules.map(mod => {
                const done = completedIds.has(mod.id);
                return (
                  <button
                    key={mod.id}
                    data-testid={`curriculum-module-${mod.id}`}
                    onClick={() => setLocation(`/curriculum/${mod.id}`)}
                    className="w-full text-left rounded-lg p-4 transition-all"
                    style={{
                      background: done ? 'rgba(0,245,255,0.04)' : 'var(--color-surface)',
                      border: `1px solid ${done ? 'rgba(0,245,255,0.2)' : 'var(--color-border)'}`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: done ? 'rgba(0,245,255,0.15)' : 'var(--color-surface-offset)',
                        border: `1px solid ${done ? 'rgba(0,245,255,0.4)' : 'var(--color-border)'}`,
                      }}>
                        {done
                          ? <span className="text-xs" style={{ color: 'var(--color-primary)' }}>✓</span>
                          : <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>○</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-sm font-semibold" style={{ color: done ? 'var(--color-primary)' : 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{mod.title}</h3>
                          <span className="text-xs" style={{ color: typeColors[mod.type] || 'var(--color-text-muted)' }}>{mod.type}</span>
                          <span className="text-xs ml-auto" style={{ color: 'var(--color-text-faint)' }}>{mod.duration}</span>
                        </div>
                        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{mod.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {mod.topics.map(t => (
                            <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text-faint)', border: '1px solid var(--color-border)' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
