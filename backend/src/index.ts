import express from 'express';
import cors from 'cors';
import scoresRouter from './routes/scores';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/scores', scoresRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: '롤케이크 서버 가동 중 🎂' });
});

app.listen(PORT, () => {
  console.log(`🎂 롤케이크 백엔드 서버 시작: http://localhost:${PORT}`);
});
