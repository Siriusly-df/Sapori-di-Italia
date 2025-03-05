const http = require('http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};


function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  switch(type) {
    case 'success':
      console.log(`${colors.green}✓ ${timestamp} - ${message}${colors.reset}`);
      break;
    case 'error':
      console.log(`${colors.red}✗ ${timestamp} - ${message}${colors.reset}`);
      break;
    case 'info':
      console.log(`${colors.bright}${timestamp} - ${message}${colors.reset}`);
      break;
  }
}

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    const formData = Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    req.write(formData);
    req.end();
  });
}

// Спрощена функція очищення - тільки таблиця users
async function cleanupDatabase() {
  try {
    // Видаляємо тільки записи з таблиці users
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;
    log('Users table cleaned', 'success');
  } catch (error) {
    log(`Failed to clean users table: ${error.message}`, 'error');
    console.error('Full error:', error);
  }
}

async function runTests() {
  let totalTests = 0;
  let passedTests = 0;

  log('Starting registration tests...\n');

  try {
    // Очищаємо таблицю users перед тестами
    await cleanupDatabase();

    // Тест 1: Успішна реєстрація
    totalTests++;
    const userData = {
      firstName: 'Test User',
      email: 'test@example.com',
      phone: '+380501234567',
      password: 'password123',
      address: 'Test Address'
    };

    log('Test 1: Testing successful registration');
    const response = await makeRequest(userData);
    
    if (response.statusCode === 302 && response.headers.location === '/cat') {
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (user && user.email === userData.email) {
        log('Test 1 passed: User successfully registered', 'success');
        passedTests++;
      } else {
        log('Test 1 failed: User not found in database', 'error');
      }
    } else {
      log(`Test 1 failed: Unexpected response - Status: ${response.statusCode}, Location: ${response.headers.location}`, 'error');
    }

    // Тест 2: Спроба реєстрації з існуючим email
    totalTests++;
    log('\nTest 2: Testing registration with existing email');
    const duplicateResponse = await makeRequest(userData);
    
    if (duplicateResponse.statusCode === 302 && duplicateResponse.headers.location === '/auth/register') {
      log('Test 2 passed: Duplicate registration properly handled', 'success');
      passedTests++;
    } else {
      log(`Test 2 failed: Unexpected response - Status: ${duplicateResponse.statusCode}, Location: ${duplicateResponse.headers.location}`, 'error');
    }

    // Тест 3: Неправильні дані
    totalTests++;
    log('\nTest 3: Testing invalid data handling');
    const invalidData = {
      firstName: 'Test'
    };

    const errorResponse = await makeRequest(invalidData);
    if (errorResponse.statusCode === 500) {
      log('Test 3 passed: Invalid data properly handled', 'success');
      passedTests++;
    } else {
      log(`Test 3 failed: Unexpected response - Status: ${errorResponse.statusCode}`, 'error');
    }

  } catch (error) {
    log(`Test execution failed: ${error.message}`, 'error');
    console.error('Full error:', error);
  } finally {
    try {
      // Очищаємо таблицю users після тестів
      await cleanupDatabase();
      await prisma.$disconnect();
    } catch (error) {
      log(`Cleanup failed: ${error.message}`, 'error');
    }

    // Виводимо загальний результат
    console.log('\n' + '='.repeat(50));
    log(`Tests completed: ${passedTests}/${totalTests} passed`, 
        passedTests === totalTests ? 'success' : 'error');
    console.log('='.repeat(50));

    // Завершуємо процес з відповідним кодом
    process.exit(passedTests === totalTests ? 0 : 1);
  }
}

// Запускаємо тести
runTests().catch(console.error);