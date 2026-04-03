// Mock all external dependencies at the top level
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => <div data-testid="route">{element}</div>,
  NavLink: ({ children, to }) => <a href={to} data-testid="nav-link">{children}</a>
}));

jest.mock('./supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}));

jest.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('./JournalPage', () => {
  return function MockJournalPage() {
    return <div data-testid="journal-page">Journal Page</div>;
  };
});

jest.mock('./DashboardPage', () => {
  return function MockDashboardPage() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

jest.mock('./PerformancePage', () => {
  return function MockPerformancePage() {
    return <div data-testid="performance-page">Performance Page</div>;
  };
});

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders trading journal app', () => {
  render(<App />);

  expect(screen.getByText('Trading Journal')).toBeInTheDocument();
  expect(screen.getByTestId('browser-router')).toBeInTheDocument();
});
