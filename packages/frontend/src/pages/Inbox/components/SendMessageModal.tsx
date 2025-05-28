import React from 'react';
import Dialog from '@/ui/Dialog';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/Dialog';
import Button from '@/ui/Button';
import Input from '@/ui/Input';
import Label from '@/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';
import Textarea from '@/ui/Textarea';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useGetUsers } from '@/api/usersApi';
import { sendMessage } from '@/api/messagesApi';
import { useToast } from '@/hooks/useToast';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Define form schema
const formSchema = z.object({
  messageType: z.enum(['SYSTEM', 'PRIVATE']),
  recipientId: z.string().optional()
    .refine(val => val !== undefined && val !== '', {
      message: 'Recipient is required for private messages',
      path: ['recipientId'],
    }),
  content: z.string().min(1, 'Message content is required'),
});

// Type for form values
type FormValues = z.infer<typeof formSchema>;

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  
  // Initialize form with react-hook-form and zod validation
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
  
  // Watch messageType to conditionally show recipient field
  const messageType = watch('messageType');
  
  // Fetch users for recipient dropdown (only needed for PRIVATE messages)
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsers({ limit: 100 }); // Correct hook usage
  const users = usersResponse || []; // Safe access: usersResponse is User[] | undefined
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: FormValues) => sendMessage(data),
    onSuccess: () => {
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully',
        variant: 'success',
      });
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending message',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  });
  
  // Form submission handler
  const onSubmit = (data: FormValues) => {
    // For SYSTEM messages, remove recipientId
    if (data.messageType === 'SYSTEM') {
      data.recipientId = undefined;
    }
    
    sendMessageMutation.mutate(data);
  };
  
  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);
  
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Message Type */}
          <div className="space-y-2">
            <Label htmlFor="messageType">Message Type</Label>
            <Controller
              name="messageType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="messageType">
                    <SelectValue placeholder="Select message type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SYSTEM">System Message (All Users)</SelectItem>
                    <SelectItem value="PRIVATE">Private Message</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.messageType && (
              <p className="text-sm text-red-500">{errors.messageType.message}</p>
            )}
          </div>
          
          {/* Recipient (only for PRIVATE messages) */}
          {messageType === 'PRIVATE' && (
            <div className="space-y-2">
              <Label htmlFor="recipientId">Recipient</Label>
              <Controller
                name="recipientId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="recipientId" className={errors.recipientId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.recipientId && (
                <p className="text-sm text-red-500">{errors.recipientId.message}</p>
              )}
            </div>
          )}
          
          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="content"
                  placeholder="Enter your message here..."
                  className={`min-h-[120px] resize-none ${errors.content ? 'border-red-500' : ''}`}
                  {...field}
                />
              )}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageModal;
