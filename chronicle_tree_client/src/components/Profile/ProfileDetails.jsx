import React, { useState } from 'react';
import { FaUser, FaVenusMars, FaBirthdayCake, FaSkullCrossbones, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../api/api';
import Button from '../UI/Button'; // Adjust the import path as necessary

export default function ProfileDetails({ person, editing, onPersonUpdated }) {
  const [form, setForm] = useState({
    first_name: person?.first_name || '',
    last_name: person?.last_name || '',
    gender: person?.gender || '',
    date_of_birth: person?.date_of_birth || '',
    date_of_death: person?.date_of_death || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setForm({
      first_name: person?.first_name || '',
      last_name: person?.last_name || '',
      gender: person?.gender || '',
      date_of_birth: person?.date_of_birth || '',
      date_of_death: person?.date_of_death || '',
    });
  }, [person]);

  // Helper: is deceased if date_of_death is set
  const isDeceased = !!form.date_of_death;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Handle deceased checkbox
  const handleDeceasedChange = e => {
    const checked = e.target.checked;
    setForm(f => ({
      ...f,
      date_of_death: checked ? (f.date_of_death || new Date().toISOString().slice(0, 10)) : ''
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await api.patch(`/people/${person.id}`, {
        person: {
          first_name: form.first_name,
          last_name: form.last_name,
          gender: form.gender,
          date_of_birth: form.date_of_birth,
          date_of_death: form.date_of_death,
        },
      });
      if (onPersonUpdated) onPersonUpdated(res.data);
    } catch (err) {
      setError('Unable to update profile. Please check your information.');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-medium text-gray-500 flex items-center gap-2">
            <FaUser className="text-blue-400" /> Name
          </p>
          <p className="text-gray-800">{person?.full_name || `${person?.first_name || ''} ${person?.last_name || ''}`}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500 flex items-center gap-2">
            <FaVenusMars className="text-blue-400" /> Gender
          </p>
          <p className="text-gray-800">{person?.gender || 'N/A'}</p>
        </div>
        <div>
          <p className="font-medium text-gray-500 flex items-center gap-2">
            <FaBirthdayCake className="text-blue-400" /> Date of Birth
          </p>
          <p className="text-gray-800">
            {person?.date_of_birth
              ? new Date(person.date_of_birth).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-500 flex items-center gap-2">
            <FaSkullCrossbones className="text-blue-400" /> Date of Death
          </p>
          <p className="text-gray-800">
            {person?.date_of_death
              ? new Date(person.date_of_death).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
      <div>
        <label className="font-medium text-gray-500 flex items-center gap-2">
          <FaUser className="text-blue-400" /> First Name
        </label>
        <input name="first_name" value={form.first_name} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" required />
      </div>
      <div>
        <label className="font-medium text-gray-500 flex items-center gap-2">
          <FaUser className="text-blue-400" /> Last Name
        </label>
        <input name="last_name" value={form.last_name} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" required />
      </div>
      <div>
        <label className="font-medium text-gray-500 flex items-center gap-2">
          <FaVenusMars className="text-blue-400" /> Gender
        </label>
        <select name="gender" value={form.gender} onChange={handleChange} className="w-full p-2 border rounded-md mt-1">
          <option value="">Select</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="font-medium text-gray-500 flex items-center gap-2">
          <FaBirthdayCake className="text-blue-400" /> Date of Birth
        </label>
        <input name="date_of_birth" type="date" value={form.date_of_birth ? form.date_of_birth.slice(0,10) : ''} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          id="deceased-checkbox"
          type="checkbox"
          checked={isDeceased}
          onChange={handleDeceasedChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="deceased-checkbox" className="font-medium text-gray-500 flex items-center gap-2 cursor-pointer">
          <FaSkullCrossbones className="text-blue-400" /> Deceased
        </label>
      </div>
      <div>
        <label className="font-medium text-gray-500 flex items-center gap-2">
          <FaSkullCrossbones className="text-blue-400" /> Date of Death
        </label>
        <input name="date_of_death" type="date" value={form.date_of_death ? form.date_of_death.slice(0,10) : ''} onChange={handleChange} className="w-full p-2 border rounded-md mt-1" />
      </div>
      {error && <div className="text-red-500 md:col-span-2">{error}</div>}
      <div className="md:col-span-2 flex gap-2 justify-end mt-2">
        <Button type="button" onClick={() => onPersonUpdated(person)} variant="grey" disabled={saving}>
          <FaTimes /> Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          <FaSave /> Save
        </Button>
      </div>
    </form>
  );
}
