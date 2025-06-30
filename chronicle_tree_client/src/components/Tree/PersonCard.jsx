import React from 'react';
import Avatar from 'react-avatar';
import { FaPen, FaTrash, FaEye, FaTimes, FaMars, FaVenus } from 'react-icons/fa';

const getInitials = (first, last) => {
  if (!first && !last) return '?';
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  return (first || last)[0].toUpperCase();
};

const getAge = (birth, death) => {
  if (!birth) return null;
  const birthDate = new Date(birth);
  const endDate = death ? new Date(death) : new Date();
  let age = endDate.getFullYear() - birthDate.getFullYear();
  const m = endDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const fadeInCard = {
  animation: 'fadeInCard 0.3s cubic-bezier(0.4,0,0.2,1)',
};

const PersonCard = ({ person, onEdit, onDelete, onClose, position }) => {
  if (!person) return null;
  const birthDate = person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : '';
  const deathDate = person.date_of_death ? new Date(person.date_of_death).toLocaleDateString() : '';
  const initials = getInitials(person.first_name, person.last_name);
  const age = getAge(person.date_of_birth, person.date_of_death);
  const avatarUrl = person.avatar_url;
  const genderIcon = person.gender === 'Female' ? <FaVenus className="text-pink-500 ml-1" title="Female" /> : person.gender === 'Male' ? <FaMars className="text-blue-500 ml-1" title="Male" /> : null;

  // Position the card absolutely near the node
  const style = position
    ? {
        position: 'absolute',
        left: position.x + 180, // offset to the right of the node
        top: position.y - 40, // vertically align with node
        zIndex: 2000,
        fontFamily: 'Inter, sans-serif',
        minWidth: '260px',
        maxWidth: '320px',
        padding: 0,
        ...fadeInCard,
      }
    : { fontFamily: 'Inter, sans-serif', minWidth: '260px', maxWidth: '320px', ...fadeInCard };

  return (
    <div
      className="bg-app-container rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.2)] border-[1.5px] border-gray-200 px-7 py-7 flex flex-col items-center animate-fadeInCard"
      style={style}
    >
      <button className="absolute top-4 right-4 text-app-secondary hover:text-red-500 text-2xl transition-colors" onClick={onClose} aria-label="Close">
        <FaTimes />
      </button>
      <div className="flex flex-col items-center mb-4 w-full">
        <Avatar
          name={`${person.first_name} ${person.last_name}`}
          src={avatarUrl}
          size="52"
          round={true}
          className="border-4 border-white shadow mb-2"
          style={{ width: '52px', height: '52px', fontSize: '1.25rem', boxShadow: '0 0 6px rgba(0,0,0,0.10)' }}
        />
        <div className="text-xl font-bold text-app-primary text-center mt-2 truncate w-full flex items-center justify-center gap-2">
          {person.first_name} {person.last_name} {genderIcon}
        </div>
        <div className="text-app-secondary text-base mt-1 text-center w-full">
          {birthDate}{deathDate ? ` — ${deathDate}` : ''}
        </div>
        {age !== null && (
          <div className="text-gray-500 text-sm mt-1">Age: {age}</div>
        )}
      </div>
      <div className="flex flex-col gap-2 w-full mt-4">
        <button className="w-full bg-[#edf8f5] text-[#4F868E] px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#e0f3ec] transition-colors flex items-center justify-center gap-2" onClick={() => window.location.href = `/profile/${person.id}`}>
          <FaEye />View Profile
        </button>
        <button className="w-full bg-gray-100 text-app-primary px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-200 transition-colors flex items-center justify-center gap-2" onClick={() => onEdit && onEdit(person)}>
          <FaPen />Edit
        </button>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-colors flex items-center justify-center gap-2" onClick={() => onDelete && onDelete(person)}>
          <FaTrash />Delete
        </button>
      </div>
      <style>{`
        @keyframes fadeInCard {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PersonCard;
