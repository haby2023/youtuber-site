// YouTube Data API 중계 함수: API 키는 Vercel 환경변수 YT_API_KEY에만 보관됩니다.
// 성공한 응답은 Vercel CDN에 24시간 캐시되어 모든 방문자가 공유합니다(할당량 절약).
const ALLOWED = ['search', 'channels', 'playlistItems', 'videos'];

module.exports = async (req, res) => {
  const { path, ...params } = req.query;
  if (!ALLOWED.includes(path)) {
    return res.status(400).json({ error: { message: '허용되지 않은 요청입니다.' } });
  }
  if (!process.env.YT_API_KEY) {
    return res.status(500).json({ error: { message: '서버에 YT_API_KEY 환경변수가 설정되지 않았습니다.' } });
  }

  const u = new URL('https://www.googleapis.com/youtube/v3/' + path);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set('key', process.env.YT_API_KEY);

  const r = await fetch(u);
  const j = await r.json();
  if (!j.error) res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600');
  res.status(r.status).json(j);
};
