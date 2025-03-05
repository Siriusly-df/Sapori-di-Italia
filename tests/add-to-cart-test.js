const http = require('http');

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/cart/add-to-cart',  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',  
        'Content-Length': Buffer.byteLength(data),  
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(responseData); 
        } else {
          reject(`Error: ${res.statusCode}`); 
        }
      });
    });

    req.on('error', (e) => {
      reject(`Request failed: ${e.message}`);
    });
    req.write(data);
    req.end();
  });
}


async function sendRequest() {
  const data = JSON.stringify({
    id: Math.floor(Math.random() * 200),  
  });

  try {
    const response = await makeRequest(data);  
    console.log('Response:', response);  
  } catch (error) {
    console.error('Error:', error);  
  }
}

async function loadTest(totalRequests, delayBetweenRequests) {
  let successes = 0;
  let failures = 0;

  console.log(`Starting load test with ${totalRequests} requests...`);

  for (let i = 0; i < totalRequests; i++) {
    try {
      await sendRequest();  
      successes++;  
    } catch (error) {
      console.error(error);  
      failures++;  
    }

    await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
  }

  console.log(`Test completed: ${successes} successful requests, ${failures} failed requests.`);
}


const totalRequests = 20000;  
const delayBetweenRequests = 200;  

loadTest(totalRequests, delayBetweenRequests);