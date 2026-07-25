/**
 * Consume Server-Sent Events (SSE) stream using fetch reader API.
 * This bypasses native EventSource limitations and supports custom headers (e.g. JWT Auth).
 */
export const consumeSSE = async (
  path: string,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: any) => void
) => {
  const token = localStorage.getItem('token');
  // Support both absolute and relative backend pathways
  const baseUrl = 'http://localhost:8000/api/v1';
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response stream reader is not available');
    }

    const decoder = new TextDecoder('utf-8');
    let chunkBuffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      chunkBuffer += decoder.decode(value, { stream: true });
      const lines = chunkBuffer.split('\n');
      chunkBuffer = lines.pop() || ''; // Hold onto unfinished chunks

      for (const line of lines) {
        const cleanLine = line.trim();
        if (cleanLine.startsWith('data: ')) {
          try {
            const data = JSON.parse(cleanLine.slice(6));
            if (data.token) {
              onToken(data.token);
            } else if (data.error) {
              onError(new Error(data.error));
            }
          } catch (jsonErr) {
            // Silence JSON parsing errors on partial messages
          }
        }
      }
    }

    onComplete();
  } catch (err: any) {
    onError(err);
  }
};
