export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:1337';

export async function fetchAPI(path: string, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    cache: 'no-store' as RequestCache,
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options as any).headers,
    },
  };

  const response = await fetch(`${API_URL}/api${path}`, mergedOptions);
  
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errData = await response.clone().json();
      console.error('API Error Response:', errData);
      if (errData.error?.message) {
        errorMsg = errData.error.message;
      }
    } catch (e) {
      console.error(response.statusText);
    }
    throw new Error(errorMsg || 'An error occurred please try again');
  }
  
  return response.json();
}
