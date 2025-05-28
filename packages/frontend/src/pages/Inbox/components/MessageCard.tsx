import React from 'react';
import { Card, CardContent } from '@/ui/Card';
import Badge from '@/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, AlertCircle } from 'lucide-react';

interface MessageCardProps {
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
  onClick: () => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, onClick }) => {
  // Format the message date
  const formattedDate = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
  
  // Get a preview of the message content (first 100 characters)
  const contentPreview = message.content.length > 100
    ? `${message.content.substring(0, 100)}...`
    : message.content;
  
  // Determine sender display name
  const senderName = message.messageType === 'SYSTEM' 
    ? 'System Message' 
    : message.sender?.name || 'Unknown Sender';
  
  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-gray-50 ${!message.isRead ? 'border-l-4 border-l-primary' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            {message.messageType === 'SYSTEM' ? (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            ) : (
              <MessageCircle className="h-5 w-5 text-blue-500" />
            )}
            <h3 className={`text-sm font-medium ${!message.isRead ? 'font-bold' : ''}`}>
              {senderName}
            </h3>
            <Badge variant={message.messageType === 'SYSTEM' ? 'warning' : 'default'}>
              {message.messageType === 'SYSTEM' ? 'System' : 'Private'}
            </Badge>
            {!message.isRead && (
              <span className="h-2 w-2 rounded-full bg-primary"></span>
            )}
          </div>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
        
        <p className={`mt-2 text-sm text-gray-700 ${!message.isRead ? 'font-medium' : ''}`}>
          {contentPreview}
        </p>
      </CardContent>
    </Card>
  );
};

export default MessageCard;
