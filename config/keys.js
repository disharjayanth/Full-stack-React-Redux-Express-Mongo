//keys.js - Decide here which set of credentials to put here
if( process.env.NODE_ENV === 'production' ) {
    //in production - return the production set of keys
    module.exports = require('./prod')
} else {
    //in development - return the development set of keys
    module.exports = require('./dev')
}