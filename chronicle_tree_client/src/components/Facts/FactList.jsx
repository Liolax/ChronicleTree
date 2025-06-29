import React, { useState, useEffect } from 'react';
import api from '../../api/api';

export default function FactList({ personId }) {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!personId) return;

    api.get(`/people/${personId}/facts`)
      .then(response => {
        setFacts(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load facts.');
        setLoading(false);
        console.error(err);
      });
  }, [personId]);

  if (loading) return <p>Loading facts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Key Facts & Events</h3>
      {facts.length === 0 ? (
        <p>No facts recorded yet.</p>
      ) : (
        <ul className="space-y-4">
          {facts.map(fact => (
            <li key={fact.id} className="p-4 bg-white rounded-lg shadow">
              <p className="font-bold">{fact.fact_type}</p>
              <p className="text-sm text-gray-600">{fact.date}</p>
              <p className="text-sm text-gray-600">{fact.place}</p>
              <p className="mt-2">{fact.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
