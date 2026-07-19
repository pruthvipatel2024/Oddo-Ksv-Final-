const axios = require('axios');
(async () => {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'shivam@gmail.com',
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;

    console.log('Attempting booking...');
    const bookRes = await axios.post('http://localhost:5000/api/v1/bookings', {
      rideId: 'e5e65f12-3758-49a3-ac41-0a942e896cf0',
      seatsBooked: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Success:', bookRes.data);
  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
  }
})();
