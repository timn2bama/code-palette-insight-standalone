import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Search, HelpCircle, BookOpen, Settings, Smartphone } from "lucide-react";
import { PrivacyControls } from "@/components/PrivacyControls";
import { useAuth } from "@/contexts/AuthContext";
import { generateFAQJsonLd } from "@/utils/seo";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const faqCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      faqs: [
        {
          question: "How do I create my first wardrobe item?",
          answer: "Navigate to your Wardrobe page and click 'Add New Item'. You can upload photos, add details like brand, color, and category. The more information you add, the better our recommendations will be!"
        },
        {
          question: "What's the best way to organize my wardrobe?",
          answer: "Start by categorizing your items (tops, bottoms, dresses, etc.) and add colors and brands. Take clear photos of each item. Use the analytics to see which pieces you wear most often."
        },
        {
          question: "How do outfit suggestions work?",
          answer: "Our AI analyzes your wardrobe items, current weather conditions, and your style preferences to suggest complete outfits. The more you use the app and mark items as worn, the better the suggestions become."
        }
      ]
    },
    {
      id: "features",
      title: "Features & Functions",
      icon: Settings,
      faqs: [
        {
          question: "How do I mark an item as worn?",
          answer: "You can mark items as worn from the wardrobe view by clicking the 'Mark as Worn' button, or from the item details dialog. This helps track your usage patterns and improve recommendations."
        },
        {
          question: "Can I create outfit collections?",
          answer: "Yes! Use the Outfit Creator to build and save outfit combinations. You can organize them by occasion, season, or any way that works for you."
        },
        {
          question: "How does weather integration work?",
          answer: "SyncStyle automatically gets your local weather and suggests appropriate clothing. You can also save weather-based outfit suggestions to your collection for future use."
        },
        {
          question: "What are the analytics features?",
          answer: "The analytics show your most worn items, wardrobe usage patterns, and help you identify pieces you might want to donate or style differently."
        }
      ]
    },
    {
      id: "mobile",
      title: "Mobile & Photos",
      icon: Smartphone,
      faqs: [
        {
          question: "Can I take photos directly with my phone camera?",
          answer: "Yes! When adding photos to wardrobe items, you can choose 'Take Photo' to use your device's camera, or 'From Gallery' to select existing photos."
        },
        {
          question: "What's the best way to photograph clothing items?",
          answer: "Use good lighting, lay items flat or hang them, and try to capture the full item. Multiple angles can be helpful for items with details you want to remember."
        },
        {
          question: "Is there a mobile app?",
          answer: "SyncStyle is a web app that works great on mobile browsers. You can add it to your home screen for quick access. We're working on native mobile apps for the future!"
        }
      ]
    },
    {
      id: "account",
      title: "Account & Subscription",
      icon: HelpCircle,
      faqs: [
        {
          question: "What's included in the free version?",
          answer: "The free version includes basic wardrobe tracking, outfit creation, and weather suggestions. Premium features include advanced analytics, unlimited storage, and priority support."
        },
        {
          question: "How do I upgrade to premium?",
          answer: "Go to the Subscription page and choose your plan. We offer monthly and annual billing options with secure payment through Stripe."
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time through your account settings or the customer portal. Your data will remain accessible."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact us at syncstyleonline@gmail.com to request account deletion. We'll permanently remove your data within 30 days."
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <>
      <SEO 
        title="SyncStyle Help Center - FAQ & Support"
        description="Find answers to common questions about wardrobe management, outfit creation, weather integration, and account settings in our comprehensive help center."
        keywords="syncstyle help, faq, wardrobe management help, outfit creator guide, weather integration, account support"
        url="/help"
        jsonLd={generateFAQJsonLd()}
      />
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-primary mb-6">Help Center</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Find answers to common questions and learn how to make the most of SyncStyle
            </p>
          </div>

          {/* Search */}
          <Card className="shadow-card mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {filteredFAQs.map((category) => (
              <Card key={category.id} className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <category.icon className="h-6 w-6 text-fashion-gold" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Privacy & Data Controls */}
          {user && (
            <div className="mt-8">
              <PrivacyControls />
            </div>
          )}

          {/* Contact Support */}
          <Card className="shadow-card mt-8 bg-secondary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-primary mb-4">
                Still need help?
              </h3>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="default"
                  onClick={() => window.location.href = "/contact"}
                >
                  Contact Support
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "mailto:syncstyleonline@gmail.com"}
                >
                  Email Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
};

export default Help;