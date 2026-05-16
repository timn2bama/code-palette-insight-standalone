import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';
import { verifyUser } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const outfits = await prisma.outfit.findMany({
        where: { user_id: user.id },
        include: { items: { include: { wardrobe_item: true } } },
        orderBy: { created_at: 'desc' },
      });
      return res.status(200).json(outfits);
    }

    if (req.method === 'POST') {
      const { name, description, occasion, season, items } = req.body;
      const outfit = await prisma.outfit.create({
        data: {
          user_id: user.id,
          name,
          description,
          occasion,
          season,
          items: {
            create: items.map((itemId: string) => ({
              wardrobe_item: { connect: { id: itemId } }
            }))
          }
        },
        include: { items: { include: { wardrobe_item: true } } }
      });
      return res.status(201).json(outfit);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Outfit ID is required' });

      await prisma.outfit.delete({
        where: { 
          id: id as string,
          user_id: user.id // Security: Ensure user owns the outfit
        },
      });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
