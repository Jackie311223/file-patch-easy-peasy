import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Types
export interface GetCalendarParams {
  propertyId: string;
  startDate: string;
  endDate: string;
  bookingStatus?: string[];
  roomTypeId?: string;
}

export interface UpdateBookingDatesParams {
  checkIn: string;
  checkOut: string;
}

export interface AssignRoomParams {
  bookingId: string;
  roomId: string;
}

// Get calendar data
export const getCalendarData = async (params: GetCalendarParams) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/calendar`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    throw error;
  }
};

// Update booking dates (for drag and drop)
export const updateBookingDates = async (bookingId: string, data: UpdateBookingDatesParams) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/calendar/bookings/${bookingId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating booking dates:', error);
    throw error;
  }
};

// Assign room to booking (for drag and drop between rooms)
export const assignRoom = async (data: AssignRoomParams) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/calendar/bookings/assign-room`, data);
    return response.data;
  } catch (error) {
    console.error('Error assigning room:', error);
    throw error;
  }
};
