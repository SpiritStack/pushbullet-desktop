import React, { useState, useEffect } from 'react';
import { Send, Upload, X } from 'lucide-react';
import { PushbulletDevice, PushbulletContact, CreatePushData } from '../types/pushbullet';

interface ComposeFormProps {
  devices: PushbulletDevice[];
  contacts: PushbulletContact[];
  onSendPush: (data: CreatePushData) => void;
  onUploadFile: (file: File) => Promise<{ file_name: string; file_type: string; file_url: string }>;
}

const ComposeForm: React.FC<ComposeFormProps> = ({ devices, contacts, onSendPush, onUploadFile }) => {
  const [pushType, setPushType] = useState<'note' | 'link' | 'file' | 'address'>('note');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'device' | 'contact'>('all');
  const [targetDevice, setTargetDevice] = useState('');
  const [targetContact, setTargetContact] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ file_name: string; file_type: string; file_url: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pushData: CreatePushData = { type: pushType };
    
    if (pushType === 'note') {
      pushData.title = title;
      pushData.body = body;
    } else if (pushType === 'link') {
      pushData.title = title;
      pushData.body = body;
      pushData.url = url;
    } else if (pushType === 'file' && uploadedFile) {
      pushData.file_name = uploadedFile.file_name;
      pushData.file_type = uploadedFile.file_type;
      pushData.file_url = uploadedFile.file_url;
      pushData.title = title;
      pushData.body = body;
    } else if (pushType === 'address') {
      pushData.name = name;
      pushData.address = address;
    }
    
    if (targetType === 'device' && targetDevice) {
      pushData.device_iden = targetDevice;
    } else if (targetType === 'contact' && targetContact) {
      pushData.email = targetContact;
    }
    
    onSendPush(pushData);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setUrl('');
    setName('');
    setAddress('');
    setUploadedFile(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const result = await onUploadFile(file);
      setUploadedFile(result);
      setPushType('file');
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Compose Push</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Push Type
          </label>
          <select
            value={pushType}
            onChange={(e) => setPushType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="note">Note</option>
            <option value="link">Link</option>
            <option value="file">File</option>
            <option value="address">Address</option>
          </select>
        </div>

        {pushType === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">Choose File</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
              {uploadedFile && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600">{uploadedFile.file_name}</span>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {(pushType === 'note' || pushType === 'link' || pushType === 'file') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter message"
              />
            </div>
          </>
        )}

        {pushType === 'link' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
              required
            />
          </div>
        )}

        {pushType === 'address' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Place name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street address"
                required
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Send To
          </label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          >
            <option value="all">All Devices</option>
            <option value="device">Specific Device</option>
            <option value="contact">Contact</option>
          </select>

          {targetType === 'device' && (
            <select
              value={targetDevice}
              onChange={(e) => setTargetDevice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Device</option>
              {devices.map((device) => (
                <option key={device.iden} value={device.iden}>
                  {device.nickname}
                </option>
              ))}
            </select>
          )}

          {targetType === 'contact' && (
            <select
              value={targetContact}
              onChange={(e) => setTargetContact(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Contact</option>
              {contacts.map((contact) => (
                <option key={contact.iden} value={contact.email}>
                  {contact.name} ({contact.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || (pushType === 'file' && !uploadedFile)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Send Push</span>
        </button>
      </form>
    </div>
  );
};

export default ComposeForm;