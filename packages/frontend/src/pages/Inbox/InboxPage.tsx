// src/pages/Inbox/InboxPage.tsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, markMessageAsRead, MessagesResponse } from '@/api/messagesApi';
import Button from "@/ui/Button";
import { Card } from '@/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';
import { PlusIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/ui/Loading/Spinner';
import ErrorState from '@/ui/ErrorState';
import { EmptyState } from '@/ui/EmptyState/EmptyState';
import MessageCard from './components/MessageCard';
import SendMessageModal from './components/SendMessageModal';
import MessageDetailDrawer from './components/MessageDetailDrawer';

const InboxPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [filters, setFilters] = useState({ type: 'all', isRead: 'all' });
  const [pagination, setPagination] = useState({ page: 0, limit: 20 });
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const canSendMessages = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  
  const { 
    data: messagesResponse,
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery<MessagesResponse, Error>({
    queryKey: ["messages", filters, pagination],
    queryFn: () => getMessages({
      type: filters.type !== "all" ? filters.type : undefined,
      isRead: filters.isRead !== "all" ? filters.isRead === "true" : undefined,
      offset: pagination.page * pagination.limit,
      limit: pagination.limit,
    }),
  });

  const messagesData = messagesResponse?.data || [];
  const totalMessages = messagesResponse?.total || 0;
  
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markMessageAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (err: any) => {
      toast({ title: 'Error marking message as read', description: err.message, variant: 'destructive' });
    }
  });
  
  const handleFilterChange = (key: 'type' | 'isRead', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
  };
  
  const handleMessageClick = (message: any) => {
    setSelectedMessage(message);
    setIsDetailOpen(true);
    if (!message.isRead) markAsReadMutation.mutate(message.id);
  };
  
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  const openSendModal = () => setIsSendModalOpen(true);
  const closeSendModal = () => setIsSendModalOpen(false);
  
  const closeDetailDrawer = () => {
    setIsDetailOpen(false);
    setSelectedMessage(null);
  };
  
  const handleMessageSent = () => {
    queryClient.invalidateQueries({ queryKey: ['messages'] });
    closeSendModal();
    toast({ title: 'Message sent', description: 'Your message has been sent successfully', variant: 'success' });
  };
  
  const totalPages = totalMessages ? Math.ceil(totalMessages / pagination.limit) : 0;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Inbox</h1>
        {canSendMessages && (
          <Button onClick={openSendModal} className="flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        )}
      </div>
      
      <div className="mb-6 space-y-4">
        <Tabs value={filters.type} onValueChange={v => handleFilterChange('type', v)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="SYSTEM">System</TabsTrigger>
            <TabsTrigger value="PRIVATE">Private</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex justify-end">
          <Select value={filters.isRead} onValueChange={v => handleFilterChange('isRead', v)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All messages</SelectItem>
              <SelectItem value="false">Unread</SelectItem>
              <SelectItem value="true">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8"><LoadingSpinner /></div>
        ) : isError ? (
          <ErrorState title="Failed to load messages" message={error?.message || 'Something went wrong'} onRetry={refetch} />
        ) : !messagesData.length ? (
          <EmptyState
            title="No messages found"
            description={filters.type !== 'all' || filters.isRead !== 'all'
              ? "Try changing your filters."
              : "You don't have any messages yet."
            }
            action={canSendMessages ? { label: "Send Message", onClick: openSendModal } : undefined}
          />
        ) : (
          <>
            {messagesData.map(msg => (
              <MessageCard key={msg.id} message={msg} onClick={() => handleMessageClick(msg)} />
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 0}>Previous</Button>
                  <div className="flex items-center px-4">Page {pagination.page + 1} of {totalPages}</div>
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= totalPages - 1}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {selectedMessage && (
        <MessageDetailDrawer isOpen={isDetailOpen} onClose={closeDetailDrawer} message={selectedMessage} />
      )}
      {isSendModalOpen && (
        <SendMessageModal isOpen={isSendModalOpen} onClose={closeSendModal} onSuccess={handleMessageSent} />
      )}
    </div>
  );
};

export default InboxPage;
