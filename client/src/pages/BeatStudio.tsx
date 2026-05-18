import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SavedPattern } from "@shared/schema";

const STEPS = 16;

type Track = {
  name: string;
  color: string;
  steps: boolean[];
  volume: number;
  muted: boolean;
};

const defaultPattern = (): Track[] => [
  { name: "KICK", color: "var(--color-primary)", steps: [true,false,false,false, true,false,false,false, true,false,false,false, true,false,false,false], volume: 90, muted: false },
  { name: "SNARE", color: "var(--color-energy)", steps: [false,false,false,false, true,false,false,false, false,false,false,false, true,false,false,false], volume: 75, muted: false },
  { name: "HI-HAT", color: "var(--color-acid)", steps: [false,true,false,true, false,true,false,true, false,true,false,true, false,true,false,true], volume: 60, muted: false },
  { name: "OPEN HH", color: "#aaaaaa", steps: Array(16).fill(false), volume: 65, muted: false },
  { name: "ACID", color: "#9b30ff", steps: [true,false,false,true, false,false,true,false, false,true,false,false, true,false,false,true], volume: 80, muted: false },
  { name: "CLAP", color: "#e87840", steps: Array(16).fill(false), volume: 70, muted: false },
];

function useAudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  };

  const playKick = (ctx: AudioContext, time: number, vol: number = 1) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const dist = ctx.createWaveShaper();
    const n = 256;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((Math.PI + 120) * x) / (Math.PI + 120 * Math.abs(x));
    }
    dist.curve = curve;
    osc.connect(gain); gain.connect(dist); dist.connect(ctx.destination);
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    gain.gain.setValueAtTime(vol * 1.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    osc.start(time); osc.stop(time + 0.2);
  };

  const playSnare = (ctx: AudioContext, time: number, vol: number = 1) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = 'bandpass'; filter.frequency.value = 2000; filter.Q.value = 0.5;
    src.buffer = buf;
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(vol * 0.8, time);
    src.start(time); src.stop(time + 0.15);
  };

  const playHat = (ctx: AudioContext, time: number, vol: number = 1, open: boolean = false) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * (open ? 0.2 : 0.04), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = 'highpass'; filter.frequency.value = 8000;
    src.buffer = buf;
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(vol * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.2 : 0.04));
    src.start(time); src.stop(time + (open ? 0.2 : 0.05));
  };

  const playAcid = (ctx: AudioContext, time: number, vol: number = 1, cutoff: number = 800, resonance: number = 15) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 80;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff * 0.3, time);
    filter.frequency.exponentialRampToValueAtTime(cutoff, time + 0.08);
    filter.frequency.exponentialRampToValueAtTime(cutoff * 0.2, time + 0.15);
    filter.Q.value = resonance;
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(vol * 0.6, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.start(time); osc.stop(time + 0.22);
  };

  const playClap = (ctx: AudioContext, time: number, vol: number = 1) => {
    for (let i = 0; i < 3; i++) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < d.length; j++) d[j] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buf;
      src.connect(gain); gain.connect(ctx.destination);
      gain.gain.setValueAtTime(vol * 0.5, time + i * 0.01);
      src.start(time + i * 0.01); src.stop(time + i * 0.01 + 0.05);
    }
  };

  const playStep = (trackName: string, time: number, vol: number, acidParams?: { cutoff: number; resonance: number }) => {
    const ctx = getCtx();
    const v = vol / 100;
    switch (trackName) {
      case 'KICK': playKick(ctx, time, v); break;
      case 'SNARE': playSnare(ctx, time, v); break;
      case 'HI-HAT': playHat(ctx, time, v, false); break;
      case 'OPEN HH': playHat(ctx, time, v, true); break;
      case 'ACID': playAcid(ctx, time, v, acidParams?.cutoff || 800, acidParams?.resonance || 15); break;
      case 'CLAP': playClap(ctx, time, v); break;
    }
  };

  return { getCtx, playStep };
}

