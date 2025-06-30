import { Handle, Position } from 'reactflow';
import React, { memo } from 'react';
import Avatar from 'react-avatar';
import { FaPen, FaBullseye, FaTrash, FaMars, FaVenus, FaCheckCircle } from 'react-icons/fa';

const PersonNode = ({ data, id, selected }) => {
  const { person, onEdit, onDelete, onCenter, setOpenCardId, openCardId } = data;
  const avatarUrl = person.avatar_url;
  const birthYear = person.date_of_birth ? new Date(person.date_of_birth).getFullYear() : '';
  const deathYear = person.date_of_death ? new Date(person.date_of_death).getFullYear() : '';
  const genderIcon = person.gender === 'Female' ? <FaVenus className="text-pink-500 ml-1" /> : person.gender === 'Male' ? <FaMars className="text-blue-500 ml-1" /> : null;
  // Mock-up: status badge
  const status = person.is_alive === false || person.date_of_death ? 'Deceased' : 'Alive';
  const statusColor = status === 'Alive' ? 'text-green-600' : 'text-gray-400';

  // Only handle card open/close, no card rendering here
  const handleNodeClick = () => {
    if (typeof setOpenCardId === 'function') {
      setOpenCardId(openCardId === id ? null : id);
    }
  };

  return (
    <div
      className={`w-[170px] bg-app-container border border-gray-200 rounded-xl shadow-md p-4 text-center cursor-pointer transition-all duration-200 
        hover:shadow-lg hover:scale-[1.03] hover:-translate-y-[3px] 
        focus:outline-none focus:ring-2 focus:ring-button-primary
        ${selected ? 'border-button-primary bg-[#edf8f5] shadow-lg ring-2 ring-button-primary' : ''}`}
      style={{ fontFamily: 'Inter, sans-serif', position: 'relative', zIndex: openCardId === id ? 1010 : 1, boxShadow: selected ? '0 8px 24px rgba(79,134,142,0.12)' : undefined }}
      onClick={handleNodeClick}
      aria-label={`Open details for ${person.first_name} ${person.last_name}`}
      aria-pressed={openCardId === id}
      tabIndex={0}
      role="button"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleNodeClick(); }}
    >
      {/* Avatar, full name, gender icon, status badge always visible */}
      <div className="flex flex-col items-center mb-2">
        <Avatar
          name={`${person.first_name} ${person.last_name}`}
          src={avatarUrl}
          size="52"
          round={true}
          className="mb-1 border-4 border-white shadow"
          style={{ width: '52px', height: '52px', fontSize: '1.1rem', boxShadow: '0 0 5px rgba(0,0,0,0.15)' }}
        />
        <div className="font-semibold text-base text-app-primary truncate w-full flex items-center justify-center">
          {person.first_name} {person.last_name} {genderIcon}
        </div>
        {/* Status badge with year of birth (black color for year) */}
        <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-medium ${statusColor}`}>
          <FaCheckCircle className="inline-block" /> {status}
          {birthYear && (
            <span className="text-black font-semibold ml-1">{birthYear}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onCenter && onCenter(person.id); }}
          className="w-full flex items-center justify-center gap-2 bg-app-accent text-white py-1.5 rounded-md font-semibold text-xs shadow hover:bg-button-primary transition-colors"
          title="Center Tree"
          aria-label="Center tree on person"
        >
          <FaBullseye /> Center
        </button>
        <div className="flex justify-center gap-2 mt-1">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); if (typeof setOpenCardId === 'function') setOpenCardId(null); onEdit && onEdit(person); }}
            className="text-app-primary hover:text-link p-1 rounded transition-colors"
            title="Edit"
            aria-label="Edit person"
          >
            <FaPen />
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete && onDelete(person); }}
            className="text-button-danger hover:text-button-danger-hover p-1 rounded transition-colors"
            title="Delete"
            aria-label="Delete person"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-app-accent" />
      <Handle type="source" position={Position.Bottom} className="!bg-app-accent" />
    </div>
  );
};

export default memo(PersonNode);
