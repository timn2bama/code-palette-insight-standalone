import AIStylistDashboard from '@/components/ai-stylist/AIStylistDashboard';
import SEO from '@/components/SEO';

const AIStylist = () => {
  return (
    <>
      <SEO 
        title="AI Personal Stylist - Your Fashion Assistant"
        description="Get daily outfit suggestions, event styling advice, and personalized fashion recommendations powered by AI technology."
        keywords="AI stylist, outfit suggestions, personal fashion assistant, style recommendations, daily outfits"
      />
      <AIStylistDashboard />
    </>
  );
};

export default AIStylist;