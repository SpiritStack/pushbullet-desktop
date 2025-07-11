import React, { useState } from 'react';
import { Smartphone, Monitor, Tablet, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { PushbulletDevice } from '../types/pushbullet';

interface DevicesListProps {
  devices: PushbulletDevice[];
  onCreateDevice: (nickname: string) => void;
  onUpdateDevice: (iden: string, data: Partial<PushbulletDevice>) => void;
  onDeleteDevice: (iden: string) => void;
}

const DevicesList: React.FC<DevicesListProps> = ({
  devices,
  onCreateDevice,
  onUpdateDevice,
  onDeleteDevice
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'android':
      case 'ios':
        return <Smartphone className="w-5 h-5" />;
      case 'chrome':
      case 'firefox':
      case 'opera':
      case 'safari':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Tablet className="w-5 h-5" />;
    }
  };

  const handleCreateDevice = () => {
    if (newDeviceName.trim()) {
      onCreateDevice(newDeviceName.trim());
      setNewDeviceName('');
      setShowCreateForm(false);
    }
  };

  const handleEditDevice = (device: PushbulletDevice) => {
    setEditingDevice(device.iden);
    setEditingName(device.nickname);
  };

  const handleSaveEdit = (iden: string) => {
    if (editingName.trim()) {
      onUpdateDevice(iden, { nickname: editingName.trim() });
    }
    setEditingDevice(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingDevice(null);
    setEditingName('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Devices</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Device</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Device</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              placeholder="Device name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateDevice}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {devices.map((device) => (
          <div
            key={device.iden}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-gray-500">
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  {editingDevice === device.iden ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-lg font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-lg font-medium text-gray-900">{device.nickname}</h3>
                  )}
                  <p className="text-sm text-gray-500">
                    {device.manufacturer} {device.model} • {device.type}
                  </p>
                  {device.has_sms && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                      SMS Enabled
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {editingDevice === device.iden ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(device.iden)}
                      className="p-2 text-green-600 hover:text-green-800"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditDevice(device)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDevice(device.iden)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12">
          <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
          <p className="text-gray-500">Create your first device to start pushing</p>
        </div>
      )}
    </div>
  );
};

export default DevicesList;