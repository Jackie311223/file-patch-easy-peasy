// cypress/integration/calendar/drag-drop.spec.js
describe('Calendar Drag and Drop', () => {
  beforeEach(() => {
    // Mock auth token for PARTNER role
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token',
        user: {
          id: 'partner-id',
          name: 'Partner User',
          email: 'partner@example.com',
          role: 'PARTNER',
          tenantId: 'tenant-a'
        }
      }
    }).as('loginRequest');

    // Mock calendar data
    cy.intercept('GET', '/api/calendar*', {
      statusCode: 200,
      body: {
        rooms: [
          { id: 'room-1', name: 'Room 101', roomTypeId: 'type-1', roomTypeName: 'Standard', status: 'AVAILABLE' },
          { id: 'room-2', name: 'Room 102', roomTypeId: 'type-1', roomTypeName: 'Standard', status: 'AVAILABLE' },
          { id: 'room-3', name: 'Room 201', roomTypeId: 'type-2', roomTypeName: 'Deluxe', status: 'AVAILABLE' },
        ],
        bookings: [
          {
            id: 'booking-1',
            guestName: 'John Doe',
            checkIn: '2025-06-01',
            checkOut: '2025-06-05',
            nights: 4,
            status: 'CONFIRMED',
            roomId: 'room-1',
            roomName: 'Room 101',
            roomTypeId: 'type-1',
            roomTypeName: 'Standard',
            source: 'Direct',
            totalAmount: 500,
          },
          {
            id: 'booking-2',
            guestName: 'Jane Smith',
            checkIn: '2025-06-10',
            checkOut: '2025-06-15',
            nights: 5,
            status: 'CONFIRMED',
            roomId: 'room-2',
            roomName: 'Room 102',
            roomTypeId: 'type-1',
            roomTypeName: 'Standard',
            source: 'Booking.com',
            totalAmount: 750,
          }
        ]
      }
    }).as('getCalendarData');

    // Mock update booking dates API
    cy.intercept('PATCH', '/api/bookings/*/dates', {
      statusCode: 200,
      body: { success: true }
    }).as('updateBookingDates');

    // Mock assign room API
    cy.intercept('POST', '/api/bookings/assign-room', {
      statusCode: 200,
      body: { success: true }
    }).as('assignRoom');

    // Login and visit calendar page
    cy.visit('/login');
    cy.get('input[name="email"]').type('partner@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    
    cy.visit('/calendar');
    cy.wait('@getCalendarData');
    
    // Wait for calendar to fully render
    cy.get('[data-testid="timeline-grid"]').should('be.visible');
    cy.get('[data-testid="booking-block"]').should('have.length', 2);
  });

  it('allows dragging a booking to change dates', () => {
    // Get the first booking block
    cy.get('[data-testid="booking-block"][data-booking-id="booking-1"]')
      .should('be.visible')
      .as('bookingBlock');

    // Get the timeline grid
    cy.get('[data-testid="timeline-grid"]').as('timelineGrid');

    // Perform drag operation to move 2 days forward
    cy.get('@bookingBlock')
      .trigger('mousedown', { button: 0 })
      .trigger('mousemove', { clientX: 200, clientY: 0 }) // Move right by 200px (2 days)
      .trigger('mouseup');

    // Verify API call was made with correct parameters
    cy.wait('@updateBookingDates').then((interception) => {
      expect(interception.request.body).to.deep.include({
        checkIn: '2025-06-03', // 2 days later
        checkOut: '2025-06-07', // 2 days later
      });
    });

    // Verify success toast appears
    cy.contains('Booking dates updated successfully').should('be.visible');
  });

  it('allows dragging a booking to another room', () => {
    // Get the first booking block
    cy.get('[data-testid="booking-block"][data-booking-id="booking-1"]')
      .should('be.visible')
      .as('bookingBlock');

    // Get the target room row
    cy.get('[data-testid="room-row"][data-room-id="room-3"]').as('targetRoom');

    // Perform drag operation to move to another room
    cy.get('@bookingBlock')
      .trigger('mousedown', { button: 0 })
      .get('@targetRoom')
      .trigger('mousemove')
      .trigger('mouseup');

    // Verify API call was made with correct parameters
    cy.wait('@assignRoom').then((interception) => {
      expect(interception.request.body).to.deep.include({
        bookingId: 'booking-1',
        roomId: 'room-3',
      });
    });

    // Verify success toast appears
    cy.contains('Room assigned successfully').should('be.visible');
  });

  it('prevents dragging when user does not have permission', () => {
    // Change user role to STAFF (no edit permission)
    cy.window().then((win) => {
      win.localStorage.setItem('userRole', 'STAFF');
      win.dispatchEvent(new Event('storage'));
    });

    // Reload page to apply new role
    cy.reload();
    cy.wait('@getCalendarData');

    // Get the first booking block
    cy.get('[data-testid="booking-block"][data-booking-id="booking-1"]')
      .should('be.visible')
      .as('bookingBlock');

    // Try to drag - should be prevented
    cy.get('@bookingBlock')
      .trigger('mousedown', { button: 0 })
      .trigger('mousemove', { clientX: 200, clientY: 0 })
      .trigger('mouseup');

    // Verify no API call was made
    cy.get('@updateBookingDates.all').should('have.length', 0);

    // Verify error toast appears
    cy.contains('You do not have permission to edit bookings').should('be.visible');
  });

  it('shows booking details popover on hover', () => {
    // Hover over booking block
    cy.get('[data-testid="booking-block"][data-booking-id="booking-1"]')
      .trigger('mouseover');

    // Verify popover appears with booking details
    cy.get('[data-testid="booking-popover"]').should('be.visible');
    cy.get('[data-testid="booking-popover"]').within(() => {
      cy.contains('John Doe').should('be.visible');
      cy.contains('Room 101').should('be.visible');
      cy.contains('4 nights').should('be.visible');
      cy.contains('$500').should('be.visible');
    });
  });

  it('opens booking modal on click', () => {
    // Click on booking block
    cy.get('[data-testid="booking-block"][data-booking-id="booking-1"]').click();

    // Verify modal appears
    cy.get('[data-testid="booking-modal"]').should('be.visible');
    cy.get('[data-testid="booking-modal"]').within(() => {
      cy.contains('Booking Details').should('be.visible');
      cy.contains('John Doe').should('be.visible');
      cy.contains('Room 101').should('be.visible');
      cy.contains('June 1, 2025').should('be.visible');
      cy.contains('June 5, 2025').should('be.visible');
    });

    // Verify modal can be closed
    cy.get('[data-testid="booking-modal"] [aria-label="Close"]').click();
    cy.get('[data-testid="booking-modal"]').should('not.exist');
  });

  it('handles date range navigation', () => {
    // Click next button to move forward
    cy.get('[data-testid="calendar-header"] [aria-label="Next"]').click();
    
    // Verify API call with new date range
    cy.wait('@getCalendarData').then((interception) => {
      const url = new URL(interception.request.url);
      const startDate = url.searchParams.get('startDate');
      // Verify date is 7 days later (depends on view mode)
      expect(startDate).to.include('2025-06-08');
    });

    // Click previous button to move back
    cy.get('[data-testid="calendar-header"] [aria-label="Previous"]').click();
    
    // Verify API call with original date range
    cy.wait('@getCalendarData').then((interception) => {
      const url = new URL(interception.request.url);
      const startDate = url.searchParams.get('startDate');
      expect(startDate).to.include('2025-06-01');
    });
  });

  it('supports keyboard navigation for accessibility', () => {
    // Tab to the booking block
    cy.get('body').tab();
    cy.tab().tab(); // May need multiple tabs depending on page structure
    
    // Find the first booking block that has focus
    cy.get('[data-testid="booking-block"]').filter(':focus').as('focusedBooking');
    
    // Use keyboard to open modal (Enter key)
    cy.get('@focusedBooking').type('{enter}');
    
    // Verify modal appears
    cy.get('[data-testid="booking-modal"]').should('be.visible');
    
    // Verify focus is trapped in modal
    cy.focused().should('have.attr', 'aria-label', 'Close');
    
    // Tab through modal elements
    cy.tab();
    cy.tab();
    
    // Close with Escape key
    cy.get('body').type('{esc}');
    
    // Verify modal is closed
    cy.get('[data-testid="booking-modal"]').should('not.exist');
  });
});
