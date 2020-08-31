const functions = require("firebase-functions");
const { expressServer } = require("./__sapper__/build/server/server");

const oneHour = 60 * 60
const oneDay = oneHour * 24
const oneWeek = oneDay * 7
const oneMonth = oneWeek * 4

expressServer.get('/', (request, response) => {
  try {
    response.set(
      'Cache-Control',
      `public, max-age=${oneWeek}, must-revalidate, s-maxage=${oneMonth}, proxy-revalidate, stale-while-revalidate=${oneDay}, stale-if-error=${oneWeek}`
    );
    response.send(expressServer)
  } catch (error) {
    console.error('Error in Sapper SSR function: ', error)
  }
})

exports.ssr = functions.runWith({ memory: '2GB', timeoutSeconds: 540 }).https.onRequest(expressServer);
