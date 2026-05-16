import { render, waitFor } from '@testing-library/react';
import App from './App';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { subscribed: false }, error: null })),
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
