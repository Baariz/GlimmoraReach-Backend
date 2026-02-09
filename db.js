const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data', 'db');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function getPath(collection) {
  return path.join(DB_DIR, `${collection}.json`);
}

function read(collection) {
  const filePath = getPath(collection);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }
}

function write(collection, data) {
  fs.writeFileSync(getPath(collection), JSON.stringify(data, null, 2), 'utf-8');
}

function seed(collection, data) {
  const filePath = getPath(collection);
  if (!fs.existsSync(filePath)) {
    write(collection, data);
    return true;
  }
  return false;
}

// Helper: get user-scoped data
function readForUser(collection, userEmail) {
  const all = read(collection);
  if (!userEmail) return all;
  const isDemoUser = userEmail.endsWith('@glimmora.com');
  return all.filter(item => {
    if (isDemoUser && item.userEmail && item.userEmail.endsWith('@glimmora.com')) return true;
    return item.userEmail === userEmail;
  });
}

// Helper: get next ID for a collection
function nextId(collection, prefix) {
  const all = read(collection);
  const maxNum = all.reduce((max, item) => {
    const match = item.id && item.id.match(new RegExp(`${prefix}-(\\d+)`));
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
}

module.exports = { read, write, seed, readForUser, nextId };
