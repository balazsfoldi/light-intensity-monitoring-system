import "dotenv/config"
import { connectRabbitMQ } from "../shared/connectRabbitMQ.ts"

/**
 * RabbitMQ connection URL.
 */
const RABBITMQ_URL =
    process.env.RABBITMQ_URL || "amqp://localhost"

/**
 * Queue that stores light intensity measurements.
 */
const LIGHT_INTENSITY_QUEUE =
    process.env.LIGHT_INTENSITY_QUEUE || "lightIntensityQueue"

/**
 * Generation interval in milliseconds.
 */
const GENERATION_INTERVAL_MS =
    Number(process.env.GENERATION_INTERVAL_MS) || 500

/**
 * Minimum and maximum generated lux values.
 */
const MIN_LUX = Number(process.env.MIN_LUX) || 0
const MAX_LUX = Number(process.env.MAX_LUX) || 2000

interface LightIntensityMessage {
    lux: number
    timestamp: string
}

async function startGenerator(): Promise<void> {
    try {
        const connection =
            await connectRabbitMQ(RABBITMQ_URL)

        const channel = await connection.createChannel()

        /**
         * Creates the queue if it does not already exist.
         */
        await channel.assertQueue(
            LIGHT_INTENSITY_QUEUE,
            {
                durable: true
            }
        )

        console.log("Generator service started")
        console.log(
            `Sending messages to queue: ${LIGHT_INTENSITY_QUEUE}`
        )

        /**
         * Periodically generates random measurements.
         */
        setInterval(() => {

            const message: LightIntensityMessage = {

                /**
                 * Generate a random lux value between MIN_LUX and MAX_LUX.
                 */
                lux:
                    Math.floor(
                        Math.random() *
                        (MAX_LUX - MIN_LUX + 1)
                    ) + MIN_LUX,

                timestamp:
                    new Date().toISOString()
            }

            /**
             * Send the measurement to RabbitMQ.
             */
            channel.sendToQueue(
                LIGHT_INTENSITY_QUEUE,
                Buffer.from(JSON.stringify(message)),
                {
                    persistent: true
                }
            )

            console.log(
                `Generated light intensity: ${message.lux} lux`
            )

        }, GENERATION_INTERVAL_MS)

    } catch (error) {
        console.error("Generator error:", error)
        process.exit(1)
    }
}

startGenerator()