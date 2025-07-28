// Service to call Vertex AI Gemini backend
export async function sendMessageToVertexAI(message) {
  const url = `https://humming-bird-466715-f5.uc.r.appspot.com/ai/generate?message=${(message)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.text();
  console.log(data)
  // Try to return the most likely property, or the whole response as string
  return data;
} 