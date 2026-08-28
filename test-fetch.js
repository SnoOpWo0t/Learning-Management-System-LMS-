const http = require('http');

const options = {
  hostname: 'localhost',
  port: 1337,
  path: '/api/users?filters[email][$eq]=admin@demo.com&populate=role',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwic2Vzc2lvbklkIjoiMjFlMmUyNTkwNGZmNjk3YmVkNjVjMjdhOTgxNmYyNjEiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzg3ODk1MTc5LCJleHAiOjE3ODc4OTU3Nzl9.DcQKLRmt8A9H0sqa-1e1eGc3wLO2G62e3I8rswtAQak'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
