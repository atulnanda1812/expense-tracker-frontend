import axios from 'axios';
import Cookies from 'js-cookie';

// Retrieve CSRF token from cookies
const csrfToken = Cookies.get('csrftoken');

const client = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Replace with your backend API base URL
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
    },
});

export default client;
