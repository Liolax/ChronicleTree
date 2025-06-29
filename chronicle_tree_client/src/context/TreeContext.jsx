import React, { createContext, useContext, useState } from 'react';

const TreeContext = createContext();

export const useTreeContext = () => useContext(TreeContext);

export const TreeProvider = ({ children }) => {
  const [isAddPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [isAddRelationshipModalOpen, setAddRelationshipModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const openAddPersonModal = () => setAddPersonModalOpen(true);
  const closeAddPersonModal = () => setAddPersonModalOpen(false);

  const openAddRelationshipModal = () => setAddRelationshipModalOpen(true);
  const closeAddRelationshipModal = () => setAddRelationshipModalOpen(false);

  const openPersonCard = (person) => setSelectedPerson(person);
  const closePersonCard = () => setSelectedPerson(null);

  const value = {
    isAddPersonModalOpen,
    openAddPersonModal,
    closeAddPersonModal,
    isAddRelationshipModalOpen,
    openAddRelationshipModal,
    closeAddRelationshipModal,
    selectedPerson,
    openPersonCard,
    closePersonCard,
  };

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
};
