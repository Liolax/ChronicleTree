import React, { useRef, useLayoutEffect, useState } from 'react';
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

const PersonCard = ({ person, onEdit, onDelete, onClose, position, fixed }) => {
  const cardRef = useRef(null);
  const [clamped, setClamped] = useState({ left: 0, top: 0 });

  if (!person) return null;
  const birthDate = person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : '';
  const deathDate = person.date_of_death ? new Date(person.date_of_death).toLocaleDateString() : '';
  const initials = getInitials(person.first_name, person.last_name);
  const age = getAge(person.date_of_birth, person.date_of_death);
  const avatarUrl = person.avatar_url;
  const genderIcon = person.gender === 'Female' ? <FaVenus className="text-pink-500 ml-1" title="Female" /> : person.gender === 'Male' ? <FaMars className="text-blue-500 ml-1" title="Male" /> : null;

  // If fixed, use screen coordinates and clamp to viewport
  let left = position ? position.x : 0;
  let top = position ? position.y : 0;
  useLayoutEffect(() => {
    if (!cardRef.current || !fixed) return;
    const card = cardRef.current;
    const cardRect = card.getBoundingClientRect();
    const padding = 8;
    const maxLeft = window.innerWidth - cardRect.width - padding;
    const maxTop = window.innerHeight - cardRect.height - padding;
    setClamped({
      left: Math.max(padding, Math.min(left, maxLeft)),
      top: Math.max(padding, Math.min(top, maxTop)),
    });
  }, [left, top, fixed]);

  const style = fixed
    ? {
        position: 'fixed',
        left: clamped.left,
        top: clamped.top,
        zIndex: 2000,
        fontFamily: 'Inter, sans-serif',
        minWidth: '180px',
        maxWidth: '220px',
        padding: 0,
        ...fadeInCard,
      }
    : position
    ? {
        position: 'absolute',
        left: clamped.left,
        top: clamped.top,
        zIndex: 2000,
        fontFamily: 'Inter, sans-serif',
        minWidth: '180px',
        maxWidth: '220px',
        padding: 0,
        ...fadeInCard,
      }
    : { fontFamily: 'Inter, sans-serif', minWidth: '180px', maxWidth: '220px', ...fadeInCard };

  return (
    <div
      ref={cardRef}
      className="bg-app-container rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.13)] border border-gray-200 px-3 py-3 flex flex-col items-center animate-fadeInCard"
      style={style}
    >
      <button className="absolute top-2 right-2 text-app-secondary hover:text-red-500 text-lg transition-colors" onClick={onClose} aria-label="Close">
        <FaTimes />
      </button>
      <div className="flex flex-col items-center mb-2 w-full">
        <Avatar
          name={`${person.first_name} ${person.last_name}`}
          src={avatarUrl}
          size="32"
          round={true}
          className="border-2 border-white shadow mb-1"
          style={{ width: '32px', height: '32px', fontSize: '0.9rem', boxShadow: '0 0 4px rgba(0,0,0,0.10)' }}
        />
        <div className="text-base font-bold text-app-primary text-center mt-1 truncate w-full flex items-center justify-center gap-1">
          {person.first_name} {person.last_name} {genderIcon}
        </div>
        <div className="text-xs text-app-secondary mt-1 text-center w-full">
          {birthDate}{deathDate ? ` — ${deathDate}` : ''}
        </div>
        {age !== null && (
          <div className="text-gray-500 text-xs mt-1">Age: {age}</div>
        )}
      </div>
      <div className="flex flex-col gap-1 w-full mt-2">
        <button className="w-full bg-[#edf8f5] text-[#4F868E] px-2 py-1 rounded font-semibold shadow hover:bg-[#e0f3ec] transition-colors flex items-center justify-center gap-1 text-xs" onClick={() => window.location.href = `/profile/${person.id}`}>
          <FaEye />View Profile
        </button>
        <button className="w-full bg-gray-100 text-app-primary px-2 py-1 rounded font-semibold shadow hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 text-xs" onClick={() => onEdit && onEdit(person)}>
          <FaPen />Edit
        </button>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-semibold shadow transition-colors flex items-center justify-center gap-1 text-xs" onClick={() => onDelete && onDelete(person)}>
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
