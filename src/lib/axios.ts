import axios from 'axios';

const sever = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default sever;