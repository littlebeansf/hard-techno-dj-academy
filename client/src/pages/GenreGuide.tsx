import { useState } from "react";

const genres = [
  {
    id: "hard-techno",
    name: "Hard Techno",
    bpm: "140–160",
    color: "var(--color-primary)",
    colorClass: "genre-hard-techno",
    origin: "Berlin, Germany / Detroit influence",
    decade: "Late 1990s–2000s, revival 2018+",
    description: "Hard Techno is characterized by its aggressive, industrial-influenced sound with heavy kicks, distorted baselines, and minimal but punishing arrangements. It sits at the crossroads of traditional techno and industrial club music.",
    characteristics: [
      "Heavy distorted 4/4 kick drum (often clipping)",
      "Stripped-back, hypnotic structure",
      "Dark, industrial atmosphere",
      "Filtered, aggressive mid-range",
      "Tension-and-release arrangement style",
      "Common swing/shuffle patterns on hats",
    ],
    keyArtists: ["Paula Temple", "KI/KI", "SPFDJ", "Alignment", "Phase Fatale", "Dax J"],
    labels: ["Filth on Acid", "Junction 2", "Odd Recordings"],
    influence: "Industrial Techno, Schranz, EBM",
    sound: "Deep, distorted, aggressive, hypnotic",
    emoji: "⚡",
  },
  {
    id: "acid-techno",
    name: "Acid Techno",
    bpm: "135–155",
    color: "var(--color-acid)",
    colorClass: "genre-acid-techno",
    origin: "Chicago / London / Berlin",
    decade: "1987 (Chicago House) → 1990s Techno fusion",
    description: "Acid Techno fuses the squelching TB-303 basslines of Chicago Acid House with the relentless drive of techno. The 303's resonance filter creates the signature 'wah-wah' sound that defines the genre.",
    characteristics: [
      "TB-303 synthesizer basslines (real or emulated)",
      "High resonance filter sweeps",
      "Squelching, modulated bass patterns",
      "Looping, hypnotic repetition",
      "Psychedelic, trance-inducing energy",
      "Shorter notes with accent programming",
    ],
    keyArtists: ["Josh Wink", "Robert Armani", "DJ Rush", "Emmanuel Top", "Hardfloor"],
    labels: ["Djax-Up-Beats", "Peacefrog", "Bush Records"],
    influence: "Acid House, Chicago Techno, Rave culture",
    sound: "Squelchy, hypnotic, psychedelic, driving",
    emoji: "🎛",
  },
  {
    id: "schranz",
    name: "Schranz",
    bpm: "150–175",
    color: "var(--color-energy)",
    colorClass: "genre-schranz",
    origin: "Germany (Frankfurt/Cologne)",
    decade: "Late 1990s–2000s",
    description: "Schranz is an extreme subgenre — relentlessly fast, brutally minimal, and mercilessly hard. Born from Frankfurt's club scene, it strips techno down to its rawest elements: distorted kick, noise, and nothing else. Pure sonic brutalism.",
    characteristics: [
      "Very high BPM (150–175+)",
      "Extremely minimal arrangement",
      "Distorted, processed kick that dominates the mix",
      "Near absence of melodic elements",
      "Industrial noise textures and drones",
      "Hypnotic through repetition alone",
    ],
    keyArtists: ["Chris Liebing", "Marco Bailey", "Steve Stoll", "Industrial Strength"],
    labels: ["CLR", "Machinery", "Primate"],
    influence: "Industrial, EBM, Hard Techno",
    sound: "Brutal, minimal, relentless, industrial",
    emoji: "🔩",
  },
  {
    id: "industrial-techno",
    name: "Industrial Techno",
    bpm: "140–165",
    color: "#e87840",
    colorClass: "genre-industrial",
    origin: "Berlin / Detroit",
    decade: "2010s–present",
    description: "Industrial Techno draws from EBM (Electronic Body Music), noise, and post-industrial music. It uses mechanical rhythms, metallic textures, and dystopian atmospheres. Think factory floors, apocalyptic soundscapes, and relentless repetition.",
    characteristics: [
      "Metallic percussion textures",
      "EBM-influenced basslines",
      "Noise and industrial drones",
      "Post-apocalyptic atmospheres",
      "Mechanical, robotic groove",
      "Cinematic, dark, dystopian mood",
    ],
    keyArtists: ["Surgeon", "Paula Temple", "Ancient Methods", "Rebekah", "Blawan"],
    labels: ["Mord", "Token", "Jealous God"],
    influence: "EBM, Noise, Post-Industrial, Dark Ambient",
    sound: "Metallic, dystopian, EBM-influenced",
    emoji: "🏭",
  },
  {
    id: "hardcore",
    name: "Hardcore / Gabber",
    bpm: "160–220",
    color: "var(--color-purple)",
    colorClass: "genre-hardcore",
    origin: "Rotterdam, Netherlands",
    decade: "Early 1990s–present",
    description: "Gabber emerged from Rotterdam's rave scene — faster, harder, louder than anything that came before. The kick is heavily distorted and clipped to a square wave, creating an aggressive, almost inhuman sound. A subcultural movement as much as a music genre.",
    characteristics: [
      "Extreme BPM (160–220+)",
      "Heavily distorted/square-wave kick",
      "Rave-derived synthesis and samples",
      "Call-and-response MC culture",
      "Anti-establishment, working-class roots",
      "Strong visual and fashion identity",
    ],
    keyArtists: ["DJ Paul", "Lenny Dee", "The Prodigy", "Rotterdam Terror Corps", "Angerfist"],
    labels: ["Rotterdam Records", "Industrial Strength", "Masters of Hardcore"],
    influence: "Rave, House, Industrial",
    sound: "Extreme, distorted, fast, aggressive",
    emoji: "💥",
  },
  {
    id: "noise-techno",
    name: "Noise / Power Electronics",
    bpm: "Variable",
    color: "#aaaaaa",
    colorClass: "",
    origin: "Japan / UK",
    decade: "1980s–present",
    description: "At the outer fringes, Noise and Power Electronics push techno into pure sonic extremity. Rhythm may be present or absent. The goal is texture, volume, and disorientation. Not a DJ genre per se, but a deep influence on industrial techno and harsh noise walls.",
    characteristics: [
      "Heavy use of feedback and distortion",
      "Rhythmic or non-rhythmic structures",
      "Extreme volume dynamics",
      "Confrontational performance art aspect",
      "Anti-melodic, texture-focused",
      "Often live performance-oriented",
    ],
    keyArtists: ["Merzbow", "Whitehouse", "Death Grips", "Container", "Prurient"],
    labels: ["Hospital Productions", "Subtext"],
    influence: "Industrial, Punk, Experimental",
    sound: "Abrasive, extreme, avant-garde",
    emoji: "📢",
  },
];

