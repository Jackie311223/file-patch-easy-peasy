import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-lg">
      <h1 className="text-h2 font-bold mb-xl">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg mb-xl">
        {/* Quick Stats Cards */}
        <div className="bg-background rounded-lg shadow-sm p-lg border border-background-muted">
          <h3 className="text-h4 mb-md">Total Properties</h3>
          <p className="text-h2 font-bold text-primary">5</p>
        </div>
        <div className="bg-background rounded-lg shadow-sm p-lg border border-background-muted">
          <h3 className="text-h4 mb-md">Active Bookings</h3>
          <p className="text-h2 font-bold text-success">12</p>
        </div>
        <div className="bg-background rounded-lg shadow-sm p-lg border border-background-muted">
          <h3 className="text-h4 mb-md">Upcoming Check-ins</h3>
          <p className="text-h2 font-bold text-warning">3</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Recent Activity */}
        <div className="bg-background rounded-lg shadow-sm p-lg border border-background-muted">
          <h2 className="text-h3 mb-lg">Recent Activity</h2>
          <div className="space-y-md">
            <div className="pb-md border-b border-background-muted">
              <p className="text-body-md font-medium">New booking for Beach Resort</p>
              <p className="text-body-sm text-text-secondary">Today at 10:45 AM</p>
            </div>
            <div className="pb-md border-b border-background-muted">
              <p className="text-body-md font-medium">Payment received for Mountain View</p>
              <p className="text-body-sm text-text-secondary">Yesterday at 3:20 PM</p>
            </div>
            <div className="pb-md border-b border-background-muted">
              <p className="text-body-md font-medium">Room status updated for City Hotel</p>
              <p className="text-body-sm text-text-secondary">May 24, 2025</p>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-background rounded-lg shadow-sm p-lg border border-background-muted">
          <h2 className="text-h3 mb-lg">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <button className="bg-primary text-text-onDark py-md px-lg rounded-md hover:bg-primary-dark transition-colors duration-200">
              New Booking
            </button>
            <button className="bg-background-subtle text-text py-md px-lg rounded-md border border-background-muted hover:bg-background-muted transition-colors duration-200">
              Add Property
            </button>
            <button className="bg-background-subtle text-text py-md px-lg rounded-md border border-background-muted hover:bg-background-muted transition-colors duration-200">
              View Calendar
            </button>
            <button className="bg-background-subtle text-text py-md px-lg rounded-md border border-background-muted hover:bg-background-muted transition-colors duration-200">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;