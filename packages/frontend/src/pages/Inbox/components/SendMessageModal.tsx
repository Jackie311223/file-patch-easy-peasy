import React, { useEffect } from 'react'; 
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/Dialog'; 
import { Button } from '@/ui/Button';
// import { Input } from '@/ui/Input'; // Bỏ nếu không dùng
import { Label } from '@/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select'; 
import { Textarea } from '@/ui/Textarea'; 
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query'; 
import { useGetUsers, User } from '@/api/usersApi'; 
import { sendMessage } from '@/api/messagesApi'; 
import { useToast } from '@/hooks/useToast'; 

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Giả sử API sendMessage mong đợi payload như thế này
interface SendMessagePayload {
    messageType: 'SYSTEM' | 'PRIVATE';
    recipientId?: string; 
    content: string;
    // senderId?: string; // Có thể thêm nếu API cần
}

const formSchema = z.object({
  messageType: z.enum(['SYSTEM', 'PRIVATE']),
  recipientId: z.string().optional(), 
  content: z.string().min(1, { message: 'Message content cannot be empty.' }),
}).superRefine((data, ctx) => { 
  if (data.messageType === 'PRIVATE' && (!data.recipientId || data.recipientId.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Recipient is required for private messages.',
      path: ['recipientId'],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient(); 
  
  const { 
    control, 
    handleSubmit, 
    watch,
    reset,
    formState: { errors, isSubmitting } 
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      messageType: 'SYSTEM',
      recipientId: '',
      content: '',
    },
    mode: 'onChange', 
  });
  
  const messageType = watch('messageType');
  
  // Sửa: Giả sử useGetUsers().data trả về trực tiếp User[] (hoặc User[] | undefined)
  // Lỗi "Property 'data' does not exist on type 'User[]'" có nghĩa là `usersQuery.data` đã là User[]
  const { data: users, isLoading: isLoadingUsers } = useGetUsers({ limit: 100 }); 
  // const usersToMap: User[] = users || []; // Sử dụng users trực tiếp, fallback về mảng rỗng nếu undefined

  const sendMessageMutation = useMutation<any, Error, SendMessagePayload>({ 
    mutationFn: (payload) => sendMessage(payload), 
    onSuccess: () => {
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
        variant: 'success', 
      });
      reset(); 
      onSuccess(); 
      onClose(); 
      queryClient.invalidateQueries({ queryKey: ['messages'] }); 
    },
    onError: (error: any) => {
      toast({
        title: 'Error Sending Message',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive', 
      });
    }
  });
  
  const onSubmit = (data: FormValues) => {
    const payload: SendMessagePayload = {
        messageType: data.messageType,
        content: data.content,
    };
    if (data.messageType === 'PRIVATE') {
      payload.recipientId = data.recipientId;
    }
    sendMessageMutation.mutate(payload);
  };
  
  useEffect(() => {
    if (!isOpen) {
      reset({ 
        messageType: 'SYSTEM',
        recipientId: '',
        content: '',
      });
    }
  }, [isOpen, reset]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(openValue) => { if (!openValue) onClose(); }}> 
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Send New Message</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sendMessageType" className="dark:text-gray-300">Message Type</Label>
            <Controller
              name="messageType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="sendMessageType" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select message type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-white">
                    <SelectItem value="SYSTEM" className="dark:hover:bg-gray-600">System Message (All Users)</SelectItem>
                    <SelectItem value="PRIVATE" className="dark:hover:bg-gray-600">Private Message</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.messageType && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.messageType.message}</p>
            )}
          </div>
          
          {messageType === 'PRIVATE' && (
            <div className="space-y-2">
              <Label htmlFor="sendRecipientId" className="dark:text-gray-300">Recipient</Label>
              <Controller
                name="recipientId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger 
                        id="sendRecipientId" 
                        className={`${errors.recipientId ? 'border-red-500' : 'dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                        disabled={isLoadingUsers} 
                    >
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-white">
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled className="dark:hover:bg-gray-600">Loading users...</SelectItem>
                      ) : (
                        // Sửa: map trực tiếp trên 'users' (là User[] | undefined) nếu useGetUsers().data trả về User[]
                        (users || []).map((userItem: User) => ( 
                          <SelectItem key={userItem.id} value={userItem.id} className="dark:hover:bg-gray-600">
                            {userItem.name || userItem.email} {/* Hiển thị email nếu không có name */}
                          </SelectItem>
                        ))
                      )}
                       {(users || []).length === 0 && !isLoadingUsers && (
                         <SelectItem value="no-users" disabled className="dark:hover:bg-gray-600">No users found</SelectItem>
                       )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.recipientId && (
                <p className="text-sm text-red-500 dark:text-red-400">{errors.recipientId.message}</p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="sendMessageContent" className="dark:text-gray-300">Message</Label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="sendMessageContent"
                  placeholder="Enter your message here..."
                  className={`min-h-[120px] resize-none ${errors.content ? 'border-red-500' : 'dark:bg-gray-700 dark:border-gray-600 dark:text-white'}`}
                  {...field}
                />
              )}
            />
            {errors.content && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.content.message}</p>
            )}
          </div>
          
          <DialogFooter className="dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={sendMessageMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || sendMessageMutation.isPending}>
              {isSubmitting || sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageModal;