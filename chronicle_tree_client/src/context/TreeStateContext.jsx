import React, { createContext, useContext, useState } from 'react';

const TreeStateContext = createContext();

export const useTreeState = () => useContext(TreeStateContext);

export const TreeProvider = ({ children }) => {
  const [isAddPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [isAddRelationshipModalOpen, setAddRelationshipModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  // Ensure only one modal is open at a time
  const openAddPersonModal = () => {
    setAddRelationshipModalOpen(false);
    setSelectedPerson(null);
    setAddPersonModalOpen(true);
  };
  const closeAddPersonModal = () => setAddPersonModalOpen(false);

  const openAddRelationshipModal = () => {
    setAddPersonModalOpen(false);
    setSelectedPerson(null);
    setAddRelationshipModalOpen(true);
  };
  const closeAddRelationshipModal = () => setAddRelationshipModalOpen(false);

  const openPersonCard = (person) => {
    setAddPersonModalOpen(false);
    setAddRelationshipModalOpen(false);
    setSelectedPerson(person);
  };
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
    isPersonCardVisible: !!selectedPerson,
  };

  return (
    <TreeStateContext.Provider value={value}>
      {children}
    </TreeStateContext.Provider>
  );
};
