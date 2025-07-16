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
    }
  ],
  edges: [
    {
      from: 1,
      to: 2,
      type: "spouse"
    },
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
      from: 3,
      to: 4,
      type: "spouse"
    },
    {
      from: 3,
      to: 5,
      type: "parent"
    },
    {
      from: 4,
      to: 5,
      type: "parent"
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
    }
  ]
};