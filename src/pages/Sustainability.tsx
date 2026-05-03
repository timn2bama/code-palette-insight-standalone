import SustainabilityDashboard from '@/components/sustainability/SustainabilityDashboard';
import SEO from '@/components/SEO';

const Sustainability = () => {
  return (
    <>
      <SEO 
        title="Sustainability Dashboard - Track Your Fashion Environmental Impact"
        description="Monitor your fashion carbon footprint, track sustainability metrics, and get tips for more eco-friendly wardrobe choices."
        keywords="carbon footprint, sustainable fashion, environmental impact, eco-friendly clothing, sustainability tracking"
      />
      <SustainabilityDashboard />
    </>
  );
};

export default Sustainability;