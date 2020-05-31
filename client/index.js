const functions = require("firebase-functions");
const { expressServer } = require("./__sapper__/build/server/server");

expressServer.get('/*', (request, response) => {
    try {
        response.set(
            'Cache-Control',
            `no-cache`
        );
        response.send(expressServer)
    } catch (error) {
        console.error('Error in Sapper SSR function: ', error)
    }
})

exports.ssr = functions.runWith({ memory: '2GB', timeoutSeconds: 540 }).https.onRequest(expressServer);
