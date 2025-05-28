import React from 'react';
import { ThemeProvider } from '../theme/ThemeProvider';
import { TenantThemeProvider } from '../theme/TenantThemeProvider';
import { ToastProvider } from '@/ui/Toast/ToastProvider';
import { LoadingProvider } from '@/ui/Loading/LoadingProvider';
import { OnboardingProvider } from '@/ui/Onboarding/OnboardingProvider';

// Placeholder for onboarding tours - in a real implementation, this would be more extensive
const tours = {
  welcome: [
    {
      target: '.sidebar',
      content: 'This is the main navigation menu where you can access all features.',
      disableBeacon: true,
    },
    {
      target: '.user-profile',
      content: 'Click here to access your profile settings and preferences.',
    },
    {
      target: '.dashboard-overview',
      content: 'This dashboard gives you an overview of your properties and bookings.',
    },
  ],
  bookings: [
    {
      target: '.booking-filters',
      content: 'Use these filters to find specific bookings.',
      disableBeacon: true,
    },
    {
      target: '.create-booking-button',
      content: 'Click here to create a new booking.',
    },
  ],
};

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LoadingProvider>
          <TenantThemeProvider>
            <OnboardingProvider tours={tours}>
              {children}
            </OnboardingProvider>
          </TenantThemeProvider>
        </LoadingProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};
