import axios from 'axios';

export const BASE_IMG_URL = 'https://staging.remotemedtech.com/';

const BASE_URL = `https://staging.remotemedtech.com/api`;
const axiosInstance = axios.create({baseURL: BASE_URL});

export default axiosInstance;
