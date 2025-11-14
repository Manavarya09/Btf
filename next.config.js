const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  // Ensure Next uses this project as the workspace root (fixes config resolution)
  outputFileTracingRoot: path.join(__dirname),
};
