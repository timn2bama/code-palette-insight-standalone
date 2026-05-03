import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';
import { verifyUser } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      // Aggregate wardrobe data
      const items = await prisma.wardrobeItem.findMany({
        where: { user_id: user.id },
      });

      const outfits = await prisma.outfit.findMany({
        where: { user_id: user.id },
      });

      const categoryDistribution = items.reduce((acc: any, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        totalItems: items.length,
        totalOutfits: outfits.length,
        categoryDistribution: Object.entries(categoryDistribution).map(([name, value]) => ({ name, value })),
        // Mocking some growth data for now
        growth: [
          { month: 'Jan', items: 10 },
          { month: 'Feb', items: 15 },
          { month: 'Mar', items: items.length },
        ]
      };

      return res.status(200).json(stats);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
