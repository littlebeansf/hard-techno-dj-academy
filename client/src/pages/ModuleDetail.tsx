import { useState } from "react";
import { useRoute } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Progress } from "@shared/schema";

const moduleContent: Record<string, {
  title: string;
  genre: string;
  duration: string;
  sections: { heading: string; content: string; type?: string }[];
  quiz?: { question: string; options: string[]; correct: number }[];
}> = {
  intro: {
    title: "What is Hard Techno?",
    genre: "Hard Techno",
    duration: "15 min",
    sections: [
      {
        heading: "Origins",
        content: "Hard Techno emerged from the crossroads of Detroit's minimal machine music and Berlin's dark industrial underground. While Detroit birthed techno in the late 1980s with artists like Derrick May and Kevin Saunderson, Berlin's club scene pushed it harder, faster, and darker throughout the 1990s and 2000s.\n\nThe genre distinguishes itself from regular techno through its use of heavy distortion on kick drums, aggressive mid-range filtering, and a generally menacing, industrial atmosphere. Think of it as techno that hit the gym, then started listening to industrial music.",
      },
      {
        heading: "The Sound Signature",
        content: "Hard Techno is defined by several sonic characteristics:\n\n• **The Kick**: Distorted, heavy, often with harmonic content from clipping. It hits hard and has weight.\n• **The Bassline**: Usually a looping, filtered, aggressive bass pattern — not acid-squelchy but dark and industrial.\n• **The Atmosphere**: Dark, minimal, with industrial textures — noise sweeps, metallic percussion, dystopian pads.\n• **The Mix**: Loud, compressed, with the kick dominating everything.",
        type: "sound",
      },
      {
        heading: "The Underground Scene",
        content: "Hard Techno lives in dark warehouses, Berghain side rooms, and outdoor raves. It's deeply tied to rave culture — counterculture, freedom, collective experience. Key venues include Berghain (Berlin), Junction 2 (London), Tresor (Berlin), and countless illegal raves across Europe.\n\nThe scene is characterized by anonymity (artists often use pseudonyms or go by initials), dark visual aesthetics, and an anti-mainstream ethos. The culture values the music above all else.",
      },
      {
        heading: "Modern Revival (2018–Present)",
        content: "Hard Techno experienced a massive global resurgence from around 2018-2020 onwards, partly driven by social media and platforms like TikTok where younger audiences discovered the genre. Artists like SPFDJ, Alignment, and KI/KI brought new energy while keeping the underground essence intact.\n\nThe modern scene blends classic Berlin aesthetics with new production techniques — more polished but equally aggressive.",
      },
    ],
    quiz: [
      { question: "What city is most associated with the development of Hard Techno?", options: ["Detroit", "Berlin", "Rotterdam", "London"], correct: 1 },
      { question: "Which sound element most defines Hard Techno vs regular Techno?", options: ["Faster BPM", "Piano chords", "Distorted kick drum", "Tropical samples"], correct: 2 },
      { question: "What is the typical BPM range for Hard Techno?", options: ["120–130", "130–140", "140–160", "160–180"], correct: 2 },
    ],
  },
  genres: {
    title: "Genre Map",
    genre: "Mixed",
    duration: "20 min",
    sections: [
      {
        heading: "The Family Tree",
        content: "Hard Techno sits within a broader 'Hard Dance' family. Understanding the relationships between subgenres is essential for any DJ.\n\nThe family tree looks roughly like this:\n\n**Techno** (Detroit, 130–138 BPM)\n└─ **Hard Techno** (Berlin, 140–160 BPM) — distorted, industrial\n   └─ **Schranz** (Frankfurt, 150–175 BPM) — extreme minimalism\n      └─ **Industrial Techno** (global, 140–165 BPM) — EBM influence\n\n**Acid House** (Chicago, 120–130 BPM)\n└─ **Acid Techno** (Berlin/London, 135–155 BPM) — TB-303 meets techno\n\n**Rave/House** (UK/US, 1990s)\n└─ **Hardcore/Gabber** (Rotterdam, 160–220 BPM) — extreme speed",
      },
      {
        heading: "Hard Techno vs Schranz",
        content: "These two are often confused. The key differences:\n\n**Hard Techno:**\n• Has more arrangement — builds, breaks, transitions\n• Uses melodic elements (filtered synths, pads)\n• Sits at 140–160 BPM\n• More accessible to mainstream techno fans\n• Think: SPFDJ, KI/KI, Alignment\n\n**Schranz:**\n• Extreme minimalism — just kick, noise, and atmosphere\n• Very little melodic content\n• Faster (150–175 BPM)\n• Often hypnotic through sheer repetition\n• Think: Chris Liebing (classic era), Steve Stoll",
        type: "comparison",
      },
      {
        heading: "Acid Techno: The 303 Sound",
        content: "Acid Techno is defined by the Roland TB-303 Bass Line synthesizer — originally meant to simulate bass guitar, it became iconic for its squelching, resonant filter sound when played incorrectly.\n\nKey parameters of the 303:\n• **Cutoff Frequency**: How bright/dark the sound is\n• **Resonance**: The 'squelch' — higher = more acid character\n• **Accent**: Emphasizes certain notes for groove\n• **Slide**: Notes glide between each other\n\nThe acid bassline is looped and modulated over time, creating a hypnotic, almost psychedelic effect.",
      },
      {
        heading: "Hardcore and Gabber",
        content: "At the extreme end sits Hardcore (also called Gabber, from Dutch slang for 'friend'). Originating in Rotterdam in the early 1990s, it pushed techno to its limits:\n\n• BPM: 160–220+ (some sub-genres exceed 300 BPM)\n• Kick: So heavily distorted it becomes a square wave — literally clipped audio\n• Culture: Working-class, anti-establishment, rave identity\n• Aesthetic: Tracksuits, shaved heads, raw energy\n\nGabber was one of the first 'extreme' electronic genres and influenced everything from industrial techno to breakcore.",
      },
    ],
    quiz: [
      { question: "What synthesizer is essential to Acid Techno?", options: ["Moog Minimoog", "Roland TB-303", "Korg MS-20", "Roland Juno-106"], correct: 1 },
      { question: "Which city gave birth to Gabber/Hardcore?", options: ["Amsterdam", "Berlin", "Rotterdam", "Chicago"], correct: 2 },
      { question: "What makes Schranz different from Hard Techno?", options: ["Lower BPM", "More melody", "Extreme minimalism & higher BPM", "Piano chords"], correct: 2 },
    ],
  },
  bpm: {
    title: "BPM & Rhythm Theory",
    genre: "Hard Techno",
    duration: "25 min",
    sections: [
      {
        heading: "What is BPM?",
        content: "BPM stands for Beats Per Minute. It's the tempo of music — how many kicks (beats) occur per minute. Hard Techno runs at 140–160 BPM. At 150 BPM, there are exactly 2.5 beats per second.\n\nWhy does BPM matter for DJs?\n• **Beatmatching**: You need to match the BPM of two tracks to mix them\n• **Energy management**: Higher BPM = more energy (generally)\n• **Genre identification**: BPM is one of the first ways to identify a genre",
      },
      {
        heading: "The 4/4 Grid",
        content: "Almost all techno uses a 4/4 time signature — 4 beats per bar. The kick drum typically hits on every beat (1, 2, 3, 4). This is called a '4-on-the-floor' pattern.\n\nBasic Hard Techno drum pattern:\n```\nKICK:  X . . . X . . . X . . . X . . .\nSNARE: . . . . X . . . . . . . X . . .\nHAT:   . X . X . X . X . X . X . X . X\n```\n\nBar = 4 beats. Phrase = 8 or 16 bars. This structure governs everything in DJing.",
        type: "code",
      },
      {
        heading: "Hard Techno Kick Patterns",
        content: "Hard Techno kicks are more than just 4-on-the-floor. Common variations:\n\n• **Straight**: Clean 4/4, every beat\n• **Double kick**: Two kicks at the end of a bar (boom-boom)\n• **Distorted roll**: Rapid 16th note kicks going into a drop\n• **Swing**: Slight humanization of hat/percussion timing\n\nThe kick is the foundation — everything else sits on top of it.",
      },
      {
        heading: "Practice: Use the Beat Studio",
        content: "Now it's time to apply this knowledge. Head to the Beat Studio and:\n\n1. Set the BPM to 145 and listen to a basic 4-on-the-floor pattern\n2. Add hi-hats on the 8th notes\n3. Add a snare on beats 2 and 4\n4. Try distorting the kick\n\nGo to Beat Studio → to try it.",
        type: "practice",
      },
    ],
    quiz: [
      { question: "What does 4/4 time signature mean?", options: ["4 bars total", "4 beats per bar", "4 BPM", "4 instruments"], correct: 1 },
      { question: "At 150 BPM, how many beats occur per second?", options: ["150", "15", "2.5", "60"], correct: 2 },
      { question: "What is '4-on-the-floor'?", options: ["4 floors in a club", "Kick on every beat", "4 decks playing simultaneously", "4 bar loop"], correct: 1 },
    ],
  },
  mixing: {
    title: "DJ Mixing Fundamentals",
    genre: "Hard Techno",
    duration: "30 min",
    sections: [
      { heading: "Beatmatching", content: "Beatmatching is the art of aligning the tempos and beat positions of two tracks so they play in sync. It's the fundamental DJ skill.\n\n**Steps to beatmatch:**\n1. Identify the BPM of both tracks (use BPM display or tap tempo)\n2. Adjust the pitch/speed of Deck B to match Deck A\n3. Find the beat — align the kick drums so they hit simultaneously\n4. Fine-tune using pitch bend (nudge platter forward/back)\n5. Listen on headphones before bringing it into the mix" },
      { heading: "Phrasing & Bar Counting", content: "Music is structured in phrases — groups of 4, 8, or 16 bars. In hard techno, phrases are usually 8 or 16 bars long. Big moments (drops, builds, breakdowns) happen at phrase boundaries.\n\n**Counting bars:** Count the kick drum: 1-2-3-4, 2-2-3-4, 3-2-3-4... Each group of 4 counts is one bar.\n\nFor a clean mix, start your mix-in point at the beginning of a phrase. Mixing in the middle of a phrase creates an awkward, unstructured transition." },
      { heading: "EQ Techniques", content: "EQ is your mixing weapon. The mixer has 3 bands per channel:\n• **High (HI)**: Cymbals, hi-hats, brightness\n• **Mid**: Vocals, synths, presence\n• **Low (LO)**: Kick drum, bass\n\n**The EQ Kill Switch technique:**\nWhen transitioning:\n1. Bring in Deck B with the Low (bass/kick) cut to -∞\n2. Let the melodies/hi-hats blend for 8–16 bars\n3. Gradually cut the Low on Deck A\n4. Bring up the Low on Deck B\n5. Phase out Deck A completely\n\nThis prevents double-kick clashing, which sounds muddy." },
      { heading: "Practice: DJ Deck", content: "Go to the DJ Deck to practice:\n1. Load both decks\n2. Sync the BPM (or try manual beatmatching)\n3. Use headphone cue to preview\n4. Try an EQ transition using the low-cut method", type: "practice" },
    ],
    quiz: [
      { question: "What is beatmatching?", options: ["Choosing same key tracks", "Aligning tempo and beat position of two tracks", "Using the same samples", "Playing both tracks at same volume"], correct: 1 },
      { question: "Why cut the LOW EQ when blending in a new track?", options: ["To make it louder", "To prevent double-kick clashing", "To add more bass", "To sync the BPM"], correct: 1 },
      { question: "How many bars is a typical phrase in hard techno?", options: ["1–2 bars", "4–5 bars", "8 or 16 bars", "32–64 bars"], correct: 2 },
    ],
  },
  acid: {
    title: "The Acid Sound (TB-303)",
    genre: "Acid Techno",
    duration: "25 min",
    sections: [
      { heading: "The Roland TB-303", content: "The Roland TB-303 Bass Line was released in 1981 as a budget bass guitar simulator. It failed commercially and was discontinued in 1984. Second-hand units were bought cheap by Chicago DJs and producers who discovered that when you program it 'wrong' — with high resonance, gliding notes, and random patterns — it created an completely new, hypnotic sound.\n\nThe 'acid' name came from a Chicago DJ named DJ Pierre: his track 'Acid Tracks' (1987) with Phuture is widely cited as the first acid house record." },
      { heading: "Key Parameters", content: "Understanding the 303's parameters is essential for creating authentic acid sounds:\n\n• **Cutoff Frequency**: Controls the filter — low values = dark/muffled, high = bright/harsh\n• **Resonance (Accent)**: The 'squeal' — cranked up, it creates the signature squelch\n• **Waveform**: Sawtooth (buzzy, harsh) or Square (hollow, round)\n• **Slide**: Notes glide/portamento between pitches\n• **Accent**: Emphasizes certain notes — louder with a faster filter sweep\n• **Decay**: How long the filter stays open after a note\n\nThe magic happens when you automate the Cutoff while the pattern loops.", type: "sound" },
      { heading: "Programming Patterns", content: "Acid patterns are typically 16 steps (one bar at 4/4). The key is:\n\n1. Use short notes (8th or 16th)\n2. Add accent on unexpected beats\n3. Use slide to connect notes for the 'wah' effect\n4. Repeat the pattern and slowly open/close the filter\n5. Subtle pitch variations create hypnosis\n\nClassic acid patterns use chromatic movement — small intervals (half-steps) create that characteristic 'crawling' feeling." },
      { heading: "Practice: Acid in Beat Studio", content: "In the Beat Studio, the Acid Bassline sequencer lets you:\n• Program a 16-step pattern\n• Set the Cutoff and Resonance\n• Add accent and slide to specific steps\n• Automate the filter over time\n\nStart with a simple 4-note pattern, crank the resonance to 80%, and modulate the cutoff as it plays.", type: "practice" },
    ],
    quiz: [
      { question: "What year was the TB-303 originally released?", options: ["1977", "1981", "1987", "1992"], correct: 1 },
      { question: "Which parameter creates the signature 'squelch' of acid?", options: ["Cutoff Frequency", "Resonance", "Decay", "Waveform type"], correct: 1 },
      { question: "What is 'slide' on the TB-303?", options: ["A performance move", "Glide/portamento between notes", "Distortion effect", "A type of rhythm"], correct: 1 },
    ],
  },
  composition: {
    title: "Composing a Hard Techno Track",
    genre: "Hard Techno",
    duration: "40 min",
    sections: [
      { heading: "Track Structure", content: "A typical hard techno track follows this structure:\n\n```\nIntro      [0:00–2:00]  Kick + minimal elements, building\nBuild      [2:00–4:00]  Add layers, increase tension\nMain Drop  [4:00–6:30]  Full arrangement, peak energy\nBreakdown  [6:30–8:00]  Remove elements, create space\nRe-entry   [8:00–10:00] Build again for DJ mix-out\nOutro      [10:00+]     Strip back to basics\n```\n\nDJs need long intros and outros (2 min+) to mix cleanly. Always produce with this in mind." },
      { heading: "Layering Technique", content: "Hard Techno tracks are built through layering — adding and removing elements:\n\n**Foundation Layer (always present):**\n• 4/4 kick drum\n• Sub-bass tone under the kick\n\n**Rhythm Layer (add early):**\n• Hi-hats (8th or 16th note patterns)\n• Percussion loops (industrial claps, metal hits)\n\n**Melodic Layer (add/remove for tension):**\n• Bassline (filtered, distorted)\n• Synth stabs or pads (sparse)\n• Acid line if using\n\n**Effect Layer (sparing):**\n• Noise sweeps, risers\n• Reverb/delay FX throws\n• Drum fills at phrase transitions" },
      { heading: "Tension & Release", content: "The most powerful tool in hard techno production is tension and release:\n\n**Creating Tension:**\n• Build a high-pass filter on the kick over 4–8 bars\n• Introduce a rising noise sweep\n• Cut the bassline suddenly\n• Add a triplet kick roll leading into a drop\n• Raise resonance on a filter\n\n**Releasing Tension:**\n• Drop ALL filters simultaneously\n• Bring the full kick back\n• Open the bassline filter fully\n• Hit a breakdown abruptly\n\nThis contrast is what creates memorable moments on the dancefloor." },
      { heading: "Practice: Build a Track", content: "In the Beat Studio:\n1. Set BPM to 148\n2. Program a 4/4 kick pattern\n3. Add hi-hats\n4. Add an acid bassline\n5. Use the filter automation to build tension\n6. Save your pattern and experiment with variations", type: "practice" },
    ],
    quiz: [
      { question: "Why do hard techno tracks need long intros/outros?", options: ["For artistic purposes", "To allow DJs to mix cleanly", "For club PA announcements", "Because the genre requires it"], correct: 1 },
      { question: "What is layering in track composition?", options: ["Playing all sounds at once", "Adding and removing elements progressively", "Only using 1 sound at a time", "Copying another track"], correct: 1 },
      { question: "Which technique creates maximum tension before a drop?", options: ["Adding more reverb", "Lowering the volume", "Noise sweep + filter build + rhythm roll", "Slowing the BPM"], correct: 2 },
    ],
  },
};

