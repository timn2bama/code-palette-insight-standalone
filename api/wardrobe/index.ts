import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';
import { verifyUser } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await verifyUser(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const items = await prisma.wardrobeItem.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
      });
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const { name, category, brand, color, photo_url } = req.body;
      const item = await prisma.wardrobeItem.create({
        data: {
          user_id: user.id,
          name,
          category,
          brand,
          color,
          photo_url,
        },
      });
      return res.status(201).json(item);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
