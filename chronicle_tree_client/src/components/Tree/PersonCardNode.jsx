import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Avatar from 'react-avatar';
import { FaPen, FaTrash, FaEye, FaMars, FaVenus, FaHeart } from 'react-icons/fa';

/**
 * Enhanced PersonCard component for family tree nodes
 * Designed to be more card-like with detailed information display
 */
const PersonCard = ({ data, selected }) => {
  const { person, onEdit, onDelete, onPersonCardOpen } = data;

  if (!person) return null;

  const birthYear = person.date_of_birth ? new Date(person.date_of_birth).getFullYear() : null;
  const deathYear = person.date_of_death ? new Date(person.date_of_death).getFullYear() : null;
  const age = calculateAge(person.date_of_birth, person.date_of_death);
  const isAlive = !person.date_of_death && person.is_alive !== false;

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    if (onPersonCardOpen) {
      onPersonCardOpen(person, e);
    }
  };

  return (
    <div
      className={`family-tree-card ${selected ? 'selected' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick(e);
        }
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="family-tree-handle"
      />
      
      {/* Header with Avatar and Name */}
      <div className="card-header">
        <Avatar
          name={`${person.first_name} ${person.last_name}`}
          src={person.avatar_url}
          size="60"
          round
          className="card-avatar"
        />
        <div className="card-name">
          <h3>
            {person.first_name} {person.last_name}
            {getGenderIcon(person.gender)}
          </h3>
        </div>
      </div>

      {/* Card Body with Details */}
      <div className="card-body">
        {/* Birth/Death Info */}
        <div className="card-info">
          <div className="info-row">
            <span className="info-label">Born:</span>
            <span className="info-value">{birthYear || 'Unknown'}</span>
          </div>
          {deathYear && (
            <div className="info-row">
              <span className="info-label">Died:</span>
              <span className="info-value">{deathYear}</span>
            </div>
          )}
          {age && (
            <div className="info-row">
              <span className="info-label">Age:</span>
              <span className="info-value">{age} years</span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {person.company && (
          <div className="info-row">
            <span className="info-label">Company:</span>
            <span className="info-value">{person.company}</span>
          </div>
        )}
        
        {person.zodiac && (
          <div className="info-row">
            <span className="info-label">Zodiac:</span>
            <span className="info-value">{person.zodiac}</span>
          </div>
        )}

        {/* Status */}
        <div className={`status-indicator ${isAlive ? 'alive' : 'deceased'}`}>
          {isAlive ? 'Alive' : 'Deceased'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        <button
          className="action-btn view-btn"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/profile/${person.id}`;
          }}
          title="View Profile"
        >
          <FaEye />
        </button>
        <button
          className="action-btn edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onEdit) onEdit(person);
          }}
          title="Edit"
        >
          <FaPen />
        </button>
        <button
          className="action-btn delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(person);
          }}
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="family-tree-handle"
      />

      <style jsx>{`
        .family-tree-card {
          width: 220px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 16px;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          font-family: 'Inter', sans-serif;
        }

        .family-tree-card:hover {
          border-color: #6366f1;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .family-tree-card.selected {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          background: #f8fafc;
        }

        .family-tree-handle {
          background: #6366f1 !important;
          border: 2px solid white !important;
          width: 12px !important;
          height: 12px !important;
        }

        .card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 12px;
        }

        .card-avatar {
          margin-bottom: 8px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .card-name h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          text-align: center;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-body {
          margin-bottom: 12px;
        }

        .card-info {
          background: #f8fafc;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 8px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          font-size: 12px;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-label {
          font-weight: 500;
          color: #6b7280;
        }

        .info-value {
          font-weight: 600;
          color: #1f2937;
        }

        .status-indicator {
          text-align: center;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-indicator.alive {
          background: #dcfce7;
          color: #166534;
        }

        .status-indicator.deceased {
          background: #fee2e2;
          color: #991b1b;
        }

        .card-actions {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
        }

        .view-btn {
          background: #e0f2fe;
          color: #0369a1;
        }

        .view-btn:hover {
          background: #bae6fd;
        }

        .edit-btn {
          background: #f3f4f6;
          color: #4b5563;
        }

        .edit-btn:hover {
          background: #e5e7eb;
        }

        .delete-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .delete-btn:hover {
          background: #fecaca;
        }

        .gender-icon {
          font-size: 14px;
        }

        .gender-icon.male {
          color: #3b82f6;
        }

        .gender-icon.female {
          color: #ec4899;
        }
      `}</style>
    </div>
  );
};

/**
 * Calculate age based on birth and death dates
 */
const calculateAge = (birthDate, deathDate) => {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get gender icon component
 */
const getGenderIcon = (gender) => {
  if (gender?.toLowerCase() === 'male') {
    return <FaMars className="gender-icon male" />;
  }
  if (gender?.toLowerCase() === 'female') {
    return <FaVenus className="gender-icon female" />;
  }
  return null;
};

export default memo(PersonCard);