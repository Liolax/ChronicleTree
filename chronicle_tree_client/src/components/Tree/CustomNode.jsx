import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Avatar from 'react-avatar';
import { FaPen, FaBullseye, FaTrash, FaMars, FaVenus, FaCheckCircle, FaHome } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const CustomNode = ({ data, id, selected }) => {
  const { person, onEdit, onDelete, onCenter, onPersonCardOpen, onRestructure, setOpenCardId, openCardId } = data;
  const avatarUrl = person.avatar_url;
  const birthYear = person.date_of_birth ? new Date(person.date_of_birth).getFullYear() : '';
  // const deathYear = person.date_of_death ? new Date(person.date_of_death).getFullYear() : '';
  const genderIcon = person.gender?.toLowerCase() === 'female' ? <FaVenus className="text-pink-500 ml-1" /> : person.gender?.toLowerCase() === 'male' ? <FaMars className="text-blue-500 ml-1" /> : null;
  const status = person.is_alive === false || person.date_of_death ? 'Deceased' : 'Alive';
  const statusColor = status === 'Alive' ? 'text-green-600' : 'text-gray-400';
  // Calculate age for node display
  const getAge = (dob, dod) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const end = dod ? new Date(dod) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
    return age;
  };
  const age = getAge(person.date_of_birth, person.date_of_death);

  // Node click: open card or toggle openCardId if provided
  const handleNodeClick = (e) => {
    if (e.target.closest('button')) return;
    // Defensive: skip undefined/empty nodes
    if (!person.first_name && !person.last_name && !person.date_of_birth && !person.avatar_url) return;
    if (typeof onPersonCardOpen === 'function') {
      onPersonCardOpen(person);
    } else if (typeof setOpenCardId === 'function') {
      setOpenCardId(openCardId === id ? null : id);
    }
  };

  // Defensive: skip rendering for undefined/empty nodes
  if (!person.first_name && !person.last_name && !person.date_of_birth && !person.avatar_url) return null;

  return (
    <div
      className={`w-[170px] bg-app-container border border-gray-200 rounded-xl shadow-md p-4 text-center cursor-pointer transition-all duration-200 \
        hover:shadow-lg hover:scale-[1.03] hover:-translate-y-[3px] \
        focus:outline-none focus:ring-2 focus:ring-button-primary\n        ${selected ? 'border-button-primary bg-[#edf8f5] shadow-lg ring-2 ring-button-primary' : ''}`}
      style={{ fontFamily: 'Inter, sans-serif', position: 'relative', zIndex: selected ? 1010 : 1, boxShadow: selected ? '0 8px 24px rgba(79,134,142,0.12)' : undefined }}
      onClick={handleNodeClick}
      aria-label={`Open details for ${person.first_name} ${person.last_name}`}
      aria-pressed={selected}
      tabIndex={0}
      role="button"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleNodeClick(e); }}
    >
      {/* React Flow handles for edge connections */}
      <Handle type="target" position={Position.Top} style={{ background: '#6366f1' }} />
      <div className="flex flex-col items-center mb-2">
        <Avatar
          name={`${person.first_name} ${person.last_name}`}
          src={avatarUrl}
          size="48"
          round
          className="mb-1 shadow"
        />
        <div className="flex items-center justify-center gap-1 text-base font-semibold">
          {person.first_name} {person.last_name} {genderIcon}
        </div>
        {/* Status indicator for deceased/alive */}
        <div className={`text-xs font-semibold mt-1 ${statusColor}`}>
          {status}
        </div>
        {/* Combined age and birth year display to prevent overlapping */}
        <div className="text-xs text-gray-700 mt-1 min-h-[16px] flex flex-col items-center">
          {age !== null && (
            <div>{age} y.o.</div>
          )}
          {birthYear && (
            <div className="text-black font-semibold">{birthYear}</div>
          )}
        </div>
      </div>
      {/* Action buttons (edit, delete, center, restructure) */}
      <div className="flex justify-center gap-2 mt-2">
        {onRestructure && <button onClick={e => { e.stopPropagation(); onRestructure(person.id); }} title="Make Root" aria-label={`Make ${person.first_name} ${person.last_name} the root person`} className="text-green-500 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 rounded" tabIndex={0}><FaHome /><Tooltip anchorSelect="[aria-label*='Make'][aria-label*='root']" place="top">Make Root</Tooltip></button>}
        {onCenter && <button onClick={e => { e.stopPropagation(); onCenter(person.id); }} title="Center" aria-label={`Center on ${person.first_name} ${person.last_name}`} className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded" tabIndex={0}><FaBullseye /><Tooltip anchorSelect="[aria-label^='Center']" place="top">Center</Tooltip></button>}
        {onEdit && <button onClick={e => { e.stopPropagation(); onEdit(person); }} title="Edit" aria-label={`Edit ${person.first_name} ${person.last_name}`} className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded" tabIndex={0}><FaPen /><Tooltip anchorSelect="[aria-label^='Edit']" place="top">Edit</Tooltip></button>}
        {onDelete && <button onClick={e => { e.stopPropagation(); onDelete(person); }} title="Delete" aria-label={`Delete ${person.first_name} ${person.last_name}`} className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 rounded" tabIndex={0}><FaTrash /><Tooltip anchorSelect="[aria-label^='Delete']" place="top">Delete</Tooltip></button>}
      </div>
      {/* React Flow handle for outgoing edges */}
      <Handle type="source" position={Position.Bottom} style={{ background: '#6366f1' }} />
    </div>
  );
};

export default memo(CustomNode);
