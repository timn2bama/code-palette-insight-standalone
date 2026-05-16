import { SecurityDashboard } from '@/components/SecurityDashboard';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';

const Security = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SEO 
        title="Security Dashboard - SyncStyle"
        description="Monitor your account security, manage active sessions, and review privacy settings on SyncStyle."
        keywords="security, privacy, account protection, session management"
      />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Security</h1>
          <SecurityDashboard />
        </div>
      </div>
    </div>
  );
};

export default Security;