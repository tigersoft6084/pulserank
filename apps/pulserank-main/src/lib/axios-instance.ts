import axios from "axios";

const AxiosInstance = axios.create();

AxiosInstance.interceptors.response.use(
  (response) => {
    // Can be modified response
    return response;
  },
  (error) => {
    // Handle response errors here
    if (error.response.status === 404) {
      return Promise.reject("Server is not running");
    }
    return Promise.reject(error.response.data);
  },
);

export { AxiosInstance };
