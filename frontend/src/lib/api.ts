export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:1337';

export async function fetchAPI(path: string, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options as any).headers,
    },
  };

  const response = await fetch(`${API_URL}/api${path}`, mergedOptions);
  
  if (!response.ok) {
    console.error(response.statusText);
    throw new Error('An error occurred please try again');
  }
  
  return response.json();
}
