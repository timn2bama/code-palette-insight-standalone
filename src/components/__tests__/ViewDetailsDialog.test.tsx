import { render, screen, fireEvent } from '@testing-library/react';
import ViewDetailsDialog from '../ViewDetailsDialog';
import { vi, expect, test, describe, beforeEach } from 'vitest';
import React from 'react';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: { from: vi.fn() },
    from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({ data: [], error: null })
            })
        })
    }),
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockItem = {
  id: '1',
  name: 'Test Item',
  category: 'tops',
  wearCount: 0,
  lastWorn: 'Never',
  color: 'Black',
  brand: 'Test Brand',
  photo_url: null,
  description: '<img src=x onerror=alert(1)> Safe description'
};

describe('ViewDetailsDialog', () => {
  test('sanitizes description to prevent XSS', async () => {
    render(
      <ViewDetailsDialog item={mockItem as any}>
        <button>Open</button>
      </ViewDetailsDialog>
    );
    
    // Open the dialog
    fireEvent.click(screen.getByText('Open'));
    
    // Check if "Safe description" is present
    const descriptionText = await screen.findByText(/Safe description/);
    expect(descriptionText).toBeDefined();
    
    // The img tag should be sanitized (onerror removed)
    const imgElement = document.querySelector('img[src="x"]');
    if (imgElement) {
        expect(imgElement.getAttribute('onerror')).toBeNull();
    }
  });
});
