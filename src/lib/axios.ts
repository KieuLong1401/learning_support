import axios from 'axios';

const sever = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default sever;