module.exports = {
  mocha: {
   enableTimeouts: false,
   grep: "@skip-on-coverage", // Find everything with this tag
   invert: true               // Run the grep's inverse set.
 },
  skipFiles: ['test/']
}
