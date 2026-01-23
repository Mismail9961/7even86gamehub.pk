// Wrapper for nodemailer that suppresses deprecation warnings
// Suppress url.parse() deprecation warnings before importing nodemailer
if (typeof process !== 'undefined' && process.emitWarning) {
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = function(warning, type, code, ...args) {
    if (code === 'DEP0169' || (typeof warning === 'string' && warning.includes('url.parse()'))) {
      return; // Suppress the warning
    }
    return originalEmitWarning.call(this, warning, type, code, ...args);
  };
}

// Import nodemailer after suppressing warnings
import nodemailer from 'nodemailer';

export default nodemailer;
