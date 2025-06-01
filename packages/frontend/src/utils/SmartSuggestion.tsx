import React, { useState, useEffect, useCallback } from 'react';
import { useToast, ToastOptions } from '@/ui/Toast/ToastProvider'; // Import ToastOptions

interface Suggestion {
  action: string; 
  message: string; // Sửa: message của suggestion nên là string để truyền cho addToast
  actionLabel: string; 
  onAction: () => void; 
}

interface SmartSuggestionProps {
  userAction: string | null | undefined; 
  suggestions: Suggestion[]; 
  delay?: number; 
}

export const SmartSuggestion: React.FC<SmartSuggestionProps> = ({
  userAction,
  suggestions,
  delay = 2000, 
}) => {
  const { addToast } = useToast(); 
  const [lastProcessedAction, setLastProcessedAction] = useState<string | null>(null);

  useEffect(() => {
    if (userAction && userAction !== lastProcessedAction) {
      const matchingSuggestion = suggestions.find(
        suggestion => suggestion.action === userAction
      );
      
      if (matchingSuggestion) {
        setLastProcessedAction(userAction); 

        const timer = setTimeout(() => {
          // Sửa: addToast mong đợi message là string.
          // Nếu matchingSuggestion.message là ReactNode, cần chuyển đổi hoặc đảm bảo nó là string.
          // Giả sử matchingSuggestion.message đã là string theo định nghĩa Suggestion mới.
          const toastOptions: ToastOptions = { 
            type: 'info', 
            duration: 8000, 
            title: 'Smart Suggestion', 
            action: {
              label: matchingSuggestion.actionLabel,
              onClick: () => {
                matchingSuggestion.onAction();
              },
            },
          };
          addToast(matchingSuggestion.message, toastOptions);
        }, delay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [userAction, suggestions, addToast, lastProcessedAction, delay]);

  return null;
};

// Example usage:
type BookingAction = 'booking_created' | 'payment_received_for_booking' | 'booking_checked_in';

export const BookingProcessSuggestions: React.FC = () => {
  const [currentUserAction, setCurrentUserAction] = useState<BookingAction | ''>('');
  
  const simulateUserAction = (action: BookingAction) => {
    console.log(`Simulating user action: ${action}`);
    setCurrentUserAction(action);
    setTimeout(() => setCurrentUserAction(''), 50); 
  };
  
  // Sửa: message của suggestion phải là string
  const bookingRelatedSuggestions: Suggestion[] = [
    {
      action: 'booking_created',
      message: 'Bạn vừa tạo booking mới. Bạn có muốn thu tiền đặt cọc không?', // Đây là string
      actionLabel: 'Thu tiền ngay',
      onAction: () => {
        console.log('Action: Navigate to payment creation for new booking.');
      },
    },
    {
      action: 'payment_received_for_booking',
      message: 'Thanh toán đặt cọc đã được xác nhận. Bạn có muốn tạo hóa đơn không?', // Đây là string
      actionLabel: 'Tạo hóa đơn',
      onAction: () => {
        console.log('Action: Navigate to invoice creation for booking.');
      },
    },
    {
      action: 'booking_checked_in',
      message: 'Khách vừa check-in. Bạn có muốn xem chi tiết phòng và dịch vụ không?', // Đây là string
      actionLabel: 'Xem chi tiết',
      onAction: () => {
        console.log('Action: Navigate to room details/services for checked-in booking.');
      },
    },
  ];
  
  return (
    <div>
      <SmartSuggestion
        userAction={currentUserAction}
        suggestions={bookingRelatedSuggestions}
        delay={1000} 
      />
      
      <div className="p-4 space-x-2">
        <button 
          onClick={() => simulateUserAction('booking_created')}
          className="px-3 py-2 bg-blue-500 text-white rounded"
        >
          Simulate Booking Created
        </button>
        <button 
          onClick={() => simulateUserAction('payment_received_for_booking')}
          className="px-3 py-2 bg-green-500 text-white rounded"
        >
          Simulate Payment Received
        </button>
         <button 
          onClick={() => simulateUserAction('booking_checked_in')}
          className="px-3 py-2 bg-purple-500 text-white rounded"
        >
          Simulate Guest Check-in
        </button>
      </div>
    </div>
  );
};