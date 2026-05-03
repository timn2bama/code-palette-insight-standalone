import MarketplaceHome from '@/components/marketplace/MarketplaceHome';
import SEO from '@/components/SEO';

const Marketplace = () => {
  return (
    <>
      <SEO 
        title="Fashion Marketplace - Buy & Sell Pre-loved Fashion"
        description="Discover sustainable fashion through our marketplace. Buy and sell pre-loved items, rent designer pieces, and reduce your environmental impact."
        keywords="sustainable fashion, pre-loved clothing, fashion marketplace, eco-friendly shopping, rental fashion"
      />
      <MarketplaceHome />
    </>
  );
};

export default Marketplace;