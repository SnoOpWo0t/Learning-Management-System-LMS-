// Custom entry point - forces IPv4 DNS and logs full error details
'use strict';

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

console.log('[BOOT] DNS set to ipv4first');
console.log('[BOOT] DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('[BOOT] DATABASE_CLIENT:', process.env.DATABASE_CLIENT);
console.log('[BOOT] DATABASE_SSL:', process.env.DATABASE_SSL);
console.log('[BOOT] JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('[BOOT] ENCRYPTION_KEY exists:', !!process.env.ENCRYPTION_KEY);

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

// Intercept ALL uncaught errors and rejections
process.on('unhandledRejection', (reason) => {
  console.error('[CRASH] Unhandled rejection:', reason);
  if (reason && reason.stack) console.error(reason.stack);
  if (reason && reason.errors) {
    reason.errors.forEach((err, i) => {
      console.error(`  [${i}] message="${err.message}" code=${err.code} address=${err.address} port=${err.port}`);
    });
  }
});

process.on('uncaughtException', (err) => {
  console.error('[CRASH] Uncaught exception:', err.message);
  console.error(err.stack);
});

// Monkey-patch console.error to capture Strapi's internal error logging
const origError = console.error;
console.error = function(...args) {
  // If Strapi logs an error object, make sure we see the full stack
  args.forEach(arg => {
    if (arg instanceof Error && arg.stack && !String(args[0]).includes('[CRASH]')) {
      origError.call(console, '[ERROR-DETAIL]', arg.message);
      origError.call(console, '[ERROR-STACK]', arg.stack);
    }
  });
  origError.apply(console, args);
};

// Ensure 'start' command is in argv for Strapi CLI
if (!process.argv.includes('start')) {
  process.argv.push('start');
}

// Boot Strapi
require('./node_modules/@strapi/strapi/bin/strapi.js');
