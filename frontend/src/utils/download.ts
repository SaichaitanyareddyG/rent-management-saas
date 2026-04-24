/**
 * Download a file from a blob or URL
 */
export const downloadFile = (data: Blob | string, filename: string, type?: string) => {
  const blob = typeof data === 'string' ? new Blob([data], { type: type || 'text/plain' }) : data;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Download CSV file from API endpoint
 */
export const downloadCsvFromApi = async (endpoint: string, filename: string, token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Get token from localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
  }
  
  const response = await fetch(endpoint, { headers });
  
  if (!response.ok) {
    throw new Error('Failed to download CSV');
  }
  
  const blob = await response.blob();
  downloadFile(blob, filename);
};
