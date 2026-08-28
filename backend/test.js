const fetch = require('node-fetch');

async function test() {
  const login = await fetch('http://localhost:1337/api/auth/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'content@demo.com', password: 'Password123!' })
  });
  const loginData = await login.json();
  const token = loginData.jwt;
  console.log('Got token for Content Manager');
  
  const create = await fetch('http://localhost:1337/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      data: {
        title: 'Test Course',
        description: 'Test description',
        difficulty: 'Beginner',
        instructor: loginData.user.id
      }
    })
  });
  
  console.log(create.status);
  console.log(await create.json());
}

test();
