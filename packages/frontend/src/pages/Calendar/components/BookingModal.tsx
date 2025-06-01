import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/ui/Dialog'; 
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/Select'; 
import { Textarea } from '@/ui/Textarea'; 

// Định nghĩa lại type Booking ở đây hoặc import từ một file chung
// Sửa: Thêm bookingCode vào interface Booking
interface Booking {
  id: string;
  guestName: string;
  bookingCode?: string; // Thêm bookingCode
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
  adults?: number;
  children?: number;
  email?: string; 
  phone?: string; 
}

export interface BookingModalProps { 
  booking: Booking; // Sử dụng Booking type đã cập nhật
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedBooking: Booking) => void; 
}

const BookingModal: React.FC<BookingModalProps> = ({ booking, isOpen, onClose, onUpdate }) => {
  const formatDateForInput = (date: string | Date): string => {
    if (date instanceof Date) {
      return format(date, 'yyyy-MM-dd');
    }
    try {
        // Cố gắng parse nếu là string, nhưng cần cẩn thận với múi giờ
        return format(new Date(date + "T00:00:00"), 'yyyy-MM-dd'); // Thêm T00:00:00 để tránh lỗi múi giờ
    } catch {
        const today = new Date();
        // Kiểm tra xem có phải là ngày hợp lệ không trước khi format
        if (!isNaN(today.getTime())) {
            return format(today, 'yyyy-MM-dd');
        }
        return ''; // Trả về chuỗi rỗng nếu không thể format
    }
  };

  const [formData, setFormData] = useState<Booking>({
    ...booking,
    checkIn: formatDateForInput(booking.checkIn),
    checkOut: formatDateForInput(booking.checkOut),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  useEffect(() => {
    // Cập nhật formData khi prop `booking` thay đổi và modal đang mở
    if (isOpen) {
        setFormData({
            ...booking,
            checkIn: formatDateForInput(booking.checkIn),
            checkOut: formatDateForInput(booking.checkOut),
        });
    }
  }, [booking, isOpen]);
  

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'CHECKED_IN', label: 'Checked In' },
    { value: 'CHECKED_OUT', label: 'Checked Out' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' },
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    if (type === 'number') {
      // Cho phép input rỗng, sẽ được validate bởi Zod hoặc logic khác nếu cần
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkIn || !formData.checkOut) {
        console.error("Check-in and Check-out dates are required.");
        return;
    }
    setIsSubmitting(true);
    
    const checkInDate = new Date(formData.checkIn  + "T00:00:00"); // Giả sử múi giờ địa phương
    const checkOutDate = new Date(formData.checkOut  + "T00:00:00");
    let nights = 0;
    if (checkOutDate > checkInDate) { // Đảm bảo checkOut sau checkIn
        nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    const updatedBookingData = {
      ...formData,
      nights: nights > 0 ? nights : formData.nights, // Chỉ cập nhật nights nếu tính toán được
      // Chuyển đổi lại date string nếu API cần ISO string đầy đủ
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
    };
    
    onUpdate(updatedBookingData);
    // setIsSubmitting và onClose nên được gọi trong callback của onUpdate (ví dụ: sau khi API call thành công)
    // Ví dụ:
    // onUpdate(updatedBookingData).finally(() => setIsSubmitting(false));
  };
  
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(openState) => {
        if (!openState) {
          onClose();
        }
      }}
      size="lg" 
    >
      <DialogContent className="dark:bg-gray-800"> 
        <DialogHeader>
          {/* Sửa: Truy cập booking.bookingCode (giờ đã có trong type Booking) */}
          <DialogTitle className="dark:text-white">Edit Booking - {formData.bookingCode || formData.id}</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Modify the details for this booking.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="bookingModalGuestName">Guest Name</Label>
              <Input
                id="bookingModalGuestName"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-1 self-center md:self-end"> {/* Căn chỉnh VIP checkbox */}
              <input 
                id="bookingModalIsVIP"
                name="isVIP"
                type="checkbox"
                checked={formData.isVIP || false}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <Label htmlFor="bookingModalIsVIP" className="font-medium">VIP Guest</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bookingModalCheckIn">Check-in Date</Label>
              <Input
                type="date"
                id="bookingModalCheckIn"
                name="checkIn"
                value={formData.checkIn as string} 
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="bookingModalCheckOut">Check-out Date</Label>
              <Input
                type="date"
                id="bookingModalCheckOut"
                name="checkOut"
                value={formData.checkOut as string} 
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bookingModalStatus">Status</Label>
              {/* Sửa: Bỏ 'id' và 'name' khỏi Select, id nên ở SelectTrigger */}
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="bookingModalStatus">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bookingModalRoomName">Room</Label>
              <Input
                id="bookingModalRoomName"
                name="roomName"
                value={formData.roomName}
                disabled 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="bookingModalSource">Source</Label>
                <Input 
                    id="bookingModalSource"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                />
            </div>
            <div>
                <Label htmlFor="bookingModalTotalAmount">Total Amount</Label>
                <Input
                    type="number"
                    id="bookingModalTotalAmount"
                    name="totalAmount"
                    value={formData.totalAmount === undefined ? '' : formData.totalAmount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <Label htmlFor="bookingModalAdults">Adults</Label>
                <Input
                    type="number"
                    id="bookingModalAdults"
                    name="adults"
                    value={formData.adults === undefined ? '' : formData.adults}
                    onChange={handleChange}
                    min="0"
                />
            </div>
            <div>
                <Label htmlFor="bookingModalChildren">Children</Label>
                <Input
                    type="number"
                    id="bookingModalChildren"
                    name="children"
                    value={formData.children === undefined ? '' : formData.children}
                    onChange={handleChange}
                    min="0"
                />
            </div>
          </div>

          <div>
            <Label htmlFor="bookingModalNotes">Notes</Label>
            <Textarea
              id="bookingModalNotes"
              name="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={handleChange}
              className="min-h-[80px]"
            />
          </div>
        </form>
        
        <DialogFooter>
          <Button
            type="button" 
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button" // Sửa: type="button" và gọi handleSubmit trong onClick nếu form không submit trực tiếp
            onClick={handleSubmit} 
            disabled={isSubmitting}
            variant="primary"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;