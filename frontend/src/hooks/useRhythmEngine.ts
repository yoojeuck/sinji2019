import { useState, useEffect, useRef, useCallback } from 'react';
import type { ActiveNote, HitFeedback, RhythmNoteData } from '../types/game';
import { PERFECT_MS, GOOD_MS } from '../data/stageConfigs';

export interface RhythmEngineState {
  notes: ActiveNote[];
  currentTime: number;
  combo: number;
  maxCombo: number;
  totalScore: number;
  lastFeedback: HitFeedback | null;
  started: boolean;
  finished: boolean;
  countdown: number; // 3,2,1,0 = go
}

export function useRhythmEngine(
  noteData: RhythmNoteData[],
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
  const notesRef      = useRef<ActiveNote[]>(noteData.map(n => ({ ...n, status: 'pending' })));
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
        setState(s => ({ ...s, started: true, countdown: 0 }));

        const tick = () => {
          if (finishedRef.current) return;
          const elapsed = performance.now() - startTimeRef.current;

          // auto-miss notes that passed hit window
          let changed = false;
          notesRef.current = notesRef.current.map(n => {
            if (n.status === 'pending' && elapsed > n.beatTime + GOOD_MS + 80) {
              comboRef.current = 0;
              changed = true;
              return { ...n, status: 'miss' as const };
            }
            return n;
          });

          const allSettled = notesRef.current.every(n => n.status !== 'pending');
          const lastBeat = noteData[noteData.length - 1]?.beatTime ?? 0;

          if (allSettled && elapsed > lastBeat + 800) {
            finishedRef.current = true;
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
            setState(s => ({
              ...s,
              notes: [...notesRef.current],
              currentTime: elapsed,
              combo: comboRef.current,
            }));
          } else {
            setState(s => ({ ...s, currentTime: elapsed }));
          }

          animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
      }
    }, 1000);
  }, [noteData, onComplete]);

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

    comboRef.current += 1;
    if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
    scoreRef.current += pts;

    notesRef.current = notesRef.current.map(n =>
      n.id === note.id ? { ...n, status: type } : n,
    );

    const feedback: HitFeedback = {
      type: type === 'hit-perfect' ? 'perfect' : 'good',
      lane,
      id: note.id,
    };

    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => {
      setState(s => ({ ...s, lastFeedback: null }));
    }, 420);

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
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  return { state, start, hitLane };
}
