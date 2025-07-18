// Mock data for testing the family tree UI
export const mockFamilyData = {
  nodes: [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      date_of_birth: "1950-01-15",
      date_of_death: null,
      gender: "male",
      avatar_url: null,
      company: "ABC Corp",
      zodiac: "Capricorn",
      is_alive: true
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Doe",
      date_of_birth: "1952-05-20",
      date_of_death: null,
      gender: "female",
      avatar_url: null,
      company: "XYZ Ltd",
      zodiac: "Taurus",
      is_alive: true
    },
    {
      id: 3,
      first_name: "Bob",
      last_name: "Doe",
      date_of_birth: "1975-03-10",
      date_of_death: null,
      gender: "male",
      avatar_url: null,
      company: "Tech Solutions",
      zodiac: "Pisces",
      is_alive: true
    },
    {
      id: 4,
      first_name: "Alice",
      last_name: "Smith",
      date_of_birth: "1978-11-30",
      date_of_death: null,
      gender: "female",
      avatar_url: null,
      company: "Design Co",
      zodiac: "Sagittarius",
      is_alive: true
    },
    {
      id: 5,
      first_name: "Charlie",
      last_name: "Doe",
      date_of_birth: "2000-07-15",
      date_of_death: null,
      gender: "male",
      avatar_url: null,
      company: null,
      zodiac: "Cancer",
      is_alive: true
    },
    {
      id: 6,
      first_name: "Emma",
      last_name: "Doe",
      date_of_birth: "2002-12-05",
      date_of_death: null,
      gender: "female",
      avatar_url: null,
      company: null,
      zodiac: "Sagittarius",
      is_alive: true
    },
    {
      id: 7,
      first_name: "David",
      last_name: "Johnson",
      date_of_birth: "1973-08-12",
      date_of_death: null,
      gender: "male",
      avatar_url: null,
      company: "Finance Corp",
      zodiac: "Leo",
      is_alive: true
    }
  ],
  edges: [
    {
      from: 1,
      to: 2,
      type: "spouse"
    },
    {
      from: 7,
      to: 4,
      type: "spouse",
      is_ex: true
    },
    // John and Jane are parents of Bob, Alice, and Charlie (making Alice and Charlie siblings)
    {
      from: 1,
      to: 3,
      type: "parent"
    },
    {
      from: 2,
      to: 3,
      type: "parent"
    },
    {
      from: 1,
      to: 4,
      type: "parent"
    },
    {
      from: 2,
      to: 4,
      type: "parent"
    },
    {
      from: 1,
      to: 5,
      type: "parent"
    },
    {
      from: 2,
      to: 5,
      type: "parent"
    },
    // Bob and Alice are spouses and parents of Emma
    {
      from: 3,
      to: 4,
      type: "spouse"
    },
    {
      from: 3,
      to: 6,
      type: "parent"
    },
    {
      from: 4,
      to: 6,
      type: "parent"
    },
    // Add explicit sibling relationships
    {
      from: 3,
      to: 4,
      type: "sibling"
    },
    {
      from: 4,
      to: 3,
      type: "sibling"
    },
    {
      from: 3,
      to: 5,
      type: "sibling"
    },
    {
      from: 5,
      to: 3,
      type: "sibling"
    },
    {
      from: 4,
      to: 5,
      type: "sibling"
    },
    {
      from: 5,
      to: 4,
      type: "sibling"
    }
  ]
};