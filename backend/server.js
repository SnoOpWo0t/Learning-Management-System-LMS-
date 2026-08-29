// Custom entry point - forces IPv4 DNS and logs full AggregateError details
'use strict';

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

console.log('[BOOT] DNS set to ipv4first');
console.log('[BOOT] DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('[BOOT] DATABASE_CLIENT:', process.env.DATABASE_CLIENT);
console.log('[BOOT] DATABASE_SSL:', process.env.DATABASE_SSL);

if (process.env.DATABASE_URL) {
  try {
    const u = new URL(process.env.DATABASE_URL);
    console.log('[BOOT] DB Host:', u.hostname);
    console.log('[BOOT] DB Port:', u.port);
    console.log('[BOOT] DB Name:', u.pathname);
  } catch (e) {
    console.log('[BOOT] Could not parse DATABASE_URL:', e.message);
  }
}

// Intercept unhandled rejections to log full AggregateError details
process.on('unhandledRejection', (reason) => {
  if (reason && reason.errors) {
    console.error('[CRASH] AggregateError with', reason.errors.length, 'sub-errors:');
    reason.errors.forEach((err, i) => {
      console.error(`  [${i}] message="${err.message}" code=${err.code} syscall=${err.syscall} address=${err.address} port=${err.port}`);
    });
  } else {
    console.error('[CRASH] Unhandled rejection:', reason);
  }
});

// Ensure 'start' command is in argv for Strapi CLI
if (!process.argv.includes('start')) {
  process.argv.push('start');
}

// Boot Strapi
require('./node_modules/@strapi/strapi/bin/strapi.js');
