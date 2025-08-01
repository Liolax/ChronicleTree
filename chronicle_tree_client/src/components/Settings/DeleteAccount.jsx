import React, { useState } from 'react';
import { useDeleteAccount } from '../../services/users';
import { useAuth } from '../../hooks/useAuth';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

export default function DeleteAccount() {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const deleteAccount = useDeleteAccount();
  const { user } = useAuth();

  const handleDeleteAccount = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: () => setDeleteModalOpen(false),
    });
  };

  const isConfirmValid = confirmText === 'DELETE';

  return (
    <>
      <Card title="Danger Zone">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-red-700">Delete Your Account</h4>
            <p className="text-sm text-gray-600">
              Permanently remove your account and all of its content.{' '}
              <span className="font-bold text-red-700">This action cannot be undone.</span>
            </p>
          </div>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            Delete Account
          </Button>
        </div>
      </Card>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <div className="space-y-4">
          <p className="text-red-700 font-semibold">Are you absolutely sure you want to delete your account?</p>
          <p className="text-gray-700">
            This will permanently delete your account{' '}
            <span className="font-bold">{user?.email}</span> and all associated data.{' '}
            <span className="font-bold text-red-700">This action cannot be undone.</span>
          </p>
          <p className="text-gray-700">
            Please type{' '}
            <span className="font-mono font-bold">DELETE</span> to confirm.
          </p>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-400"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" onClick={() => setDeleteModalOpen(false)} variant="grey" disabled={deleteAccount.isPending}>Cancel</Button>
            <Button type="button" onClick={handleDeleteAccount} disabled={!isConfirmValid || deleteAccount.isPending} variant="danger">
              {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
