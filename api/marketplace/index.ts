import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';
import { verifyUser } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const items = await prisma.marketplaceItem.findMany({
        where: { is_available: true },
        include: { wardrobe_item: true },
        orderBy: { created_at: 'desc' },
      });
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const { title, description, price, condition, category, size, brand, wardrobe_item_id } = req.body;
      const item = await prisma.marketplaceItem.create({
        data: {
          seller_id: user.id,
          title,
          description,
          price: parseFloat(price),
          condition,
          category,
          size,
          brand,
          wardrobe_item_id,
        },
      });
      return res.status(201).json(item);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
