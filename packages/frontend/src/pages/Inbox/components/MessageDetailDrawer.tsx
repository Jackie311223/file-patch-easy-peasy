import React from 'react';
// Giả sử Drawer và các phần của nó được export theo tên từ @/ui/Drawer
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/ui/Drawer';
// Sửa import Button thành named import để nhất quán
import { Button } from '@/ui/Button';
// Đường dẫn tương đối này có thể đúng, hoặc bạn có thể cân nhắc dùng alias nếu utils nằm trong src
import { formatDate } from '../../../utils/formatters'; 
import { MessageCircle, AlertCircle } from 'lucide-react';

interface MessageDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  message: {
    id: string;
    messageType: 'SYSTEM' | 'PRIVATE';
    content: string;
    isRead: boolean;
    createdAt: string;
    sender?: {
      id: string;
      name: string;
    };
  };
}

const MessageDetailDrawer: React.FC<MessageDetailDrawerProps> = ({
  isOpen,
  onClose,
  message
}) => {
  // Xác định tên người gửi để hiển thị
  const senderName = message.messageType === 'SYSTEM' 
    ? 'System Message' 
    : message.sender?.name || 'Unknown Sender';
  
  // Định dạng ngày tháng của tin nhắn
  const formattedDate = formatDate(message.createdAt);
  
  return (
    <Drawer open={isOpen} onOpenChange={(openState) => !openState && onClose()}> {/* Điều chỉnh onOpenChange cho phù hợp với ShadCN Drawer */}
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex items-center space-x-2 mb-1"> {/* Thêm mb-1 cho khoảng cách */}
              {message.messageType === 'SYSTEM' ? (
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              ) : (
                <MessageCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
              )}
              <DrawerTitle className="truncate">{senderName}</DrawerTitle>
            </div>
            <DrawerDescription>{formattedDate}</DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0">
            <div className="rounded-lg border p-3 text-sm bg-gray-50 max-h-[300px] overflow-y-auto"> {/* Điều chỉnh padding, bg, max-height và overflow */}
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
          
          <DrawerFooter className="pt-4"> {/* Thêm pt-4 */}
            <Button onClick={onClose} variant="outline">Close</Button> {/* Thêm variant="outline" cho phù hợp hơn */}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MessageDetailDrawer;