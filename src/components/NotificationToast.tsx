import React, { useEffect } from 'react';
import { useAppStore, AppNotification } from '../store';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';

export function NotificationToast() {
  const { notifications } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

const NotificationItem: React.FC<{ notification: AppNotification }> = ({ notification }) => {
  const { removeNotification } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, removeNotification]);

  return (
    <div 
      className={`flex items-center gap-3 p-4 rounded-md shadow-lg text-white pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-right-full ${
        notification.type === 'success' ? 'bg-green-600' :
        notification.type === 'error' ? 'bg-red-600' :
        'bg-blue-600'
      }`}
    >
      {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
      {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
      {notification.type === 'info' && <Info className="w-5 h-5" />}
      <p className="text-sm font-medium">{notification.message}</p>
      <button onClick={() => removeNotification(notification.id)} className="ml-2 hover:bg-white/20 p-1 rounded-full">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
