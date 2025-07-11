import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Search, 
  MoreVertical,
  ArrowLeft,
  Paperclip,
  Smile
} from 'lucide-react';
import { PushbulletDevice, PushbulletSms } from '../types/pushbullet';

interface SmsThread {
  thread_id: string;
  contact_name?: string;
  contact_number: string;
  last_message: string;
  last_timestamp: number;
  unread_count: number;
  messages: PushbulletSms[];
}

interface SmsInterfaceProps {
  devices: PushbulletDevice[];
  onSendSms: (deviceIden: string, addresses: string[], message: string) => void;
  onLoadSmsThreads: (deviceIden: string) => Promise<any[]>;
}

const SmsInterface: React.FC<SmsInterfaceProps> = ({ 
  devices, 
  onSendSms, 
  onLoadSmsThreads 
}) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [threads, setThreads] = useState<SmsThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<SmsThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const smsDevices = devices.filter(d => d.has_sms);

  useEffect(() => {
    if (selectedDevice) {
      loadThreads();
    }
  }, [selectedDevice]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedThread?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreads = async () => {
    if (!selectedDevice) return;
    
    setLoading(true);
    try {
      const smsData = await onLoadSmsThreads(selectedDevice);
      
      console.log('SMS Data received:', smsData); // Debug log
      
      // Group messages by thread_id
      const threadMap = new Map<string, SmsThread>();
      
      smsData.forEach((sms: any) => {
        // Handle different SMS data structures
        const threadId = sms.thread_id || sms.conversation_iden || sms.addresses?.[0] || `thread_${Math.random()}`;
        const contactNumber = sms.addresses?.[0] || sms.address || sms.phone_number || 'Unknown';
        const messageBody = sms.body || sms.text || sms.message || '';
        const messageTimestamp = sms.timestamp || sms.created || sms.modified || Date.now() / 1000;
        const messageDirection = sms.direction || (sms.type === 'sms' ? 'incoming' : 'outgoing');
        
        if (!threadMap.has(threadId)) {
          threadMap.set(threadId, {
            thread_id: threadId,
            contact_number: contactNumber,
            contact_name: getContactName(contactNumber),
            last_message: messageBody,
            last_timestamp: messageTimestamp,
            unread_count: 0,
            messages: []
          });
        }
        
        const thread = threadMap.get(threadId)!;
        thread.messages.push({
          iden: sms.iden || sms.id || `${Date.now()}-${Math.random()}`,
          thread_id: threadId,
          timestamp: messageTimestamp,
          body: messageBody,
          direction: messageDirection,
          addresses: sms.addresses || [contactNumber],
          target_device_iden: selectedDevice
        });
        
        // Update last message info
        if (messageTimestamp > thread.last_timestamp) {
          thread.last_message = messageBody;
          thread.last_timestamp = messageTimestamp;
        }
      });
      
      // Sort messages within each thread
      threadMap.forEach(thread => {
        thread.messages.sort((a, b) => a.timestamp - b.timestamp);
      });
      
      // Convert to array and sort by last message timestamp
      const threadsArray = Array.from(threadMap.values())
        .sort((a, b) => b.last_timestamp - a.last_timestamp);
      
      setThreads(threadsArray);
    } catch (error) {
      console.error('Error loading SMS threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContactName = (number: string): string => {
    // In a real app, you'd look this up in contacts
    return number;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !selectedDevice) return;
    
    try {
      await onSendSms(selectedDevice, [selectedThread.contact_number], newMessage.trim());
      
      // Add message to local state optimistically
      const newSms: PushbulletSms = {
        iden: `temp-${Date.now()}`,
        thread_id: selectedThread.thread_id,
        timestamp: Date.now() / 1000,
        body: newMessage.trim(),
        direction: 'outgoing',
        addresses: [selectedThread.contact_number],
        target_device_iden: selectedDevice
      };
      
      setSelectedThread(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newSms],
        last_message: newMessage.trim(),
        last_timestamp: newSms.timestamp
      } : null);
      
      setNewMessage('');
      
      // Refresh threads after a short delay
      setTimeout(loadThreads, 1000);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) {
      return 'Unknown';
    }
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredThreads = threads.filter(thread =>
    thread.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.contact_number.includes(searchQuery) ||
    thread.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (smsDevices.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No SMS-enabled devices</h3>
          <p className="text-gray-500 mb-6">
            Connect an Android device with SMS permissions to use this feature
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white">
      {/* Device Selection & Thread List */}
      <div className={`${selectedThread ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-200`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
          
          {/* Device Selection */}
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          >
            <option value="">Select SMS Device</option>
            {smsDevices.map((device) => (
              <option key={device.iden} value={device.iden}>
                {device.nickname}
              </option>
            ))}
          </select>
          
          {/* Search */}
          {selectedDevice && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        
        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredThreads.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredThreads.map((thread) => (
                <button
                  key={thread.thread_id}
                  onClick={() => setSelectedThread(thread)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedThread?.thread_id === thread.thread_id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {thread.contact_name?.[0]?.toUpperCase() || thread.contact_number[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {thread.contact_name || thread.contact_number}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(thread.last_timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {thread.last_message}
                      </p>
                    </div>
                    {thread.unread_count > 0 && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {thread.unread_count}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : selectedDevice ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No conversations found</p>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Chat Interface */}
      {selectedThread ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center space-x-3">
            <button
              onClick={() => setSelectedThread(null)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {selectedThread.contact_name?.[0]?.toUpperCase() || selectedThread.contact_number[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {selectedThread.contact_name || selectedThread.contact_number}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedThread.contact_number}
              </p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {selectedThread.messages.map((message, index) => (
              <div
                key={message.iden}
                className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.direction === 'outgoing'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.body}</p>
                  <p className={`text-xs mt-1 ${
                    message.direction === 'outgoing' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsInterface;