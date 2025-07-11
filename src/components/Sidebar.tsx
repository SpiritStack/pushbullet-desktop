import React from 'react';
import { 
  Home, 
  Smartphone, 
  Users, 
  Radio, 
  MessageSquare, 
  Settings,
  Bell,
  Send
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, unreadCount }) => {
  const menuItems = [
    { id: 'pushes', icon: Home, label: 'Pushes', badge: unreadCount },
    { id: 'compose', icon: Send, label: 'Compose' },
    { id: 'devices', icon: Smartphone, label: 'Devices' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'channels', icon: Radio, label: 'Channels' },
    { id: 'sms', icon: MessageSquare, label: 'SMS' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Pushbullet</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;