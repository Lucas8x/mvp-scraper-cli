import axios from 'axios';
import packageJson from '../package.json';

export const axiosInstance = axios.create({
  headers: {
    'User-Agent': `${packageJson.name}/${packageJson.version}`,
  },
});
