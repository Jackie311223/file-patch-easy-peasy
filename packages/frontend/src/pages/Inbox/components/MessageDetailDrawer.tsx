import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/ui/Drawer';
import Button from '@/ui/Button';
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
  // Determine sender display name
  const senderName = message.messageType === 'SYSTEM' 
    ? 'System Message' 
    : message.sender?.name || 'Unknown Sender';
  
  // Format the message date
  const formattedDate = formatDate(message.createdAt);
  
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex items-center space-x-2">
              {message.messageType === 'SYSTEM' ? (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              ) : (
                <MessageCircle className="h-5 w-5 text-blue-500" />
              )}
              <DrawerTitle>{senderName}</DrawerTitle>
            </div>
            <DrawerDescription>{formattedDate}</DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0">
            <div className="rounded-lg border p-4 bg-white">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
          
          <DrawerFooter>
            <Button onClick={onClose}>Close</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MessageDetailDrawer;
