import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyUser } from '../lib/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const filename = req.query.filename as string;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Since bodyParser is disabled, we pipe the request stream directly to Vercel Blob
    const blob = await put(filename, req, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json(blob);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
