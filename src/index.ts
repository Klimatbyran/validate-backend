import startApp from "./app"
import apiConfig from "./config/api"
import startQueues from "./lib/bullmq";

const port = apiConfig.port;



async function main() {
    const app = await startApp();
    console.log(await startQueues());
    try {
        await app.listen(
          {
            host: '0.0.0.0',
            port: apiConfig.port,
          },
          async () => {
            const logMessages = [
              `API running at http://localhost:${port}/api/companies`,
              `OpenAPI docs served at http://localhost:${port}/api`,
            ]

            logMessages.forEach((msg) => app.log.info(msg))
          }
        )
    } catch (e) {
        app.log.error(e)
        process.exit(1)
    }
}

main();