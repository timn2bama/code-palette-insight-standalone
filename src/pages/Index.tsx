import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  generateOrganizationJsonLd, 
  generateWebsiteJsonLd, 
  generateFAQJsonLd,
  generateSoftwareApplicationJsonLd,
  generateServiceJsonLd,
  generateHowToJsonLd
} from "@/utils/seo";
import { generateVoiceSearchContent } from "@/utils/ai-seo";
import heroImage from "@/assets/hero-wardrobe.webp";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <SEO 
        title="SyncStyle - Smart Wardrobe & Outfit Management | AI-Powered Style Assistant"
        description="Transform your wardrobe with SyncStyle's AI-powered fashion assistant. Organize clothes digitally, create perfect outfits, get weather-based style recommendations, and discover local fashion services. Free smart wardrobe management for modern style."
        keywords="AI fashion assistant, smart wardrobe management, digital closet organizer, weather outfit suggestions, style planning app, clothing organization, fashion AI, wardrobe analytics, outfit creator, personal stylist app"
        url="/"
        aiOptimized={true}
        jsonLd={[
          generateOrganizationJsonLd(), 
          generateWebsiteJsonLd(),
          generateSoftwareApplicationJsonLd(),
          generateServiceJsonLd(),
          generateFAQJsonLd(),
          generateHowToJsonLd()
        ]}
      />
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
               <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                Your Smart
                <span className="text-transparent bg-clip-text bg-gradient-accent"> Wardrobe</span>
                <br />Assistant
               </h1>
               
               {/* Hidden content for AI voice search optimization */}
               <div className="sr-only" aria-hidden="true">
                 {generateVoiceSearchContent().map((query, index) => (
                   <span key={index}>{query} </span>
                 ))}
               </div>
               <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Track your style, create perfect outfits, and never miss a sale on your favorite pieces. 
                <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-accent"> SyncStyle</span> makes wardrobe management effortless and elegant.
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                 {user ? (
                   <>
                     <Button 
                       variant="premium" 
                       size="lg" 
                       className="text-lg px-8 py-6"
                       onClick={() => navigate('/wardrobe')}
                       aria-label="Start organizing your wardrobe with SyncStyle"
                     >
                       ✨ Start Organizing
                     </Button>
                     <Button 
                       variant="elegant" 
                       size="lg" 
                       className="text-lg px-8 py-6"
                       onClick={() => navigate('/wardrobe')}
                       aria-label="View your digital wardrobe"
                     >
                       👔 View Wardrobe
                     </Button>
                   </>
                 ) : (
                   <>
                     <Button 
                       variant="premium" 
                       size="lg" 
                       className="text-lg px-8 py-6"
                       onClick={() => navigate('/auth')}
                       aria-label="Get started with SyncStyle wardrobe management"
                     >
                       ✨ Get Started
                     </Button>
                     <Button 
                       variant="elegant" 
                       size="lg" 
                       className="text-lg px-8 py-6"
                       onClick={() => navigate('/auth')}
                       aria-label="Sign in to your SyncStyle account"
                     >
                       🔐 Sign In
                     </Button>
                   </>
                 )}
               </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-accent rounded-3xl blur-2xl opacity-20"></div>
              <img 
                src={heroImage} 
                alt="Elegant organized wardrobe with smart clothing management system showing various outfits and style options"
                className="relative z-10 rounded-3xl shadow-elegant w-full"
                loading="eager"
                width="600"
                height="400"
                fetchpriority="high"
              />
            </div>
          </div>
        </div>
      </section>

       {/* Features Section */}
       <section className="container mx-auto px-4 pb-16" aria-labelledby="features-heading">
         <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
           Transform Your Style with AI-Powered Features
         </h2>
         
         {/* Featured content for AI understanding */}
         <div className="text-center mb-12">
           <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
             Discover how artificial intelligence revolutionizes wardrobe management. From smart outfit recommendations 
             to weather-based styling, SyncStyle uses advanced AI to understand your preferences and create perfect looks 
             for every occasion. Experience the future of personal styling with our intelligent fashion assistant.
           </p>
         </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <article className="group">
            <Card 
              className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer h-full"
              onClick={() => navigate('/wardrobe')}
              role="button"
              tabIndex={0}
              aria-label="Access Smart Wardrobe feature"
            >
               <CardContent className="p-6 text-center">
                 <div className="text-4xl mb-4" role="img" aria-label="Wardrobe icon">👔</div>
                 <h3 className="font-semibold text-primary mb-2">Smart Wardrobe</h3>
                 <p className="text-sm text-muted-foreground">
                   Digital closet organization with AI-powered analytics. Upload photos, categorize by color and style, 
                   track wear frequency, and get insights into your fashion habits. Perfect for minimalist wardrobes and extensive collections.
                 </p>
               </CardContent>
            </Card>
          </article>
          
          <article className="group">
            <Card 
              className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer h-full"
              onClick={() => navigate('/outfits')}
              role="button"
              tabIndex={0}
              aria-label="Access Outfit Creator feature"
            >
               <CardContent className="p-6 text-center">
                 <div className="text-4xl mb-4" role="img" aria-label="Sparkles icon">✨</div>
                 <h3 className="font-semibold text-primary mb-2">AI Outfit Creator</h3>
                 <p className="text-sm text-muted-foreground">
                   Intelligent outfit planning with machine learning algorithms. Mix and match clothing items, 
                   get AI styling suggestions, and create looks for work, casual, formal, and special occasions.
                 </p>
               </CardContent>
            </Card>
          </article>
          
          <article className="group">
            <Card 
              className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer h-full"
              onClick={() => navigate('/weather')}
              role="button"
              tabIndex={0}
              aria-label="Access Weather Sync feature"
            >
               <CardContent className="p-6 text-center">
                 <div className="text-4xl mb-4" role="img" aria-label="Weather icon">🌤️</div>
                 <h3 className="font-semibold text-primary mb-2">Weather-Smart Styling</h3>
                 <p className="text-sm text-muted-foreground">
                   Real-time weather integration for climate-appropriate outfit recommendations. AI analyzes temperature, 
                   humidity, precipitation, and UV index to suggest perfect clothing combinations for any weather condition.
                 </p>
               </CardContent>
            </Card>
          </article>
          
          <article className="group">
            <Card 
              className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer h-full"
              onClick={() => navigate('/services')}
              role="button"
              tabIndex={0}
              aria-label="Access Local Services feature"
            >
               <CardContent className="p-6 text-center">
                 <div className="text-4xl mb-4" role="img" aria-label="Shopping icon">🛍️</div>
                 <h3 className="font-semibold text-primary mb-2">Fashion Services Network</h3>
                 <p className="text-sm text-muted-foreground">
                   Discover local fashion professionals including personal stylists, tailors, dry cleaners, and boutiques. 
                   Connect with experts for alterations, styling consultations, and wardrobe refresh services.
                 </p>
               </CardContent>
            </Card>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-primary mb-4">SyncStyle</h3>
              <p className="text-muted-foreground text-sm">
                Your smart wardrobe assistant for effortless style management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-4">Support</h4>
              <p className="text-muted-foreground text-sm mb-2">
                Need help? Contact us:
              </p>
              <a 
                href="mailto:syncstyleonline@gmail.com" 
                className="text-primary hover:underline text-sm"
              >
                syncstyleonline@gmail.com
              </a>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} SyncStyle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default Index;
