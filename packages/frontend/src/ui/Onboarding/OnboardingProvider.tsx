import React, { createContext, useContext, useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface OnboardingContextType {
  startTour: (tourId: string) => void;
  endTour: () => void;
  isActive: boolean;
  completedTours: string[];
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
  tours: Record<string, Step[]>;
  defaultActiveTour?: string;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  tours,
  defaultActiveTour,
}) => {
  const [activeTour, setActiveTour] = useState<string | null>(defaultActiveTour || null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [run, setRun] = useState(false);
  const [completedTours, setCompletedTours] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedTours');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (activeTour && tours[activeTour]) {
      setSteps(tours[activeTour]);
      setRun(true);
    } else {
      setSteps([]);
      setRun(false);
    }
  }, [activeTour, tours]);

  useEffect(() => {
    localStorage.setItem('completedTours', JSON.stringify(completedTours));
  }, [completedTours]);

  const startTour = (tourId: string) => {
    if (tours[tourId]) {
      setActiveTour(tourId);
    }
  };

  const endTour = () => {
    setActiveTour(null);
    setRun(false);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      if (activeTour && !completedTours.includes(activeTour)) {
        setCompletedTours([...completedTours, activeTour]);
      }
      setRun(false);
      setActiveTour(null);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        startTour,
        endTour,
        isActive: run,
        completedTours,
      }}
    >
      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        showProgress
        styles={{
          options: {
            primaryColor: 'var(--color-primary)',
            zIndex: 1500,
          },
        }}
        callback={handleJoyrideCallback}
      />
      {children}
    </OnboardingContext.Provider>
  );
};