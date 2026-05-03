import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileFeatures from "@/components/MobileFeatures";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import { Smartphone, Accessibility } from "lucide-react";

const MobileAccessibility = () => {
  return (
    <>
      <SEO 
        title="Mobile & Accessibility Features"
        description="Native mobile features and accessibility tools for an inclusive wardrobe management experience"
        keywords="mobile app, accessibility, push notifications, camera integration, offline mode, voice control"
      />
      
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-20 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Mobile & Accessibility
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience SyncStyle with native mobile features and comprehensive accessibility tools
              </p>
            </div>

            <Tabs defaultValue="mobile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Features
                </TabsTrigger>
                <TabsTrigger value="accessibility" className="flex items-center gap-2">
                  <Accessibility className="h-4 w-4" />
                  Accessibility
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mobile" className="mt-0">
                <MobileFeatures />
              </TabsContent>

              <TabsContent value="accessibility" className="mt-0">
                <AccessibilityPanel />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
};

export default MobileAccessibility;