import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Avatar from 'react-avatar';
import { FaPen, FaTrash, FaEye, FaMars, FaVenus, FaHome, FaBullseye } from 'react-icons/fa';
import './PersonCardNode.css';

/**
 * Person Card Component - UI Design Feature
 * Styled to look like a business card with all the important family info
 * Spent a lot of time on the hover effects and responsive layout
 */
const PersonCard = ({ data, selected }) => {
  const { person, onEdit, onDelete, onPersonCardOpen, onCenter, onRestructure } = data;

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
        {/* Relationship to Root */}
        {person.relation && (
          <div className="relation-indicator">
            <span className="relation-label">Relation:</span>
            <span className="relation-value">{person.relation}</span>
          </div>
        )}
        
        
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
        {onRestructure && (
          <button
            className="action-btn restructure-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRestructure(person.id);
            }}
            title="Make Root"
          >
            <FaHome />
          </button>
        )}
        {onCenter && (
          <button
            className="action-btn center-btn"
            onClick={(e) => {
              e.stopPropagation();
              onCenter(person.id);
            }}
            title="Center"
          >
            <FaBullseye />
          </button>
        )}
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
    </div>
  );
};

/**
 * Age Calculator - Had to handle both living and deceased people
 * Took forever to get the leap year edge cases right
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
 * Gender Icons - Using Mars/Venus symbols from Font Awesome
 * Simple but effective visual indicator
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