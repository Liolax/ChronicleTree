import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Avatar from 'react-avatar';
import { FaPen, FaBullseye, FaTrash, FaMars, FaVenus, FaCheckCircle, FaHome } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const CustomNode = ({ data, id, selected }) => {
  const { person, onEdit, onDelete, onCenter, onPersonCardOpen, onRestructure, setOpenCardId, openCardId } = data;
  // Get the avatar image URL for the person (used for their profile picture)
  const avatarUrl = person.avatar_url;
  // Extract birth year from the date_of_birth field for display
  const birthYear = person.date_of_birth ? new Date(person.date_of_birth).getFullYear() : '';
  // Choose the gender icon based on the person's gender value
  const genderIcon = person.gender?.toLowerCase() === 'female' ? <FaVenus className="text-pink-500 ml-1" /> : person.gender?.toLowerCase() === 'male' ? <FaMars className="text-blue-500 ml-1" /> : null;
  // Determine if the person is alive or deceased for status display
  const status = person.is_alive === false || person.date_of_death ? 'Deceased' : 'Alive';
  // Set the color for the status text (green for alive, gray for deceased)
  const statusColor = status === 'Alive' ? 'text-green-600' : 'text-gray-400';
  // Helper function to calculate age from birth and death dates
  // Returns age in years, or null if birth date is missing
  const getAge = (dob, dod) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const end = dod ? new Date(dod) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
    return age;
  };
  // Calculate the person's age for display in the node
  const age = getAge(person.date_of_birth, person.date_of_death);

  // Handles node click: opens the person card or toggles its open state
  // Ignores clicks on action buttons (edit, delete, etc.)
  const handleNodeClick = (e) => {
    if (e.target.closest('button')) return;
    // Skip rendering for empty nodes (no person data)
    if (!person.first_name && !person.last_name && !person.date_of_birth && !person.avatar_url) return;
    // Open the person card if available, otherwise toggle openCardId
    if (typeof onPersonCardOpen === 'function') {
      onPersonCardOpen(person);
    } else if (typeof setOpenCardId === 'function') {
      setOpenCardId(openCardId === id ? null : id);
    }
  };

  // Skip rendering for undefined or empty nodes (no person data)
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
      {/* React Flow handles for connecting nodes in the tree */}
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
        {/* Show if the person is alive or deceased */}
        <div className={`text-xs font-semibold mt-1 ${statusColor}`}>
          {status}
        </div>
        {/* Show age and birth year below the name */}
        <div className="text-xs text-gray-700 mt-1 min-h-[16px] flex flex-col items-center">
          {age !== null && (
            <div>{age} y.o.</div>
          )}
          {birthYear && (
            <div className="text-black font-semibold">{birthYear}</div>
          )}
        </div>
      </div>
      {/* Action buttons for editing, deleting, centering, or making root */}
      <div className="flex justify-center gap-2 mt-2">
        {onRestructure && <button onClick={e => { e.stopPropagation(); onRestructure(person.id); }} title="Make Root" aria-label={`Make ${person.first_name} ${person.last_name} the root person`} className="text-green-500 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 rounded" tabIndex={0}><FaHome /><Tooltip anchorSelect="[aria-label*='Make'][aria-label*='root']" place="top">Make Root</Tooltip></button>}
        {onCenter && <button onClick={e => { e.stopPropagation(); onCenter(person.id); }} title="Center" aria-label={`Center on ${person.first_name} ${person.last_name}`} className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded" tabIndex={0}><FaBullseye /><Tooltip anchorSelect="[aria-label^='Center']" place="top">Center</Tooltip></button>}
        {onEdit && <button onClick={e => { e.stopPropagation(); onEdit(person); }} title="Edit" aria-label={`Edit ${person.first_name} ${person.last_name}`} className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded" tabIndex={0}><FaPen /><Tooltip anchorSelect="[aria-label^='Edit']" place="top">Edit</Tooltip></button>}
        {onDelete && <button onClick={e => { e.stopPropagation(); onDelete(person); }} title="Delete" aria-label={`Delete ${person.first_name} ${person.last_name}`} className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 rounded" tabIndex={0}><FaTrash /><Tooltip anchorSelect="[aria-label^='Delete']" place="top">Delete</Tooltip></button>}
      </div>
      {/* React Flow handle for outgoing connections to other nodes */}
      <Handle type="source" position={Position.Bottom} style={{ background: '#6366f1' }} />
    </div>
  );
};

export default memo(CustomNode);
