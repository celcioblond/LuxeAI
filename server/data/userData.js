//Seed user data

const users = [
  {
    name: 'Alison Smith',
    email: 'alisson@gmail.com',
    affinity: 'Skincare',
    password: 'Password123@',
    role: 'user',
    address: {
      street: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zip: '10000',
      country: 'USA',
    },
  },
  {
    name: 'Barry Johnson',
    email: 'barry@outlook.com',
    affinity: null,
    password: 'Cotrasenia123!',
    role: 'admin',
    address: {
      street: '456 Second Ct',
      city: 'Austin',
      state: 'TX',
      zip: '10001',
      country: 'USA',
    },
  },
  {
    name: 'Carlos Ramirez',
    email: 'carlos@hotmail.com',
    affinity: 'Tech',
    password: 'Fakepassy789!',
    role: 'user',
    address: {
      street: 'Av. Los Secuaces 782',
      city: 'Ciudad Chihuaha',
      state: 'Chihuahua',
      zip: '10002',
      country: 'MX',
    },
  },
];

//Generated shoppers. They all share one password (see README) and each has an
//affinity: the category most of their orders come from. null = no orders yet.
const GENERATED_PASSWORD = 'Shopper123!';

const generated = [
  ['Emma', 'Wilson', 'Fitness', 'Denver', 'CO'],
  ['Liam', 'Brown', 'Fitness', 'Boston', 'MA'],
  ['Olivia', 'Garcia', 'Skincare', 'Miami', 'FL'],
  ['Noah', 'Martinez', 'Tech', 'San Jose', 'CA'],
  ['Ava', 'Davis', 'Clothing', 'Chicago', 'IL'],
  ['Ethan', 'Lopez', 'Shoes', 'Portland', 'OR'],
  ['Sophia', 'Taylor', 'Bags', 'Seattle', 'WA'],
  ['Mason', 'Anderson', 'Kitchen', 'Nashville', 'TN'],
  ['Isabella', 'Thomas', 'Accessories', 'New York', 'NY'],
  ['Lucas', 'Moore', 'Tech', 'Austin', 'TX'],
  ['Mia', 'Jackson', 'Skincare', 'San Diego', 'CA'],
  ['James', 'White', 'Kitchen', 'Atlanta', 'GA'],
  ['Charlotte', 'Harris', 'Clothing', 'Phoenix', 'AZ'],
  ['Benjamin', 'Clark', 'Fitness', 'Minneapolis', 'MN'],
  ['Amelia', 'Lewis', 'Accessories', 'Philadelphia', 'PA'],
  ['Henry', 'Walker', 'Shoes', 'Salt Lake City', 'UT'],
  ['Harper', 'Hall', 'Bags', 'Charlotte', 'NC'],
  ['Daniel', 'Young', 'Tech', 'Raleigh', 'NC'],
  ['Evelyn', 'King', 'Kitchen', 'Columbus', 'OH'],
  ['Jack', 'Wright', 'Clothing', 'Detroit', 'MI'],
  ['Grace', 'Scott', null, 'Tampa', 'FL'],
  ['Leo', 'Green', null, 'Las Vegas', 'NV'],
].map(([first, last, affinity, city, state], i) => ({
  name: `${first} ${last}`,
  email: `${first}.${last}@example.com`.toLowerCase(),
  affinity,
  password: GENERATED_PASSWORD,
  role: 'user',
  address: {
    street: `${100 + i * 7} Market St`,
    city,
    state,
    zip: String(20000 + i * 37),
    country: 'USA',
  },
}));

export default [...users, ...generated];
