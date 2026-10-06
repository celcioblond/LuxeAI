//Seed user data

const users = [
  {
    name: 'Alison Smith',
    email: 'alisson@gmail.com',
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

export default users;
