import { Router } from 'express';
import type { Request, Response } from 'express';

interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}

const scores: ScoreEntry[] = [];

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const top10 = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  res.json(top10);
});

router.post('/', (req: Request, res: Response) => {
  const { name, score } = req.body as { name?: string; score?: number };
  if (typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: '이름이 필요합니다.' });
    return;
  }
  if (typeof score !== 'number' || score < 0 || score > 100) {
    res.status(400).json({ error: '유효하지 않은 점수입니다.' });
    return;
  }
  const entry: ScoreEntry = {
    name: name.trim().slice(0, 10),
    score,
    date: new Date().toLocaleDateString('ko-KR'),
  };
  scores.push(entry);
  res.status(201).json(entry);
});

export default router;
