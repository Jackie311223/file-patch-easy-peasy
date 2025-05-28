import React, { useRef, useEffect } from 'react';
import { Calendar, Views, momentLocalizer, Components, View, ViewsProps } from 'react-big-calendar'; // Import necessary types
import moment from 'moment';
import { useDrop } from 'react-dnd';
import { format, isToday } from 'date-fns';
import BookingBlock from './BookingBlock';
import LoadingSpinner from '@/ui/Loading/Spinner';

// Setup localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Custom event types (Assuming these are defined correctly elsewhere or should be imported)
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

// Type for formatted events used by Calendar
interface FormattedBooking {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: string; // Should match Room['id'] type
  booking: Booking;
}

interface TimelineGridProps {
  isLoading: boolean;
  viewMode: 'week' | 'month'; // Keep this for internal logic if needed, but Calendar view is custom
  dateRange: {
    start: Date;
    end: Date;
  };
  rooms: Room[];
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
  onBookingDrag: (bookingId: string, newDates: { start: Date; end: Date }) => void;
  onRoomChange: (bookingId: string, roomId: string) => void;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
  isLoading,
  viewMode, // Keep for length calculation
  dateRange,
  rooms,
  bookings,
  onBookingClick,
  onBookingDrag,
  onRoomChange,
}) => {
  const calendarRef = useRef<HTMLDivElement>(null);

  // Scroll to today when component mounts (adjust selector if needed)
  useEffect(() => {
    if (calendarRef.current) {
      // Selector might need adjustment based on custom view structure
      const todayElement = calendarRef.current.querySelector('.rbc-day-bg.rbc-today'); 
      if (todayElement) {
        // Scrolling logic might need refinement for resource view
        // todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [dateRange]);

  // Format bookings for react-big-calendar
  const formattedBookings: FormattedBooking[] = bookings.map(booking => ({
    id: booking.id,
    title: booking.guestName,
    start: new Date(booking.checkIn),
    end: new Date(booking.checkOut),
    resource: booking.roomId,
    booking: booking, // Pass the original booking for reference
  }));

  // Custom components for react-big-calendar
  const components: Components<FormattedBooking, Room> = {
    event: (props) => (
      <BookingBlock
        booking={props.event.booking} // Access original booking
        onClick={() => onBookingClick(props.event.booking)}
        onDrag={onBookingDrag}
        onRoomChange={onRoomChange}
      />
    ),
    // Custom header for date columns (if needed in resource view)
    // header: ({ date }) => (
    //   <div className={`rbc-header ${isToday(date) ? 'rbc-today' : ''}`}>
    //     <span className="rbc-date-cell">{format(date, 'EEE d')}</span>
    //   </div>
    // ),
    // Custom time gutter header (room names)
    resourceHeader: ({ label }) => (
        <div className="rbc-resource-header p-2 border-b border-r">
            <span className="text-sm font-medium">{label}</span>
            {/* Add room type or other info if needed */}
        </div>
    ),
  };

  // Setup drop targets for each room row (This logic might need adjustment with resource view)
  const [, drop] = useDrop({
    accept: 'booking',
    drop: (item: { id: string; roomId: string }, monitor) => {
      // Drop logic might need adjustment based on how resource view handles drops
      // const dropResult = monitor.getDropResult() as { roomId?: string } | null;
      // if (dropResult && dropResult.roomId && dropResult.roomId !== item.roomId) {
      //   onRoomChange(item.id, dropResult.roomId);
      // }
    },
  });

  // Define the active view key (using standard 'day' for resource timeline)
  const activeView: View = 'day';

  // Custom view configuration (Using standard 'day' view with resources as a timeline)
  // Or potentially a dedicated timeline view if available/imported
  const views: ViewsProps<FormattedBooking, Room> = {
     day: true, // Use day view as base for timeline
     week: false, // Disable standard week view if only timeline needed
     month: false, // Disable standard month view
     agenda: false,
     // If a specific timeline view component exists, use it:
     // timeline: TimelineViewComponent // Example
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="timeline-grid h-[calc(100vh-200px)]" ref={drop as unknown as React.RefObject<HTMLDivElement>}> {/* Adjust height as needed */}
      <div className="h-full" ref={calendarRef}>
        <Calendar<FormattedBooking, Room> // Specify generic types
          localizer={localizer}
          events={formattedBookings}
          
          // View configuration
          views={views} // Pass the configured views
          view={'day'} // Set the active view to 'day' (our timeline base)
          defaultView={'day'} // Default to 'day'
          date={dateRange.start} // Control the displayed date
          // length={1} // Show only one day at a time for resource view?
          toolbar={false} // Hide default toolbar
          
          // Resource configuration
          resources={rooms} // Provide rooms as resources
          resourceIdAccessor="id"
          resourceTitleAccessor="name"
          
          // Event accessors
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          
          // Custom components
          components={components}
          
          // Interaction configuration
          selectable={false} // Disable time slot selection if needed
          // draggableAccessor={(event) => true} // Allow dragging events
          
          // Time grid configuration (adjust as needed for timeline)
          step={60} // Time slot duration in minutes
          timeslots={1} // Number of slots in a step
          
          // Date range limits (optional)
          // min={new Date(dateRange.start)} 
          // max={new Date(dateRange.end)}
          
          className="calendar-timeline"
        />
      </div>
    </div>
  );
};

export default TimelineGrid;

