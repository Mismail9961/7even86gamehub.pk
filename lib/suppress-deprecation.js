// Suppress url.parse() deprecation warnings
// This warning comes from dependencies (like nodemailer) and doesn't affect functionality
if (typeof process !== 'undefined' && process.emitWarning) {
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = function(warning, type, code, ...args) {
    if (code === 'DEP0169' || (typeof warning === 'string' && warning.includes('url.parse()'))) {
      return; // Suppress the warning
    }
    return originalEmitWarning.call(this, warning, type, code, ...args);
  };
}