export function ModuleDetail() {
  const [, params] = useRoute("/curriculum/:moduleId");
  const moduleId = params?.moduleId || "";
  const [, setLocation] = useHashLocation();
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: progressData } = useQuery<Progress[]>({
    queryKey: ["/api/progress"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/progress"); return r.json(); },
  });

  const markComplete = useMutation({
    mutationFn: async (data: { moduleId: string; completed: boolean; score?: number }) => {
      const r = await apiRequest("POST", "/api/progress", { ...data, completedAt: new Date().toISOString() });
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/progress"] }),
  });

  const module = moduleContent[moduleId];
  const isCompleted = progressData?.some(p => p.moduleId === moduleId && p.completed);

  if (!module) {
    return (
      <div className="p-8">
        <button onClick={() => setLocation("/curriculum")} className="text-sm mb-4" style={{ color: 'var(--color-primary)' }}>← Back to Curriculum</button>
        <p style={{ color: 'var(--color-text-muted)' }}>Module not found.</p>
      </div>
    );
  }

  const quiz = module.quiz;
  const totalQuestions = quiz?.length || 0;
  const correctAnswers = quiz?.filter((q, i) => selectedAnswers[i] === q.correct).length || 0;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    markComplete.mutate({ moduleId, completed: true, score });
  };

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={() => setLocation("/curriculum")} className="text-xs mb-6 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
        ← Back to Curriculum
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: 'rgba(0,245,255,0.08)', color: 'var(--color-primary)', border: '1px solid rgba(0,245,255,0.2)', fontFamily: 'var(--font-display)' }}>
            {module.genre}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{module.duration}</span>
          {isCompleted && <span className="text-xs" style={{ color: 'var(--color-primary)' }}>✓ Completed</span>}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'var(--text-xl)', letterSpacing: '-0.02em' }}>{module.title}</h1>
      </div>

      {/* Content Sections */}
      <div className="space-y-6 mb-8">
        {module.sections.map((section, i) => (
          <div key={i} className="rounded-lg p-5" style={{
            background: section.type === 'practice' ? 'var(--color-energy-dim)' : section.type === 'sound' ? 'rgba(155,48,255,0.05)' : 'var(--color-surface)',
            border: `1px solid ${section.type === 'practice' ? 'rgba(255,0,64,0.2)' : section.type === 'sound' ? 'rgba(155,48,255,0.2)' : 'var(--color-border)'}`,
          }}>
            <h2 className="text-sm font-semibold mb-3" style={{
              fontFamily: 'var(--font-display)',
              color: section.type === 'practice' ? 'var(--color-energy)' : section.type === 'sound' ? 'var(--color-purple)' : 'var(--color-primary)',
              letterSpacing: '0.02em',
            }}>
              {section.heading}
            </h2>
            <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              {section.content}
            </div>
            {section.type === 'practice' && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => setLocation("/beat-studio")} className="text-xs px-3 py-1.5 rounded font-semibold" style={{ background: 'var(--color-energy)', color: 'white' }}>
                  Open Beat Studio
                </button>
                <button onClick={() => setLocation("/dj-deck")} className="text-xs px-3 py-1.5 rounded font-semibold" style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                  Open DJ Deck
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quiz */}
      {quiz && (
        <div className="rounded-lg p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'white' }}>
              Knowledge Check
            </h2>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{totalQuestions} questions</span>
          </div>

          {!quizStarted ? (
            <div>
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Test what you've learned with a short quiz. Complete it to mark this module as done.</p>
              <button
                data-testid="start-quiz"
                onClick={() => setQuizStarted(true)}
                className="px-4 py-2 rounded text-sm font-semibold"
                style={{ background: 'var(--color-primary)', color: 'black' }}
              >
                Start Quiz
              </button>
            </div>
          ) : (
            <div>
              {quiz.map((q, qi) => (
                <div key={qi} className="mb-5">
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>{qi + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      let className = "quiz-option w-full text-left";
                      if (quizSubmitted) {
                        if (oi === q.correct) className += " correct";
                        else if (selectedAnswers[qi] === oi && oi !== q.correct) className += " wrong";
                      } else if (selectedAnswers[qi] === oi) {
                        className += " selected";
                      }
                      return (
                        <button
                          key={oi}
                          data-testid={`quiz-option-${qi}-${oi}`}
                          className={className}
                          disabled={quizSubmitted}
                          onClick={() => !quizSubmitted && setSelectedAnswers(prev => ({ ...prev, [qi]: oi }))}
                        >
                          <span className="text-xs mr-2" style={{ color: 'var(--color-text-faint)' }}>{String.fromCharCode(65 + oi)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  data-testid="submit-quiz"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < totalQuestions}
                  className="px-4 py-2 rounded text-sm font-semibold disabled:opacity-40"
                  style={{ background: 'var(--color-primary)', color: 'black' }}
                >
                  Submit Answers
                </button>
              ) : (
                <div className="rounded-md p-4 mt-3" style={{
                  background: score >= 70 ? 'rgba(0,255,136,0.08)' : 'var(--color-energy-dim)',
                  border: `1px solid ${score >= 70 ? 'rgba(0,255,136,0.3)' : 'rgba(255,0,64,0.3)'}`,
                }}>
                  <div className="text-sm font-bold mb-1" style={{ color: score >= 70 ? '#00ff88' : 'var(--color-energy)', fontFamily: 'var(--font-display)' }}>
                    {score >= 70 ? '✓ Module Complete!' : '✗ Try Again'} — {correctAnswers}/{totalQuestions} correct ({score}%)
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {score >= 70 ? 'Great work. This module is marked as complete in your progress.' : 'Review the material and retake the quiz to complete this module.'}
                  </p>
                  {score < 70 && (
                    <button
                      onClick={() => { setQuizStarted(false); setSelectedAnswers({}); setQuizSubmitted(false); }}
                      className="mt-2 text-xs px-3 py-1 rounded"
                      style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    >
                      Retry Quiz
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
