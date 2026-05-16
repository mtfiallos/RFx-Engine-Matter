// Service for interacting with Google Drive via backend proxy
// No longer requires OAuth Tokens from the frontend.

export async function createFolder(token: string | null, name: string, parentId?: string): Promise<string> {
  const response = await fetch('/api/drive/folder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, parentId })
  });

  if (!response.ok) {
    const errBody = await response.text(); 
    console.error('Drive API Error:', errBody); 
    throw new Error('Failed to create folder in Google Drive: ' + errBody);
  }

  const data = await response.json();
  return data.id;
}

export async function uploadFileToDrive(token: string | null, file: File, parentId: string): Promise<string> {
  const form = new FormData();
  form.append('folderId', parentId); // Must be before file for some parsers
  form.append('file', file);

  const response = await fetch('/api/drive/upload', {
    method: 'POST',
    body: form
  });

  if (!response.ok) {
    const errBody = await response.text(); 
    console.error('Drive API Error (Upload):', errBody); 
    throw new Error('Failed to upload file to Google Drive: ' + errBody);
  }

  const data = await response.json();
  return data.fileId || data.id;
}

export async function findFolderByName(token: string | null, name: string): Promise<string | null> {
  const response = await fetch(`/api/drive/folder/search?name=${encodeURIComponent(name)}`);

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.id;
}

export async function getFolderContents(token: string | null, folderId: string): Promise<any[]> {
  const response = await fetch(`/api/drive/folder/${folderId}/contents`);

  if (!response.ok) return [];

  const data = await response.json();
  return data.files || [];
}

export async function getFileInfo(token: string | null, fileId: string): Promise<any> {
  const response = await fetch(`/api/drive/file/${fileId}/info`);
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  return data.file || null;
}

export async function deleteFile(token: string | null, fileId: string): Promise<void> {
  const response = await fetch(`/api/drive/file/${fileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error('Drive API Error (Delete):', errBody);
    throw new Error('Failed to delete file from Google Drive: ' + errBody);
  }
}

