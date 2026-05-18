import { useState, useRef, useEffect, useCallback } from "react";

// Simple synthesized tracks using Web Audio API patterns
type TrackDef = { name: string; bpm: number; color: string; genre: string };

const TRACKS: TrackDef[] = [
  { name: "Berlin Concrete", bpm: 148, color: "var(--color-primary)", genre: "Hard Techno" },
  { name: "Acid Protocol", bpm: 142, color: "var(--color-acid)", genre: "Acid Techno" },
  { name: "Frankfurt Noise", bpm: 162, color: "var(--color-energy)", genre: "Schranz" },
  { name: "Industrial Mind", bpm: 152, color: "#e87840", genre: "Industrial" },
  { name: "Gabber Storm", bpm: 180, color: "var(--color-purple)", genre: "Hardcore" },
];

function useDeck(ctx: AudioContext | null) {
  const kickGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [bpm, setBpm] = useState(148);
  const [volume, setVolume] = useState(80);
  const [eq, setEq] = useState({ hi: 0, mid: 0, lo: 0 });
  const [track, setTrack] = useState<TrackDef>(TRACKS[0]);
  const [position, setPosition] = useState(0); // 0-100
  const [spinning, setSpinning] = useState(false);
  const hiEqRef = useRef<BiquadFilterNode | null>(null);
  const midEqRef = useRef<BiquadFilterNode | null>(null);
  const loEqRef = useRef<BiquadFilterNode | null>(null);
  const beatStep = useRef(0);
  const positionRef = useRef(0);

  const scheduleKick = useCallback((audioCtx: AudioContext, time: number, distortion: number = 0.6) => {
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    const dist = audioCtx.createWaveShaper();

    // Distortion curve
    const samples = 256;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((Math.PI + distortion * 100) * x) / (Math.PI + distortion * 100 * Math.abs(x));
    }
    dist.curve = curve;

    osc.connect(oscGain);
    oscGain.connect(dist);
    dist.connect(masterGainRef.current!);

    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);

    oscGain.gain.setValueAtTime(1.2, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.start(time);
    osc.stop(time + 0.15);
  }, []);

  const scheduleHat = useCallback((audioCtx: AudioContext, time: number) => {
    const bufferSize = audioCtx.sampleRate * 0.05;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    filter.type = "highpass";
    filter.frequency.value = 8000;

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current!);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    source.start(time);
    source.stop(time + 0.05);
  }, []);

  const startPlayback = useCallback((audioCtx: AudioContext) => {
    if (!masterGainRef.current) {
      masterGainRef.current = audioCtx.createGain();
      hiEqRef.current = audioCtx.createBiquadFilter();
      midEqRef.current = audioCtx.createBiquadFilter();
      loEqRef.current = audioCtx.createBiquadFilter();

      hiEqRef.current.type = "highshelf";
      hiEqRef.current.frequency.value = 8000;
      midEqRef.current.type = "peaking";
      midEqRef.current.frequency.value = 1000;
      loEqRef.current.type = "lowshelf";
      loEqRef.current.frequency.value = 200;

      masterGainRef.current.connect(hiEqRef.current);
      hiEqRef.current.connect(midEqRef.current);
      midEqRef.current.connect(loEqRef.current);
      loEqRef.current.connect(audioCtx.destination);
    }

    masterGainRef.current.gain.value = volume / 100;
    beatStep.current = 0;
    setSpinning(true);

    const secondsPerBeat = 60 / bpm;
    const step16 = secondsPerBeat / 4;
    let nextTime = audioCtx.currentTime;

    const tick = () => {
      const step = beatStep.current % 16;
      const t = nextTime;

      // Kick on beats 0, 4, 8, 12
      if (step % 4 === 0) scheduleKick(audioCtx, t);
      // Hi-hat every 2 steps
      if (step % 2 === 0) scheduleHat(audioCtx, t);

      nextTime += step16;
      beatStep.current++;
      positionRef.current = (positionRef.current + 0.5) % 100;
      setPosition(positionRef.current);
    };

    tick();
    intervalRef.current = setInterval(tick, step16 * 1000);
  }, [bpm, volume, scheduleKick, scheduleHat]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setSpinning(false);
  }, []);

  // Update EQ
  useEffect(() => {
    if (hiEqRef.current) hiEqRef.current.gain.value = eq.hi * 12; // ±12dB
    if (midEqRef.current) midEqRef.current.gain.value = eq.mid * 12;
    if (loEqRef.current) loEqRef.current.gain.value = eq.lo * 12;
  }, [eq]);

  // Update volume
  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = volume / 100;
  }, [volume]);

  // Update BPM
  useEffect(() => {
    if (isPlaying && intervalRef.current) {
      // BPM change takes effect on next interval restart
    }
  }, [bpm, isPlaying]);

  return { isPlaying, setIsPlaying, bpm, setBpm, volume, setVolume, eq, setEq, track, setTrack, position, spinning, startPlayback, stop };
}

