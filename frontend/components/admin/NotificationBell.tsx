'use client';

import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { toast } from 'sonner';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export interface AppNotification {
  _id: string;
  type: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initial fetch
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/admin/notifications');
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    fetchNotifications();

    // Setup SSE
    const token = localStorage.getItem('token');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const eventSourceUrl = `${baseUrl}/admin/notifications/stream?token=${token}`; // Assuming your auth middleware can read query token if header not available, or you need to setup a custom EventSource

    // Basic EventSource doesn't support headers natively in browser.
    // We will use standard EventSource but append token in query params if your auth middleware supports it.
    // For now, let's implement standard EventSource.
    const eventSource = new EventSource(`${baseUrl}/admin/notifications/stream?token=${token}`);

    eventSource.onmessage = (event) => {
      // General messages
    };

    eventSource.addEventListener('new_notification', (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Play a sound if desired
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {}); // ignore autoplay errors
      } catch (e) {}

      toast.success(data.message, {
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => {
            if (data.data?.orderId) {
              router.push(`/admin/orders/${data.data.orderId}`);
            }
          }
        }
      });
    });

    return () => {
      eventSource.close();
    };
  }, [router]);

  const handleOpen = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      try {
        await api.put('/admin/notifications/read');
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-slate-400 hover:text-slate-950 transition-colors bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-orange-500/20">
          <Bell size={20} className="stroke-[2]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 border-2 border-white shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent align="end" sideOffset={8} className="w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-[100] overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-900 tracking-tight">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/50">
              {unreadCount} New
            </span>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
              <Bell className="opacity-20 mb-2" size={32} />
              <p className="text-sm font-bold">No notifications yet</p>
              <p className="text-xs">When you get orders, they'll show up here.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-50">
              {notifications.map((notification) => {
                const isExpanded = expandedId === notification._id;
                return (
                  <div 
                    key={notification._id} 
                    className={`p-4 transition-colors hover:bg-slate-50 flex gap-3 cursor-pointer ${!notification.isRead ? 'bg-orange-50/30' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isExpanded ? null : notification._id);
                    }}
                  >
                    <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${!notification.isRead ? 'bg-orange-500' : 'bg-transparent'}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm ${!notification.isRead ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                          {notification.message}
                        </p>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0 ml-2" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0 ml-2" />}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                          <p className="text-xs text-slate-600">
                            Order ID: <span className="font-mono">{notification.data?.orderId || 'Unknown'}</span>
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                              if (notification.data?.orderId) {
                                router.push(`/admin/orders/${notification.data.orderId}`);
                              }
                            }}
                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-orange-600 mt-1 hover:text-orange-700"
                          >
                            View Order & Update Status <ChevronRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
