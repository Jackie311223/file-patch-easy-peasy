// src/pages/Inbox/InboxPage.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'; // Thêm keepPreviousData
import { useSearchParams } from 'react-router-dom'; // THÊM IMPORT NÀY
import { getMessages, markMessageAsRead, MessagesResponse, Message } from '@/api/messagesApi'; 
import { Button } from "@/ui/Button"; 
import { Card } from '@/ui/Card'; 
import { Tabs, TabsList, TabsTrigger } from '@/ui/Tabs'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';
import { PlusCircleIcon, FilterIcon, XIcon, EyeIcon } from 'lucide-react'; 
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/ui/Loading/Spinner'; 
import ErrorState from '@/ui/ErrorState'; 
import EmptyState from "@/ui/EmptyState"; 
// Sửa PageHeader thành default import dựa trên gợi ý lỗi
import PageHeader from '@/ui/PageHeader'; 
import MessageCard from './components/MessageCard'; 
import SendMessageModal from './components/SendMessageModal'; 
import MessageDetailDrawer from './components/MessageDetailDrawer'; 
import { formatDistanceToNow } from 'date-fns'; 

interface InboxPageFilters {
  type?: 'all' | 'SYSTEM' | 'PRIVATE'; 
  isRead?: 'all' | 'true' | 'false';   
  page?: number;
  limit?: number;
}

const InboxPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams(); 
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const getInitialFilters = useCallback((): InboxPageFilters => {
    const params: InboxPageFilters = { 
      type: 'all', 
      isRead: 'all', 
      page: 1, 
      limit: 10 
    };
    searchParams.forEach((value, key) => {
      if (key === "page" || key === "limit") {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue > 0) {
          params[key as 'page' | 'limit'] = numValue;
        }
      } else if (key === "type" && (value === "all" || value === "SYSTEM" || value === "PRIVATE")) {
        params.type = value;
      } else if (key === "isRead" && (value === "all" || value === "true" || value === "false")) {
        params.isRead = value;
      }
    });
    return params;
  }, [searchParams]);
  
  const [filters, setFilters] = useState<InboxPageFilters>(getInitialFilters);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null); 
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  // const [isFiltersVisible, setIsFiltersVisible] = useState(false); // Bỏ nếu không dùng nút Show/Hide

  const canSendMessages = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  
   useEffect(() => {
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== '') { 
        newSearchParams.set(key, String(value));
      }
    });
    if (newSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  useEffect(() => {
    const currentFiltersFromParams = getInitialFilters();
    if (JSON.stringify(currentFiltersFromParams) !== JSON.stringify(filters)) {
        setFilters(currentFiltersFromParams);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);


  const { 
    data: messagesResponse,
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery<MessagesResponse, Error>({ // Sửa thành MessagesResponse
    queryKey: ["messages", filters], 
    queryFn: () => {
      const apiParams: {
        type?: 'SYSTEM' | 'PRIVATE';
        isRead?: boolean;
        offset: number;
        limit: number;
      } = {
        offset: ((filters.page || 1) - 1) * (filters.limit || 10),
        limit: filters.limit || 10,
      };
      if (filters.type && filters.type !== "all") {
        apiParams.type = filters.type;
      }
      if (filters.isRead && filters.isRead !== "all") {
        apiParams.isRead = filters.isRead === "true";
      }
      return getMessages(apiParams);
    },
    placeholderData: keepPreviousData, // Sửa keepPreviousData thành placeholderData
  });

  const messagesData = messagesResponse?.data || [];
  const totalMessages = messagesResponse?.total || 0; 
  const totalPages = (filters.limit && totalMessages) ? Math.ceil(totalMessages / filters.limit) : 0;
  
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markMessageAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      if (selectedMessage) {
        setSelectedMessage(prev => prev ? { ...prev, isRead: true } : null);
      }
    },
    onError: (err: any) => { 
      toast({ title: 'Error marking message as read', description: err.message || 'Could not mark message as read.', variant: 'destructive' });
    }
  });
  
  // value trong handleFilterChange là string vì onValueChange của Select/Tabs trả về string
  const handleFilterChange = (key: 'type' | 'isRead', value: string) => { 
    setFilters(prev => ({ 
      ...prev, 
      [key]: value as any, // value sẽ là 'all', 'SYSTEM', 'PRIVATE', 'true', 'false'
      page: 1, 
    }));
  };
  
  const handleMessageClick = (message: Message) => { 
    setSelectedMessage(message);
    setIsDetailOpen(true);
    if (!message.isRead && message.id) { 
        markAsReadMutation.mutate(message.id);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
        setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };
  
  const openSendModal = () => setIsSendModalOpen(true);
  const closeSendModal = () => setIsSendModalOpen(false);
  
  const closeDetailDrawer = () => {
    setIsDetailOpen(false);
  };
  
  const handleMessageSent = () => {
    queryClient.invalidateQueries({ queryKey: ['messages'] });
    closeSendModal();
  };
  
  if (error && !isLoading) { 
    return <div className="p-4"><ErrorState title="Failed to load messages" message={error?.message || 'Something went wrong'} onRetry={refetch} /></div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader title="Inbox"> 
        <div className="flex space-x-2">
            {canSendMessages && (
            <Button onClick={openSendModal} size="sm">
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Send Message
            </Button>
            )}
        </div>
      </PageHeader>
      
      <div className="mb-6 mt-4 space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
        <Tabs value={filters.type || 'all'} onValueChange={(v) => handleFilterChange('type', v)} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-3 md:inline-grid md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="SYSTEM">System</TabsTrigger>
            <TabsTrigger value="PRIVATE">Private</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex justify-end md:justify-start">
          <Select value={filters.isRead || 'all'} onValueChange={(v) => handleFilterChange('isRead', v)}>
            <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
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
          <div className="flex justify-center p-8"><LoadingSpinner size="lg"/></div>
        ) : !messagesData.length ? (
          <EmptyState
            title="No messages found"
            description={filters.type !== 'all' || filters.isRead !== 'all'
              ? "Try adjusting your filters."
              : "You don't have any messages yet."
            }
            action={canSendMessages ? ( 
                <Button onClick={openSendModal} size="sm">
                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                    Create First Message
                </Button>
            ) : undefined}
          />
        ) : (
          <>
            {messagesData.map(msg => (
              <MessageCard key={msg.id} message={msg} onClick={() => handleMessageClick(msg)} />
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2 items-center">
                  <Button variant="outline" size="sm" onClick={() => handlePageChange((filters.page || 1) - 1)} disabled={(filters.page || 1) <= 1}>Previous</Button>
                  <div className="px-2 text-sm text-gray-700 dark:text-gray-300">Page {filters.page || 1} of {totalPages}</div>
                  <Button variant="outline" size="sm" onClick={() => handlePageChange((filters.page || 1) + 1)} disabled={(filters.page || 1) >= totalPages}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {selectedMessage && (
        <MessageDetailDrawer 
            isOpen={isDetailOpen} 
            onClose={closeDetailDrawer} 
            message={selectedMessage} 
        />
      )}
      {isSendModalOpen && (
        <SendMessageModal 
            isOpen={isSendModalOpen} 
            onClose={closeSendModal} 
            onSuccess={handleMessageSent} 
        />
      )}
    </div>
  );
};

export default InboxPage;