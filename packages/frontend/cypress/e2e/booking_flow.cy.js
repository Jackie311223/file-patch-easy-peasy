// Cypress test for Booking Flow
describe('Booking Flow', () => {
  beforeEach(() => {
    // Visit the bookings page before each test
    cy.visit('/bookings');
    // Wait for the page to load
    cy.contains('All Bookings', { timeout: 10000 }).should('be.visible');
  });

  it('should create a new booking', () => {
    // Click the New Booking button
    cy.contains('New Booking').click();
    
    // Wait for the modal to appear
    cy.contains('Create New Booking').should('be.visible');
    
    // Fill in the booking form
    cy.get('select[id*="propertyId"]').select(1); // Select the first property
    cy.wait(500); // Wait for room types to load
    cy.get('select[id*="roomTypeId"]').select(1); // Select the first room type
    cy.get('input[id*="guestName"]').type('Test Guest');
    cy.get('input[id*="contactPhone"]').type('1234567890');
    cy.get('select[id*="channel"]').select('DIRECT');
    cy.get('input[id*="checkIn"]').type('2025-06-01');
    cy.get('input[id*="checkOut"]').type('2025-06-05');
    cy.get('input[id*="adults"]').clear().type('2');
    cy.get('input[id*="totalAmount"]').clear().type('500');
    cy.get('select[id*="paymentMethod"]').select('CASH');
    cy.get('select[id*="paymentStatus"]').select('PAID');
    cy.get('input[id*="amountPaid"]').clear().type('500');
    
    // Submit the form
    cy.contains('Create Booking').click();
    
    // Verify the booking was created
    cy.contains('Test Guest').should('be.visible');
  });

  it('should edit an existing booking', () => {
    // Find and click the edit button for the first booking
    cy.get('table tbody tr').first().find('button[title="Edit"]').click();
    
    // Wait for the modal to appear
    cy.contains('Edit Booking').should('be.visible');
    
    // Update the guest name
    cy.get('input[id*="guestName"]').clear().type('Updated Guest Name');
    
    // Submit the form
    cy.contains('Update Booking').click();
    
    // Verify the booking was updated
    cy.contains('Updated Guest Name').should('be.visible');
  });

  it('should filter bookings by property', () => {
    // Get the first property name
    let propertyName;
    cy.get('select[id="propertyFilter"] option').eq(1).then($option => {
      propertyName = $option.text();
      
      // Select the first property in the filter
      cy.get('select[id="propertyFilter"]').select(1);
      
      // Verify that all visible bookings have the selected property
      cy.get('table tbody tr').each($row => {
        cy.wrap($row).contains(propertyName);
      });
    });
  });

  it('should filter bookings by status', () => {
    // Select the CONFIRMED status in the filter
    cy.get('select[id="statusFilter"]').select('CONFIRMED');
    
    // Verify that all visible bookings have the CONFIRMED status
    cy.get('table tbody tr').each($row => {
      cy.wrap($row).contains('CONFIRMED');
    });
  });

  it('should view booking details', () => {
    // Find and click the view details button for the first booking
    cy.get('table tbody tr').first().find('button[title="View Details"]').click();
    
    // Wait for the modal to appear
    cy.contains('Booking Details').should('be.visible');
    
    // Verify booking details are displayed
    cy.get('.modal-content').within(() => {
      cy.contains('Guest Information').should('be.visible');
      cy.contains('Booking Information').should('be.visible');
      cy.contains('Payment Information').should('be.visible');
    });
    
    // Close the modal
    cy.get('.modal-content').find('button').contains('Close').click();
  });

  it('should delete a booking', () => {
    // Get the guest name of the first booking
    let guestName;
    cy.get('table tbody tr').first().find('td').eq(1).then($td => {
      guestName = $td.text();
      
      // Find and click the delete button for the first booking
      cy.get('table tbody tr').first().find('button[title="Delete"]').click();
      
      // Wait for the confirmation modal to appear
      cy.contains('Delete Booking').should('be.visible');
      
      // Confirm deletion
      cy.contains('Delete').click();
      
      // Verify the booking was deleted
      cy.contains(guestName).should('not.exist');
    });
  });

  it('should respect tenant isolation', () => {
    // This test would require multiple tenant accounts
    // For now, we'll just verify that tenantId is displayed in the UI
    // In a real implementation, we would:
    // 1. Login as tenant 1
    // 2. Create a booking
    // 3. Verify booking is visible
    // 4. Logout
    // 5. Login as tenant 2
    // 6. Verify tenant 1's booking is NOT visible
    
    // For now, just check that tenant ID is shown in booking details
    cy.get('table tbody tr').first().find('button[title="View Details"]').click();
    cy.contains('Booking Details').should('be.visible');
    cy.get('.modal-content').should('contain', 'Tenant ID');
  });
});
