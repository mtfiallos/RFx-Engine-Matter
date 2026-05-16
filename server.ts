import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import { google } from 'googleapis';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .data/uploads directory exists
const uploadDir = path.join(process.cwd(), '.data', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

// Initialize Google Drive Service
function getDriveService() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Drive credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN) are not set up.');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground' // Expected redirect URI for the Playground method
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON parsing middleware
  app.use(express.json());

  // API Routes MUST be defined before Vite middleware
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'active' });
  });

  // Upload file to shared Google Drive folder
  app.post('/api/drive/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      const folderId = req.body.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;
      if (!folderId) {
        throw new Error('GOOGLE_DRIVE_FOLDER_ID is not configured on the server and no folderId was provided in the request.');
      }

      const drive = getDriveService();
      
      const fileMetadata = {
        name: req.body.fileName || req.file.originalname,
        parents: [folderId]
      };
      
      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path)
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink',
        supportsAllDrives: true
      });

      // Cleanup local temp file
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        fileId: response.data.id,
        name: response.data.name,
        url: response.data.webViewLink
      });
    } catch (error) {
      console.error('Drive upload failed:', error);
      // Ensure we cleanup the temp file even on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ 
        error: 'Failed to upload to Google Drive',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create folder
  app.post('/api/drive/folder', async (req, res) => {
    try {
      const { name, parentId } = req.body;
      if (!name) return res.status(400).json({ error: 'Folder name is required' });

      const drive = getDriveService();
      const folderMetadata: any = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
      };
      
      if (parentId) {
        folderMetadata.parents = [parentId];
      } else if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
        folderMetadata.parents = [process.env.GOOGLE_DRIVE_FOLDER_ID];
      }

      const response = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
        supportsAllDrives: true
      });

      res.json({ id: response.data.id });
    } catch (error: any) {
      console.error('Create folder failed:', error);
      res.status(500).json({ 
        error: 'Failed to create folder',
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Find folder by name
  app.get('/api/drive/folder/search', async (req, res) => {
    try {
      const { name } = req.query;
      if (!name) return res.status(400).json({ error: 'Name parameter is required' });

      const drive = getDriveService();
      const response = await drive.files.list({
        q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        corpora: 'allDrives'
      });

      const files = response.data.files || [];
      res.json({ id: files.length > 0 ? files[0].id : null });
    } catch (error: any) {
      console.error('Search folder failed:', error);
      res.status(500).json({ 
        error: 'Failed to search folder',
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Get folder contents
  app.get('/api/drive/folder/:folderId/contents', async (req, res) => {
    try {
      const { folderId } = req.params;
      const drive = getDriveService();
      
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, webViewLink, iconLink)',
        spaces: 'drive',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });

      res.json({ files: response.data.files || [] });
    } catch (error: any) {
      console.error('Get folder contents failed:', error);
      res.status(500).json({ 
        error: 'Failed to get folder contents',
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Get file info
  app.get('/api/drive/file/:fileId/info', async (req, res) => {
    try {
      const { fileId } = req.params;
      const drive = getDriveService();
      
      const response = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType',
        supportsAllDrives: true,
      });

      res.status(200).json({ success: true, file: response.data });
    } catch (error: any) {
      console.error('Info file failed:', error);
      res.status(500).json({ 
        error: 'Failed to get info',
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Delete file
  app.delete('/api/drive/file/:fileId', async (req, res) => {
    try {
      const { fileId } = req.params;
      const drive = getDriveService();
      
      await drive.files.delete({
        fileId: fileId,
        supportsAllDrives: true,
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Delete file failed:', error);
      res.status(500).json({ 
        error: 'Failed to delete file',
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Webhook for receiving inbound emails (e.g. from SendGrid or Mailgun)
  app.post('/api/webhooks/inbound-email', async (req, res) => {
    try {
       console.log("Received inbound email webhook:", req.body);
       res.status(200).json({ received: true });
    } catch(e) {
       res.status(500).json({ error: String(e) });
    }
  });

  // Webhook for receiving inbound Google Chat events
  app.post('/api/webhooks/google-chat', async (req, res) => {
    try {
      console.log("Received Google Chat message:", req.body);
      const event = req.body;
      
      // If someone messages the bot
      if (event.type === 'MESSAGE' && event.message) {
        const text = event.message.text || '';
        console.log("Chat Message Text:", text);

        let replyText = "Hello! I am Elyria, your RFx AI assistant.";

        if (text.toLowerCase().includes('new submission')) {
          replyText = "I've started a new submission pipeline. Please reply with the RFx documents attached, or link them in your next message. Once received, I will confirm the generation.";
        } else if (event.message.attachment && event.message.attachment.length > 0) {
          replyText = `Received ${event.message.attachment.length} artifacts to process for the open submission pipeline. I am now ingesting them.`;
        } else if (text.toLowerCase().includes('status')) {
          replyText = "All active submission pipelines are nominal. Type 'new submission' to begin a new one.";
        }

        res.status(200).json({
          text: replyText
        });
        return;
      }

      // Default acknowledgment
      res.status(200).json({ text: "Webhook received." });
    } catch(e) {
      console.error(e);
      res.status(500).json({ error: String(e) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server failed to start", error);
  process.exit(1);
});
