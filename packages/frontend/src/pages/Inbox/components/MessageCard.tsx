import React from 'react';
import { Card, CardContent } from '@/ui/Card'; // Giả sử Card và CardContent là named exports
// Sửa import Badge thành named import để nhất quán
import { Badge } from '@/ui/Badge'; 
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, AlertCircle } from 'lucide-react';

interface Message { // Tách riêng interface Message để có thể tái sử dụng
  id: string;
  messageType: 'SYSTEM' | 'PRIVATE';
  content: string;
  isRead: boolean;
  createdAt: string; // Hoặc Date nếu dữ liệu của bạn là Date object
  sender?: {
    id: string;
    name: string;
  };
}

interface MessageCardProps {
  message: Message; // Sử dụng interface Message đã định nghĩa
  onClick: () => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, onClick }) => {
  // Định dạng ngày tháng của tin nhắn
  const formattedDate = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  
  // Lấy một phần nội dung tin nhắn để xem trước (ví dụ: 100 ký tự đầu)
  const contentPreview = message.content.length > 100
    ? `${message.content.substring(0, 100)}...`
    : message.content;
  
  // Xác định tên người gửi để hiển thị
  const senderName = message.messageType === 'SYSTEM' 
    ? 'System' // Ngắn gọn hơn cho System Message
    : message.sender?.name || 'Unknown Sender';
  
  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${!message.isRead ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`} // Thêm border transparent cho read messages
      onClick={onClick}
      tabIndex={0} // Thêm để có thể focus bằng keyboard
      onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }} // Thêm để kích hoạt bằng keyboard
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2"> {/* Thêm mb-2 */}
          <div className="flex items-center space-x-2 flex-grow min-w-0"> {/* Thêm flex-grow và min-w-0 cho senderName truncate */}
            {message.messageType === 'SYSTEM' ? (
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            ) : (
              <MessageCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
            )}
            <h3 className={`text-sm font-medium truncate ${!message.isRead ? 'font-bold text-gray-800 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}> {/* Thêm truncate */}
              {senderName}
            </h3>
            {/* Không cần Badge SYSTEM/PRIVATE ở đây nữa nếu senderName đã rõ ràng */}
            {/* <Badge variant={message.messageType === 'SYSTEM' ? 'warning' : 'default'}>
              {message.messageType === 'SYSTEM' ? 'System' : 'Private'}
            </Badge> */}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2"> {/* Thêm ml-2 */}
            {!message.isRead && (
              <span 
                className="h-2.5 w-2.5 rounded-full bg-primary" 
                title="Unread" // Thêm title cho accessibility
              ></span>
            )}
            <span className={`text-xs ${!message.isRead ? 'text-primary font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{formattedDate}</span>
          </div>
        </div>
        
        <p className={`text-sm ${!message.isRead ? 'text-gray-800 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
          {contentPreview}
        </p>
      </CardContent>
    </Card>
  );
};

export default MessageCard;