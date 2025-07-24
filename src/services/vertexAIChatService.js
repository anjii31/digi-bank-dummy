// Service to call Vertex AI Gemini backend
export async function sendMessageToVertexAI(message) {
  const res = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  return data.text;
} 