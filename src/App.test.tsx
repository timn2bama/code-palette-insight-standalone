import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    functions: {
      invoke: jest.fn(() => Promise.resolve({ data: { subscribed: false }, error: null })),
    },
  },
}));

describe('App Component', () => {
  it('renders without crashing', async () => {
    render(<App />);
    
    // Wait for initial loading to complete if any
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});
