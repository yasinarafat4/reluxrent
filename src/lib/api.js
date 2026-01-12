import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Interceptor to add Cookie header for server-side requests
api.interceptors.request.use(
  (config) => {
    // Check if there's a request context (e.g., from getServerSideProps)
    if (config.context && config.context.req && config.context.req.headers.cookie) {
      config.headers = {
        ...config.headers,
        Cookie: config.context.req.headers.cookie,
      };
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
