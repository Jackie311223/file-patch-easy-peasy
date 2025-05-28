import React, { useEffect, useState } from 'react';
import { useToast } from '@/ui/Toast/ToastProvider';

interface SmartSuggestionProps {
  userAction: string;
  suggestions: {
    action: string;
    message: string;
    actionLabel: string;
    onAction: () => void;
  }[];
  delay?: number;
}

export const SmartSuggestion: React.FC<SmartSuggestionProps> = ({
  userAction,
  suggestions,
  delay = 1000,
}) => {
  const { toast } = useToast();
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    if (userAction && userAction !== lastAction) {
      setLastAction(userAction);
      
      // Find matching suggestion
      const matchingSuggestion = suggestions.find(
        suggestion => suggestion.action === userAction
      );
      
      if (matchingSuggestion) {
        // Delay suggestion to avoid interrupting user flow
        const timer = setTimeout(() => {
          toast(matchingSuggestion.message, {
            type: 'info',
            duration: 8000,
            action: {
              label: matchingSuggestion.actionLabel,
              onClick: matchingSuggestion.onAction,
            },
          });
        }, delay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [userAction, suggestions, toast, lastAction, delay]);

  // This is a utility component that doesn't render anything
  return null;
};

// Example usage:
export const BookingSuggestions = () => {
  const [userAction, setUserAction] = useState('');
  
  // This would be connected to your app's state management
  useEffect(() => {
    // Listen for user actions
    const handleBookingCreated = () => {
      setUserAction('booking_created');
    };
    
    // Cleanup
    return () => {
      // Remove event listeners
    };
  }, []);
  
  return (
    <SmartSuggestion
      userAction={userAction}
      suggestions={[
        {
          action: 'booking_created',
          message: 'Bạn vừa tạo booking mới. Bạn có muốn thu tiền đặt cọc không?',
          actionLabel: 'Thu tiền ngay',
          onAction: () => {
            // Navigate to payment creation or open payment modal
            console.log('Navigate to payment creation');
          },
        },
        {
          action: 'payment_received',
          message: 'Thanh toán đã được xác nhận. Bạn có muốn tạo hóa đơn không?',
          actionLabel: 'Tạo hóa đơn',
          onAction: () => {
            // Navigate to invoice creation
            console.log('Navigate to invoice creation');
          },
        },
      ]}
    />
  );
};
