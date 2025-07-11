import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2, Check, X, Mail } from 'lucide-react';
import { PushbulletContact } from '../types/pushbullet';

interface ContactsListProps {
  contacts: PushbulletContact[];
  onCreateContact: (name: string, email: string) => void;
  onUpdateContact: (iden: string, data: Partial<PushbulletContact>) => void;
  onDeleteContact: (iden: string) => void;
}

const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  onCreateContact,
  onUpdateContact,
  onDeleteContact
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateContact = () => {
    if (newContactName.trim() && newContactEmail.trim()) {
      onCreateContact(newContactName.trim(), newContactEmail.trim());
      setNewContactName('');
      setNewContactEmail('');
      setShowCreateForm(false);
    }
  };

  const handleEditContact = (contact: PushbulletContact) => {
    setEditingContact(contact.iden);
    setEditingName(contact.name);
  };

  const handleSaveEdit = (iden: string) => {
    if (editingName.trim()) {
      onUpdateContact(iden, { name: editingName.trim() });
    }
    setEditingContact(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
    setEditingName('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Contact</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Contact name"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              value={newContactEmail}
              onChange={(e) => setNewContactEmail(e.target.value)}
              placeholder="Email address"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleCreateContact}
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
        {contacts.map((contact) => (
          <div
            key={contact.iden}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {contact.image_url ? (
                    <img
                      src={contact.image_url}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <Users className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  {editingContact === contact.iden ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-lg font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
                  )}
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>{contact.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {editingContact === contact.iden ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(contact.iden)}
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
                      onClick={() => handleEditContact(contact)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteContact(contact.iden)}
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

      {contacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-500">Add contacts to easily send pushes to specific people</p>
        </div>
      )}
    </div>
  );
};

export default ContactsList;