function Platter({ spinning, color }: { spinning: boolean; color: string }) {
  const rotation = useRef(0);
  const animRef = useRef<number>();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const animate = () => {
      if (spinning) {
        rotation.current = (rotation.current + 0.8) % 360;
        if (svgRef.current) {
          svgRef.current.style.transform = `rotate(${rotation.current}deg)`;
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [spinning]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: '180px', height: '180px' }}>
      <svg ref={svgRef} width="180" height="180" viewBox="0 0 180 180" style={{ transition: spinning ? 'none' : 'transform 0.3s' }}>
        {/* Outer ring grooves */}
        {[82, 76, 70, 65, 60].map(r => (
          <circle key={r} cx="90" cy="90" r={r} fill="none" stroke="#2a2a2a" strokeWidth="1" />
        ))}
        {/* Dark vinyl body */}
        <circle cx="90" cy="90" r="85" fill="#111" stroke="#333" strokeWidth="1.5" />
        <circle cx="90" cy="90" r="82" fill="none" stroke="#222" strokeWidth="0.5" />
        {/* Label area */}
        <circle cx="90" cy="90" r="30" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        {/* Label decoration */}
        <circle cx="90" cy="90" r="26" fill="#161616" />
        <circle cx="90" cy="90" r="4" fill={color} />
        {/* Radius line (indicator) */}
        <line x1="90" y1="90" x2="90" y2="12" stroke={color} strokeWidth="1.5" strokeOpacity="0.8" />
        {/* Groove lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={`g${i}`} cx="90" cy="90" r={38 + i * 5} fill="none" stroke="#1e1e1e" strokeWidth="0.5" />
        ))}
      </svg>
      {/* Center dot */}
      <div className="absolute w-3 h-3 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
    </div>
  );
}

function EQKnob({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color?: string }) {
  const angle = value * 135; // -135 to +135 degrees
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="knob w-10 h-10 cursor-pointer"
        data-testid={`knob-${label.toLowerCase()}`}
        style={{
          background: 'radial-gradient(circle at 35% 35%, #3a3a3a, #111)',
          border: '1px solid #333',
          borderRadius: '50%',
          position: 'relative',
        }}
        onMouseDown={(e) => {
          const startY = e.clientY;
          const startVal = value;
          const onMove = (me: MouseEvent) => {
            const delta = (startY - me.clientY) / 80;
            onChange(Math.max(-1, Math.min(1, startVal + delta)));
          };
          const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
      >
        {/* Indicator dot */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          width: '3px',
          height: '30%',
          background: color || 'var(--color-primary)',
          borderRadius: '2px',
          transformOrigin: 'bottom center',
          transform: `translateX(-50%) rotate(${angle}deg)`,
          transformBox: 'fill-box',
        }} />
      </div>
      <span className="text-xs" style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

function VolumeSlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs mb-1" style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-display)' }}>{label}</span>
      <div className="relative h-24 w-6 flex justify-center" style={{ background: 'var(--color-surface-offset)', borderRadius: '3px', border: '1px solid var(--color-border)' }}>
        <div
          className="absolute bottom-0 w-full rounded"
          style={{
            height: `${value}%`,
            background: `linear-gradient(to top, var(--color-primary), rgba(0,245,255,0.3))`,
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer"
          style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '100%', height: '100%' }}
        />
      </div>
      <span className="text-xs" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>{value}</span>
    </div>
  );
}