export function BeatStudio() {
  const [tracks, setTracks] = useState<Track[]>(defaultPattern());
  const [bpm, setBpm] = useState(148);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [patternName, setPatternName] = useState("My Pattern");
  const [acidCutoff, setAcidCutoff] = useState(800);
  const [acidResonance, setAcidResonance] = useState(15);
  const [swing, setSwing] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);
  const { getCtx, playStep } = useAudioEngine();
  const queryClient = useQueryClient();

  const { data: savedPatterns } = useQuery<SavedPattern[]>({
    queryKey: ["/api/patterns"],
    queryFn: async () => { const r = await apiRequest("GET", "/api/patterns"); return r.json(); },
  });

  const savePattern = useMutation({
    mutationFn: async () => { const r = await apiRequest("POST", "/api/patterns", {
      name: patternName,
      bpm,
      pattern: JSON.stringify({ tracks, acidCutoff, acidResonance }),
      createdAt: new Date().toISOString(),
    }); return r.json(); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/patterns"] }),
  });

  const deletePattern = useMutation({
    mutationFn: async (id: number) => { const r = await apiRequest("DELETE", `/api/patterns/${id}`); return r.json(); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/patterns"] }),
  });

  const loadPattern = (p: SavedPattern) => {
    try {
      const data = JSON.parse(p.pattern);
      setTracks(data.tracks);
      setAcidCutoff(data.acidCutoff || 800);
      setAcidResonance(data.acidResonance || 15);
      setBpm(p.bpm);
    } catch {}
  };

  const tick = useCallback(() => {
    const ctx = getCtx();
    const step = stepRef.current % STEPS;
    const swingOffset = (step % 2 === 1) ? (swing / 100) * (60 / bpm / 4) : 0;
    const time = ctx.currentTime + swingOffset;

    tracks.forEach(track => {
      if (!track.muted && track.steps[step]) {
        playStep(track.name, time, track.volume, { cutoff: acidCutoff, resonance: acidResonance });
      }
    });

    setCurrentStep(step);
    stepRef.current++;
  }, [tracks, bpm, swing, acidCutoff, acidResonance, getCtx, playStep]);

  const start = useCallback(() => {
    getCtx(); // wake audio
    stepRef.current = 0;
    const intervalMs = (60 / bpm / 4) * 1000;
    tick();
    intervalRef.current = setInterval(tick, intervalMs);
    setIsPlaying(true);
  }, [bpm, tick, getCtx]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsPlaying(false);
    setCurrentStep(-1);
    stepRef.current = 0;
  }, []);

  const togglePlay = () => {
    if (isPlaying) stop();
    else start();
  };

  // Restart when BPM changes
  useEffect(() => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const intervalMs = (60 / bpm / 4) * 1000;
      intervalRef.current = setInterval(tick, intervalMs);
    }
  }, [bpm, isPlaying, tick]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const toggleStep = (trackIdx: number, step: number) => {
    setTracks(prev => prev.map((t, i) =>
      i === trackIdx ? { ...t, steps: t.steps.map((s, si) => si === step ? !s : s) } : t
    ));
  };

  const clearTrack = (trackIdx: number) => {
    setTracks(prev => prev.map((t, i) => i === trackIdx ? { ...t, steps: Array(16).fill(false) } : t));
  };

  const fillTrack = (trackIdx: number, every: number) => {
    setTracks(prev => prev.map((t, i) =>
      i === trackIdx ? { ...t, steps: t.steps.map((_, si) => si % every === 0) } : t
    ));
  };

  // Beat-group separators (every 4 steps)
  const groups = [0, 4, 8, 12];

  return (
    <div className="p-6 flex flex-col h-full studio-grid" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: 'var(--text-lg)', letterSpacing: '-0.01em' }}>
            BEAT STUDIO
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Step sequencer — program and compose hard techno patterns</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* BPM */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>BPM</span>
            <input
              type="number"
              min={100}
              max={220}
              value={bpm}
              data-testid="studio-bpm"
              onChange={e => setBpm(Number(e.target.value))}
              className="w-16 text-center text-sm font-bold rounded px-1"
              style={{ background: 'transparent', color: 'var(--color-primary)', border: 'none', fontFamily: 'var(--font-display)' }}
            />
            <input
              type="range"
              min={100}
              max={220}
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              className="w-20 h-1"
              style={{ accentColor: 'var(--color-primary)' }}
            />
          </div>

          {/* Swing */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>SWING</span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-acid)', fontFamily: 'var(--font-display)' }}>{swing}%</span>
            <input type="range" min={0} max={50} value={swing} onChange={e => setSwing(Number(e.target.value))} className="w-16 h-1" style={{ accentColor: 'var(--color-acid)' }} />
          </div>

          {/* Play/Stop */}
          <button
            data-testid="studio-play"
            onClick={togglePlay}
            className="px-5 py-2 rounded-lg font-bold text-sm"
            style={{
              background: isPlaying ? 'rgba(255,0,64,0.15)' : 'var(--color-primary)',
              color: isPlaying ? 'var(--color-energy)' : 'black',
              border: `1px solid ${isPlaying ? 'var(--color-energy)' : 'var(--color-primary)'}`,
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.1em',
            }}
          >
            {isPlaying ? '⏹ STOP' : '▶ PLAY'}
          </button>
        </div>
      </div>

      {/* Main Sequencer */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {/* Step numbers header */}
        <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div style={{ width: '120px', flexShrink: 0 }} />
          <div className="flex flex-1">
            {Array.from({ length: STEPS }).map((_, i) => (
              <div
                key={i}
                className="flex-1 text-center py-1 text-xs"
                style={{
                  color: currentStep === i ? 'var(--color-primary)' : 'var(--color-text-faint)',
                  fontFamily: 'var(--font-display)',
                  borderLeft: i % 4 === 0 && i > 0 ? '1px solid var(--color-border)' : undefined,
                  background: currentStep === i ? 'rgba(0,245,255,0.06)' : undefined,
                  transition: 'all 0.05s',
                  fontWeight: currentStep === i ? 700 : 400,
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div style={{ width: '80px' }} />
        </div>

        {/* Track rows */}
        {tracks.map((track, ti) => (
          <div key={track.name} className="flex items-center border-b last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
            {/* Track label */}
            <div style={{ width: '120px', flexShrink: 0 }} className="px-3 py-2 flex items-center gap-2">
              <button
                onClick={() => setTracks(prev => prev.map((t, i) => i === ti ? { ...t, muted: !t.muted } : t))}
                data-testid={`mute-${track.name.toLowerCase().replace(/\s/g, '-')}`}
                className="w-4 h-4 rounded-sm flex items-center justify-center text-xs flex-shrink-0"
                style={{
                  background: track.muted ? 'var(--color-surface-offset)' : `${track.color}22`,
                  border: `1px solid ${track.muted ? 'var(--color-border)' : track.color}`,
                  color: track.muted ? 'var(--color-text-faint)' : track.color,
                }}
                title={track.muted ? 'Unmute' : 'Mute'}
              >
                {track.muted ? '✕' : '●'}
              </button>
              <span className="text-xs font-bold" style={{ color: track.muted ? 'var(--color-text-faint)' : track.color, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                {track.name}
              </span>
            </div>

            {/* Steps */}
            <div className="flex flex-1 py-1.5 px-1 gap-1">
              {track.steps.map((active, si) => (
                <button
                  key={si}
                  data-testid={`step-${ti}-${si}`}
                  onClick={() => toggleStep(ti, si)}
                  className={`flex-1 h-8 rounded beat-pad ${active ? (currentStep === si && isPlaying ? 'playing' : 'active') : ''}`}
                  style={{
                    background: active
                      ? currentStep === si && isPlaying
                        ? 'var(--color-energy)'
                        : track.color
                      : 'var(--color-surface-offset)',
                    boxShadow: active && currentStep === si && isPlaying ? `0 0 12px ${track.color}` : 'none',
                    border: `1px solid ${active ? track.color : si % 4 === 0 ? 'var(--color-border-bright)' : 'var(--color-border)'}`,
                    opacity: track.muted ? 0.4 : 1,
                    transition: 'all 0.05s',
                  }}
                />
              ))}
            </div>

            {/* Track controls */}
            <div className="flex items-center gap-2 px-2" style={{ width: '80px', flexShrink: 0 }}>
              <input
                type="range"
                min={0}
                max={100}
                value={track.volume}
                onChange={e => setTracks(prev => prev.map((t, i) => i === ti ? { ...t, volume: Number(e.target.value) } : t))}
                className="w-full h-1"
                style={{ accentColor: track.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Acid Bassline Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg p-4" style={{ background: 'var(--color-surface)', border: '1px solid rgba(155,48,255,0.3)' }}>
          <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--color-purple)', fontFamily: 'var(--font-display)' }}>
            TB-303 ACID CONTROLS
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                <span>Cutoff Frequency</span>
                <span style={{ color: 'var(--color-purple)' }}>{acidCutoff} Hz</span>
              </div>
              <input
                type="range"
                min={100}
                max={4000}
                value={acidCutoff}
                data-testid="acid-cutoff"
                onChange={e => setAcidCutoff(Number(e.target.value))}
                className="w-full h-1.5"
                style={{ accentColor: 'var(--color-purple)' }}
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                <span>Resonance (Squeal)</span>
                <span style={{ color: 'var(--color-purple)' }}>{acidResonance}</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={0.5}
                value={acidResonance}
                data-testid="acid-resonance"
                onChange={e => setAcidResonance(Number(e.target.value))}
                className="w-full h-1.5"
                style={{ accentColor: 'var(--color-purple)' }}
              />
            </div>
          </div>
        </div>

        {/* Quick fills */}
        <div className="rounded-lg p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
            QUICK PATTERNS
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "4/4 Kick", action: () => fillTrack(0, 4) },
              { label: "8th Hats", action: () => fillTrack(2, 2) },
              { label: "16th Hats", action: () => fillTrack(2, 1) },
              { label: "Snare 2+4", action: () => setTracks(prev => prev.map((t, i) => i === 1 ? { ...t, steps: [false,false,false,false, true,false,false,false, false,false,false,false, true,false,false,false] } : t)) },
              { label: "Hard Kick", action: () => setTracks(prev => prev.map((t, i) => i === 0 ? { ...t, steps: [true,false,false,true, true,false,false,false, true,false,false,true, true,false,false,false] } : t)) },
              { label: "Clear All", action: () => setTracks(prev => prev.map(t => ({ ...t, steps: Array(16).fill(false) }))) },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                className="text-xs py-1.5 px-2 rounded"
                style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', transition: 'all 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save/Load */}
      <div className="rounded-lg p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>SAVE / LOAD PATTERN</h3>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={patternName}
            onChange={e => setPatternName(e.target.value)}
            data-testid="pattern-name"
            placeholder="Pattern name..."
            className="flex-1 rounded px-3 py-1.5 text-sm"
            style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
          <button
            onClick={() => savePattern.mutate()}
            disabled={savePattern.isPending}
            data-testid="save-pattern"
            className="px-4 py-1.5 rounded text-sm font-bold"
            style={{ background: 'var(--color-primary)', color: 'black', fontFamily: 'var(--font-display)' }}
          >
            {savePattern.isPending ? '...' : 'SAVE'}
          </button>
        </div>
        {savedPatterns && savedPatterns.length > 0 && (
          <div className="space-y-1">
            {savedPatterns.map(p => (
              <div key={p.id} className="flex items-center gap-2 rounded px-3 py-1.5" style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)' }}>
                <span className="flex-1 text-xs" style={{ color: 'var(--color-text)' }}>{p.name}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>{p.bpm} BPM</span>
                <button onClick={() => loadPattern(p)} className="text-xs px-2 py-0.5 rounded" style={{ color: 'var(--color-primary)', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>Load</button>
                <button onClick={() => deletePattern.mutate(p.id)} className="text-xs px-2 py-0.5 rounded" style={{ color: 'var(--color-energy)', background: 'rgba(255,0,64,0.08)', border: '1px solid rgba(255,0,64,0.2)' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
