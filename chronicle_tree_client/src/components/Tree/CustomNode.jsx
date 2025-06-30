import { Handle, Position } from 'reactflow';
import React, { memo } from 'react';
import Avatar from 'react-avatar';
import { FaPen, FaBullseye, FaTrash, FaMars, FaVenus, FaCheckCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const CustomNode = ({ data, id, selected }) => {
  const { person, onEdit, onDelete, onCenter, setOpenCardId, openCardId } = data;
  const avatarUrl = person.avatar_url;
  const birthYear = person.date_of_birth ? new Date(person.date_of_birth).getFullYear() : '';
  const deathYear = person.date_of_death ? new Date(person.date_of_death).getFullYear() : '';
  const genderIcon = person.gender === 'Female' ? <FaVenus className="text-pink-500 ml-1" /> : person.gender === 'Male' ? <FaMars className="text-blue-500 ml-1" /> : null;
  const status = person.is_alive === false || person.date_of_death ? 'Deceased' : 'Alive';
  const statusColor = status === 'Alive' ? 'text-green-600' : 'text-gray-400';

  const handleNodeClick = () => {
    if (typeof setOpenCardId === 'function') {
      setOpenCardId(openCardId === id ? null : id);
    }
  };

  return (
    <div
      className={`w-[170px] bg-app-container border border-gray-200 rounded-xl shadow-md p-4 text-center cursor-pointer transition-all duration-200 \
        hover:shadow-lg hover:scale-[1.03] hover:-translate-y-[3px] \
        focus:outline-none focus:ring-2 focus:ring-button-primary\n        ${selected ? 'border-button-primary bg-[#edf8f5] shadow-lg ring-2 ring-button-primary' : ''}`}
      style={{ fontFamily: 'Inter, sans-serif', position: 'relative', zIndex: openCardId === id ? 1010 : 1, boxShadow: selected ? '0 8px 24px rgba(79,134,142,0.12)' : undefined }}
      onClick={handleNodeClick}
      aria-label={`Open details for ${person.first_name} ${person.last_name}`}
      aria-pressed={openCardId === id}
      tabIndex={0}
      role="button"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleNodeClick(); }}
    >
      <div className="flex flex-col items-center mb-2">
        <Avatar
          name={`${person.first_name} ${person.last_name}`}
          src={avatarUrl}
          size="48"
          round
          className="mb-1"
        />
        <div className="flex items-center justify-center gap-1 text-base font-semibold">
          {person.first_name} {person.last_name} {genderIcon}
        </div>
        <div className={`text-xs font-medium ${statusColor} flex items-center gap-1`}>
          <FaCheckCircle /> {status}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {birthYear}{deathYear ? ` – ${deathYear}` : ''}
        </div>
      </div>
      {/* Action buttons (edit, delete, center) */}
      <div className="flex justify-center gap-2 mt-2">
        {onEdit && <button onClick={e => { e.stopPropagation(); onEdit(person); }} title="Edit" aria-label={`Edit ${person.first_name} ${person.last_name}`} className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded" tabIndex={0}><FaPen /><Tooltip anchorSelect="[aria-label^='Edit']" place="top">Edit</Tooltip></button>}
        {onDelete && <button onClick={e => { e.stopPropagation(); onDelete(person); }} title="Delete" aria-label={`Delete ${person.first_name} ${person.last_name}`} className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 rounded" tabIndex={0}><FaTrash /><Tooltip anchorSelect="[aria-label^='Delete']" place="top">Delete</Tooltip></button>}
        {onCenter && <button onClick={e => { e.stopPropagation(); onCenter(person); }} title="Center on this person" aria-label={`Center on ${person.first_name} ${person.last_name}`} className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded" tabIndex={0}><FaBullseye /><Tooltip anchorSelect="[aria-label^='Center']" place="top">Center</Tooltip></button>}
      </div>
      <Handle type="target" position={Position.Top} style={{ background: '#4F868E' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#4F868E' }} />
    </div>
  );
};

export default memo(CustomNode);
