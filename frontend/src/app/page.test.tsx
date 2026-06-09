import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  it('renders the Sign in button', () => {
    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /Sign in/i });
    expect(button).toBeInTheDocument();
  });
  
  it('renders the email input field', () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/Enter your email/i);
    expect(emailInput).toBeInTheDocument();
  });
});