function Deck({ side, ctx }: { side: "A" | "B"; ctx: AudioContext | null }) {
  const deck = useDeck(ctx);
  const [cueing, setCueing] = useState(false);

  const togglePlay = () => {
    if (!ctx) return;
    if (deck.isPlaying) {
      deck.stop();
      deck.setIsPlaying(false);
    } else {
      deck.startPlayback(ctx);
      deck.setIsPlaying(true);
    }
  };

  const accentColor = side === "A" ? "var(--color-primary)" : "var(--color-energy)";

  return (
    <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'var(--color-surface)', border: `1px solid ${deck.isPlaying ? (side === 'A' ? 'rgba(0,245,255,0.3)' : 'rgba(255,0,64,0.3)') : 'var(--color-border)'}`, flex: 1 }}>
      {/* Track Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${accentColor}22`, color: accentColor, fontFamily: 'var(--font-display)', border: `1px solid ${accentColor}44` }}>
              DECK {side}
            </span>
            {deck.isPlaying && <span className="text-xs animate-pulse" style={{ color: accentColor }}>● PLAYING</span>}
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{deck.track.genre}</span>
        </div>
        <select
          data-testid={`track-select-${side}`}
          value={deck.track.name}
          onChange={e => deck.setTrack(TRACKS.find(t => t.name === e.target.value) || TRACKS[0])}
          className="w-full rounded px-2 py-1.5 text-xs"
          style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        >
          {TRACKS.map(t => <option key={t.name} value={t.name}>{t.name} — {t.bpm} BPM</option>)}
        </select>
      </div>

      {/* Platter */}
      <div className="flex justify-center">
        <Platter spinning={deck.spinning} color={accentColor} />
      </div>

      {/* BPM + Pitch */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>BPM</span>
          <span className="bpm-display text-sm" style={{ color: accentColor }}>{deck.bpm.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min={120}
          max={200}
          step={0.5}
          value={deck.bpm}
          data-testid={`bpm-slider-${side}`}
          onChange={e => deck.setBpm(Number(e.target.value))}
          className="w-full h-1 rounded"
          style={{ accentColor: accentColor }}
        />
        <div className="flex justify-between text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>
          <span>120</span><span>200</span>
        </div>
      </div>

      {/* EQ Knobs */}
      <div className="flex justify-around">
        <EQKnob label="HI" value={deck.eq.hi} onChange={v => deck.setEq(prev => ({ ...prev, hi: v }))} color={accentColor} />
        <EQKnob label="MID" value={deck.eq.mid} onChange={v => deck.setEq(prev => ({ ...prev, mid: v }))} color={accentColor} />
        <EQKnob label="LO" value={deck.eq.lo} onChange={v => deck.setEq(prev => ({ ...prev, lo: v }))} color={accentColor} />
      </div>

      {/* Waveform visualization */}
      <div className="h-10 flex items-end gap-0.5 px-1 rounded" style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)' }}>
        {Array.from({ length: 40 }).map((_, i) => {
          const h = deck.isPlaying ? Math.random() * 70 + 10 : 20;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                background: `${accentColor}88`,
                minWidth: '1px',
                transition: deck.isPlaying ? 'height 0.15s ease' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          data-testid={`play-btn-${side}`}
          onClick={togglePlay}
          className="flex-1 py-2 rounded font-bold text-sm"
          style={{
            background: deck.isPlaying ? `${accentColor}22` : accentColor,
            color: deck.isPlaying ? accentColor : 'black',
            border: `1px solid ${accentColor}`,
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.1em',
          }}
        >
          {deck.isPlaying ? '⏹ STOP' : '▶ PLAY'}
        </button>
        <button
          data-testid={`cue-btn-${side}`}
          onMouseDown={() => setCueing(true)}
          onMouseUp={() => setCueing(false)}
          className="px-3 py-2 rounded text-xs font-bold"
          style={{
            background: cueing ? 'rgba(255,200,0,0.2)' : 'var(--color-surface-offset)',
            color: cueing ? '#ffcc00' : 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-display)',
          }}
        >
          CUE
        </button>
      </div>
    </div>
  );
}

export function DJDeck() {
  const [ctx, setCtx] = useState<AudioContext | null>(null);
  const [crossfade, setCrossfade] = useState(50);
  const [started, setStarted] = useState(false);

  const initAudio = () => {
    if (!ctx) {
      const newCtx = new AudioContext();
      setCtx(newCtx);
    }
    setStarted(true);
  };

  return (
    <div className="p-6 h-full flex flex-col studio-grid">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="mb-0.5" style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'var(--text-lg)', letterSpacing: '-0.01em' }}>
            DJ DECK
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Dual deck mixer — practice beatmatching, EQ, and transitions</p>
        </div>
        {!started && (
          <button
            data-testid="init-audio"
            onClick={initAudio}
            className="px-4 py-2 rounded text-sm font-bold"
            style={{ background: 'var(--color-primary)', color: 'black', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}
          >
            INITIALIZE AUDIO
          </button>
        )}
      </div>

      {/* Tip if not started */}
      {!started && (
        <div className="mb-4 rounded-lg p-3 text-xs" style={{ background: 'var(--color-primary-dim)', border: '1px solid rgba(0,245,255,0.2)', color: 'var(--color-text-muted)' }}>
          ⚡ Click "Initialize Audio" to activate the Web Audio engine. Browsers require a user gesture before playing audio.
        </div>
      )}

      {/* Main Decks */}
      <div className="flex gap-4 flex-1 min-h-0">
        <Deck side="A" ctx={ctx} />

        {/* Center Mixer */}
        <div className="w-40 flex-shrink-0 rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-display)' }}>MIXER</div>
          </div>

          {/* VU Meters */}
          <div className="flex justify-center gap-3">
            {['L', 'R'].map(ch => (
              <div key={ch} className="flex flex-col items-center gap-1">
                <div className="relative w-4 h-16 rounded" style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                  <div
                    className="absolute bottom-0 w-full rounded"
                    style={{
                      height: '65%',
                      background: 'linear-gradient(to top, #00ff44, #ffff00 60%, #ff4400)',
                      transition: 'height 0.1s ease',
                    }}
                  />
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{ch}</span>
              </div>
            ))}
          </div>

          {/* Volume Faders */}
          <div className="flex justify-around">
            <VolumeSlider value={80} onChange={() => {}} label="A" />
            <VolumeSlider value={80} onChange={() => {}} label="B" />
          </div>

          {/* Crossfader */}
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-display)' }}>
              <span>A</span>
              <span>XFD</span>
              <span>B</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={crossfade}
              data-testid="crossfader"
              onChange={e => setCrossfade(Number(e.target.value))}
              className="w-full h-1.5 rounded cursor-pointer"
              style={{ accentColor: 'white' }}
            />
            <div className="text-center text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>
              {crossfade === 50 ? 'CENTER' : crossfade < 50 ? `A ${100 - crossfade * 2}%` : `B ${(crossfade - 50) * 2}%`}
            </div>
          </div>

          {/* FX Section */}
          <div className="border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-xs mb-2 font-semibold" style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-display)' }}>FX</div>
            {['REVERB', 'DELAY', 'FILTER'].map(fx => (
              <button key={fx} className="w-full mb-1 text-xs py-1 rounded text-left px-2" style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text-faint)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                {fx}
              </button>
            ))}
          </div>
        </div>

        <Deck side="B" ctx={ctx} />
      </div>

      {/* Tips */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { icon: "🎯", tip: "Match BPM on both decks before blending", title: "Beatmatch" },
          { icon: "🎛", tip: "Cut LOW on new track, blend HI/MID first, then swap bass", title: "EQ Transition" },
          { icon: "🎚", tip: "Move crossfader slowly for smooth blends", title: "Crossfade" },
        ].map(t => (
          <div key={t.title} className="rounded-lg p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span>{t.icon}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>{t.title}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-faint)', lineHeight: 1.5 }}>{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
