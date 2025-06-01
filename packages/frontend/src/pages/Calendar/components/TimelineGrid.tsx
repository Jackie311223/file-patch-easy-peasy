import React, { useRef, useEffect } from 'react';
import { Calendar, momentLocalizer, Components, View as ReactBigCalendarView } from 'react-big-calendar'; 
import moment from 'moment';
// import { useDrop } from 'react-dnd'; 
import { format, isToday } from 'date-fns'; 
import BookingBlock /* , { BookingBlockProps } */ from './BookingBlock'; 
import { LoadingSpinner } from '@/ui/Loading/Spinner'; 

const localizer = momentLocalizer(moment);

interface Room {
  id: string;
  name: string;
  roomTypeId: string;
  roomTypeName: string;
  status: string;
}

interface Booking {
  id: string;
  guestName: string;
  checkIn: string | Date;
  checkOut: string | Date;
  nights: number;
  status: string;
  roomId: string;
  roomName: string;
  roomTypeId: string;
  roomTypeName: string;
  source: string;
  notes?: string;
  isVIP?: boolean;
  totalAmount: number;
}

interface FormattedBooking {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: string; 
  booking: Booking;
}

// Định nghĩa một interface cục bộ cho các props mà TimelineGrid truyền cho BookingBlock.
// Dựa trên lỗi, BookingBlockProps.onDrag yêu cầu (bookingId, newDates) và không optional.
interface PassedToBookingBlockProps {
    booking: Booking;
    onClick: () => void;
    onDrag: (bookingId: string, newDates: { start: Date; end: Date; }) => void; 
    onRoomChange?: (bookingId: string, roomId: string) => void; 
}


interface TimelineGridProps {
  isLoading: boolean;
  viewMode: 'week' | 'month'; 
  dateRange: {
    start: Date;
    end: Date;
  };
  rooms: Room[];
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
  // onBookingDrag này từ CalendarPage có thể nhận roomId
  onBookingDragProp: (bookingId: string, newDates: { start: Date; end: Date }, roomId?: string) => void; 
  onRoomChangeProp: (bookingId: string, newRoomId: string, newDates: { start: Date; end: Date }) => void; 
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
  isLoading,
  viewMode, 
  dateRange,
  rooms,
  bookings,
  onBookingClick,
  onBookingDragProp, // Đổi tên để tránh nhầm lẫn
  onRoomChangeProp, 
}) => {
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const todayElement = calendarRef.current.querySelector('.rbc-time-column .rbc-today'); 
      if (todayElement && typeof todayElement.scrollIntoView === 'function') {
        // todayElement.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' }); 
      }
    }
  }, [dateRange, rooms]); 

  const formattedBookings: FormattedBooking[] = bookings.map(booking => ({
    id: booking.id,
    title: `${booking.guestName} (${booking.roomTypeName})`, 
    start: new Date(booking.checkIn),
    end: new Date(booking.checkOut),
    resource: booking.roomId,
    booking: booking,
  }));

  const components: Components<FormattedBooking, Room> = {
    event: (props) => {
      const bookingBlockPassedProps: PassedToBookingBlockProps = {
        booking: props.event.booking,
        onClick: () => onBookingClick(props.event.booking),
        // Sửa onDrag: truyền một hàm có signature (bookingId, newDates)
        // Hàm onBookingDragProp (từ CalendarPage) nhận thêm roomId, nên chúng ta bỏ qua nó ở đây
        // nếu BookingBlock không cung cấp roomId khi gọi onDrag.
        // Hoặc, onBookingDragProp cần xử lý trường hợp roomId là undefined.
        onDrag: (bookingId: string, newDates: { start: Date; end: Date; }) => {
            onBookingDragProp(bookingId, newDates, props.event.resource); // Truyền resourceId của event hiện tại làm roomId
        },
        onRoomChange: (bookingId: string, newRoomId: string) => {
            onRoomChangeProp(bookingId, newRoomId, { start: props.event.start, end: props.event.end });
        },
      };
      // Ép kiểu ở đây có thể không cần nếu PassedToBookingBlockProps khớp hoàn toàn với BookingBlockProps
      return <BookingBlock {...bookingBlockPassedProps as any} />; // Tạm dùng 'as any' nếu BookingBlockProps phức tạp hơn
                                                                 // Lý tưởng nhất là PassedToBookingBlockProps phải khớp BookingBlockProps
    }
    ,
    resourceHeader: ({ label, resource }) => ( 
        <div className="rbc-resource-header p-2 border-b border-r sticky top-0 bg-white dark:bg-gray-800 z-10">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span> <br/>
            <span className="text-xs text-gray-500 dark:text-gray-400">{(resource as Room).roomTypeName}</span>
        </div>
    ),
  };

  const activeView: ReactBigCalendarView = 'day'; 
  const calendarViews = { 
      day: true, 
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full py-10"><LoadingSpinner /></div>;
  }

  return (
    <div className="timeline-grid h-[calc(100vh-200px)] bg-white dark:bg-gray-900">
      <div className="h-full" ref={calendarRef}>
        <Calendar<FormattedBooking, Room>
          localizer={localizer}
          events={formattedBookings}
          views={calendarViews}
          view={activeView} 
          date={dateRange.start} 
          toolbar={false} 
          resources={rooms}
          resourceIdAccessor="id"
          resourceTitleAccessor="name"
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          components={components}
          selectable={true} 
          onSelectEvent={(event) => onBookingClick(event.booking)} 
          step={60} 
          timeslots={1}  
          className="calendar-timeline rbc-custom-timeline"
          style={{ height: '100%' }} 
        />
      </div>
    </div>
  );
};

export default TimelineGrid;