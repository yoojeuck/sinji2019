import { useState, useEffect, useRef, useCallback } from 'react';
import type { ActiveNote, HitFeedback, RhythmNoteData } from '../types/game';
import { PERFECT_MS, GOOD_MS } from '../data/stageConfigs';
import { playPerfect, playGood, playMiss, startBeat, stopBeat } from '../audio/soundEngine';

export interface ActiveNoteEx extends ActiveNote {
  hitTime?: number; // performance.now() when hit
}

export interface RhythmEngineState {
  notes: ActiveNoteEx[];
  currentTime: number;
  combo: number;
  maxCombo: number;
  totalScore: number;
  lastFeedback: HitFeedback | null;
  started: boolean;
  finished: boolean;
  countdown: number;
}

export function useRhythmEngine(
  noteData: RhythmNoteData[],
  bpm: number,
  onComplete: (score: number, perfect: number, good: number, miss: number) => void,
) {
  const [state, setState] = useState<RhythmEngineState>({
    notes: noteData.map(n => ({ ...n, status: 'pending' })),
    currentTime: 0,
    combo: 0,
    maxCombo: 0,
    totalScore: 0,
    lastFeedback: null,
    started: false,
    finished: false,
    countdown: 3,
  });

  const startTimeRef  = useRef(0);
  const animRef       = useRef(0);
  const notesRef      = useRef<ActiveNoteEx[]>(noteData.map(n => ({ ...n, status: 'pending' })));
  const comboRef      = useRef(0);
  const maxComboRef   = useRef(0);
  const scoreRef      = useRef(0);
  const finishedRef   = useRef(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    let count = 3;
    setState(s => ({ ...s, countdown: count }));

    const iv = setInterval(() => {
      count -= 1;
      setState(s => ({ ...s, countdown: count }));
      if (count <= 0) {
        clearInterval(iv);
        startTimeRef.current = performance.now();
        startBeat(bpm);
        setState(s => ({ ...s, started: true, countdown: 0 }));

        const tick = () => {
          if (finishedRef.current) return;
          const elapsed = performance.now() - startTimeRef.current;

          let changed = false;
          notesRef.current = notesRef.current.map(n => {
            if (n.status === 'pending' && elapsed > n.beatTime + GOOD_MS + 80) {
              comboRef.current = 0;
              changed = true;
              playMiss();
              return { ...n, status: 'miss' as const };
            }
            return n;
          });

          const allSettled = notesRef.current.every(n => n.status !== 'pending');
          const lastBeat   = noteData[noteData.length - 1]?.beatTime ?? 0;

          if (allSettled && elapsed > lastBeat + 900) {
            finishedRef.current = true;
            stopBeat();
            const perfect = notesRef.current.filter(n => n.status === 'hit-perfect').length;
            const good    = notesRef.current.filter(n => n.status === 'hit-good').length;
            const miss    = notesRef.current.filter(n => n.status === 'miss').length;
            const total   = notesRef.current.length;
            const score   = Math.round(((perfect * 100 + good * 60) / (total * 100)) * 100);
            setState(s => ({ ...s, finished: true, notes: [...notesRef.current], currentTime: elapsed }));
            onComplete(score, perfect, good, miss);
            return;
          }

          if (changed) {
            setState(s => ({ ...s, notes: [...notesRef.current], currentTime: elapsed, combo: comboRef.current }));
          } else {
            setState(s => ({ ...s, currentTime: elapsed }));
          }

          animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
      }
    }, 1000);
  }, [noteData, bpm, onComplete]);

  const hitLane = useCallback((lane: number) => {
    if (!state.started || finishedRef.current) return;
    const elapsed = performance.now() - startTimeRef.current;

    const candidates = notesRef.current
      .filter(n => n.status === 'pending' && n.lane === lane)
      .filter(n => Math.abs(elapsed - n.beatTime) <= GOOD_MS + 40)
      .sort((a, b) => Math.abs(elapsed - a.beatTime) - Math.abs(elapsed - b.beatTime));

    if (candidates.length === 0) return;

    const note = candidates[0];
    const diff = Math.abs(elapsed - note.beatTime);
    const type: 'hit-perfect' | 'hit-good' = diff <= PERFECT_MS ? 'hit-perfect' : 'hit-good';
    const pts = type === 'hit-perfect' ? 100 : 60;

    if (type === 'hit-perfect') playPerfect(); else playGood();

    comboRef.current += 1;
    if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
    scoreRef.current += pts;

    const hitNow = performance.now();
    notesRef.current = notesRef.current.map(n =>
      n.id === note.id ? { ...n, status: type, hitTime: hitNow } : n,
    );

    const feedback: HitFeedback = {
      type: type === 'hit-perfect' ? 'perfect' : 'good',
      lane,
      id: note.id,
    };

    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setState(s => ({ ...s, lastFeedback: null })), 500);

    setState(s => ({
      ...s,
      notes: [...notesRef.current],
      combo: comboRef.current,
      maxCombo: maxComboRef.current,
      totalScore: scoreRef.current,
      lastFeedback: feedback,
    }));
  }, [state.started]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      stopBeat();
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  return { state, start, hitLane };
}
