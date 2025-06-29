import React, { useState } from 'react';
import { useDeleteAccount } from '../../services/users';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

export default function DeleteAccount() {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const deleteAccount = useDeleteAccount();

  const handleDeleteAccount = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: () => setDeleteModalOpen(false),
    });
  };

  return (
    <>
      <Card title="Danger Zone">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold">Delete Your Account</h4>
            <p className="text-sm text-gray-600">Permanently remove your account and all of its content.</p>
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
        footer={
          <>
            <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteAccount.isPending}>
              {deleteAccount.isPending ? 'Deleting...' : 'Delete'}
            </Button>
            <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          </>
        }
      >
        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
      </Modal>
    </>
  );
}