const comparisonTable = [
  { aspect: "BPM Range", values: { "Hard Techno": "140–160", "Acid Techno": "135–155", "Schranz": "150–175", "Hardcore": "160–220" } },
  { aspect: "Kick Style", values: { "Hard Techno": "Distorted, heavy 4/4", "Acid Techno": "Punchy, clean or slight dist.", "Schranz": "Extreme distortion, dominant", "Hardcore": "Square-wave clipped" } },
  { aspect: "Key Element", values: { "Hard Techno": "Distorted baseline", "Acid Techno": "TB-303 acid line", "Schranz": "Noise + minimal kick", "Hardcore": "Speed + distortion" } },
  { aspect: "Mood", values: { "Hard Techno": "Dark, aggressive", "Acid Techno": "Hypnotic, psychedelic", "Schranz": "Brutal, minimal", "Hardcore": "Extreme, chaotic" } },
  { aspect: "Danceability", values: { "Hard Techno": "High", "Acid Techno": "High", "Schranz": "Medium (niche)", "Hardcore": "High (for fans)" } },
  { aspect: "Origin", values: { "Hard Techno": "Berlin / Detroit", "Acid Techno": "Chicago / Berlin", "Schranz": "Frankfurt", "Hardcore": "Rotterdam" } },
];

export function GenreGuide() {
  const [activeGenre, setActiveGenre] = useState(genres[0]);
  const [view, setView] = useState<"detail" | "comparison">("detail");

  return (
    <div className="flex h-full overflow-hidden">
      {/* Genre List */}
      <div className="w-56 flex-shrink-0 border-r overflow-y-auto p-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="mb-3 px-2">
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'var(--text-sm)' }}>Genres</h2>
        </div>
        {genres.map(g => (
          <button
            key={g.id}
            data-testid={`genre-${g.id}`}
            onClick={() => { setActiveGenre(g); setView("detail"); }}
            className="w-full text-left px-3 py-2.5 rounded-md mb-1 transition-all"
            style={{
              background: activeGenre.id === g.id ? 'rgba(0,245,255,0.05)' : 'transparent',
              border: `1px solid ${activeGenre.id === g.id ? 'rgba(0,245,255,0.2)' : 'transparent'}`,
            }}
          >
            <div className="flex items-center gap-2">
              <span>{g.emoji}</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: activeGenre.id === g.id ? g.color : 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{g.name}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{g.bpm} BPM</div>
              </div>
            </div>
          </button>
        ))}
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setView("comparison")}
            className="w-full text-left px-3 py-2 rounded-md text-xs font-semibold"
            style={{
              background: view === "comparison" ? 'rgba(155,48,255,0.08)' : 'transparent',
              border: `1px solid ${view === "comparison" ? 'rgba(155,48,255,0.3)' : 'transparent'}`,
              color: view === "comparison" ? 'var(--color-purple)' : 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
            }}
          >
            📊 Comparison Table
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {view === "comparison" ? (
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'var(--text-xl)', marginBottom: '0.5rem' }}>Genre Comparison</h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>Side-by-side breakdown of the main hard dance subgenres.</p>
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--color-surface-offset)' }}>
                    <th className="p-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--color-border)' }}>Aspect</th>
                    {["Hard Techno", "Acid Techno", "Schranz", "Hardcore"].map(g => (
                      <th key={g} className="p-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--color-border)' }}>{g}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonTable.map((row, i) => (
                    <tr key={row.aspect} style={{ background: i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                      <td className="p-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>{row.aspect}</td>
                      {["Hard Techno", "Acid Techno", "Schranz", "Hardcore"].map(g => (
                        <td key={g} className="p-3 text-xs" style={{ color: 'var(--color-text)' }}>{row.values[g as keyof typeof row.values]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BPM Visual Range */}
            <div className="mt-8">
              <h3 className="mb-4 text-sm font-semibold" style={{ color: 'white', fontFamily: 'var(--font-display)' }}>BPM Spectrum</h3>
              {[
                { name: "Techno", bpmMin: 120, bpmMax: 135, color: '#666' },
                { name: "Acid Techno", bpmMin: 135, bpmMax: 155, color: 'var(--color-acid)' },
                { name: "Hard Techno", bpmMin: 140, bpmMax: 160, color: 'var(--color-primary)' },
                { name: "Schranz", bpmMin: 150, bpmMax: 175, color: 'var(--color-energy)' },
                { name: "Hardcore/Gabber", bpmMin: 160, bpmMax: 220, color: 'var(--color-purple)' },
              ].map(g => {
                const totalRange = 220 - 120;
                const left = ((g.bpmMin - 120) / totalRange) * 100;
                const width = ((g.bpmMax - g.bpmMin) / totalRange) * 100;
                return (
                  <div key={g.name} className="flex items-center gap-4 mb-2">
                    <div className="w-32 text-xs text-right" style={{ color: 'var(--color-text-muted)' }}>{g.name}</div>
                    <div className="flex-1 relative h-5">
                      <div className="absolute h-full rounded" style={{ left: `${left}%`, width: `${width}%`, background: g.color, opacity: 0.7 }} />
                    </div>
                    <div className="w-20 text-xs" style={{ color: g.color }}>{g.bpmMin}–{g.bpmMax}</div>
                  </div>
                );
              })}
              <div className="flex ml-36 mt-1">
                {[120, 140, 160, 180, 200, 220].map(bpm => (
                  <div key={bpm} className="flex-1 text-xs" style={{ color: 'var(--color-text-faint)' }}>{bpm}</div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Genre Header */}
            <div className="mb-6 flex items-start gap-4">
              <div className="text-4xl">{activeGenre.emoji}</div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-display)', color: activeGenre.color, fontSize: 'var(--text-xl)', textShadow: `0 0 20px ${activeGenre.color}66` }}>
                  {activeGenre.name}
                </h1>
                <div className="flex gap-4 mt-1">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>🎵 {activeGenre.bpm} BPM</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>📍 {activeGenre.origin}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>📅 {activeGenre.decade}</span>
                </div>
              </div>
            </div>

            <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--color-text)', maxWidth: '65ch', lineHeight: 1.75 }}>{activeGenre.description}</p>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Characteristics */}
              <div className="rounded-lg p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <h3 className="mb-3 text-xs uppercase tracking-wider font-semibold" style={{ color: activeGenre.color, fontFamily: 'var(--font-display)', letterSpacing: '0.15em' }}>
                  Key Characteristics
                </h3>
                <ul className="space-y-2">
                  {activeGenre.characteristics.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span style={{ color: activeGenre.color, marginTop: '1px' }}>▸</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Artists & Labels */}
              <div>
                <div className="rounded-lg p-4 mb-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <h3 className="mb-2 text-xs uppercase tracking-wider font-semibold" style={{ color: activeGenre.color, fontFamily: 'var(--font-display)', letterSpacing: '0.15em' }}>Key Artists</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activeGenre.keyArtists.map(a => (
                      <span key={a} className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>{a}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <h3 className="mb-2 text-xs uppercase tracking-wider font-semibold" style={{ color: activeGenre.color, fontFamily: 'var(--font-display)', letterSpacing: '0.15em' }}>Labels</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activeGenre.labels.map(l => (
                      <span key={l} className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sound Profile */}
            <div className="rounded-lg p-4" style={{ background: 'var(--color-surface)', border: `1px solid ${activeGenre.color}33` }}>
              <h3 className="mb-2 text-xs uppercase tracking-wider font-semibold" style={{ color: activeGenre.color, fontFamily: 'var(--font-display)', letterSpacing: '0.15em' }}>Sound Profile</h3>
              <div className="flex gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span>🎵 <strong>Sound:</strong> {activeGenre.sound}</span>
                <span>🔗 <strong>Influenced by:</strong> {activeGenre.influence}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
