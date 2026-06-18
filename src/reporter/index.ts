import "dotenv/config"
import { connectRabbitMQ } from "../shared/connectRabbitMQ.ts"

/**
 * RabbitMQ connection URL.
 */
const RABBITMQ_URL =
    process.env.RABBITMQ_URL || "amqp://localhost"

/**
 * Queue containing alert messages.
 */
const LIGHT_ALERT_QUEUE =
    process.env.LIGHT_ALERT_QUEUE || "lightAlertQueue"

interface AlertMessage {
    message: string
    timestamp: string
}

async function startReporter(): Promise<void> {
    try {

        /**
         * Establish connection to RabbitMQ.
         */
        const connection =
            await connectRabbitMQ(RABBITMQ_URL)

        /**
         * Create a communication channel.
         */
        const channel =
            await connection.createChannel()

        /**
         * Create the queue if it does not exist.
         */
        await channel.assertQueue(
            LIGHT_ALERT_QUEUE,
            {
                durable: true
            }
        )

        console.log("Reporter service started")

        /**
         * Listen for alert messages.
         */
        channel.consume(
            LIGHT_ALERT_QUEUE,
            (message) => {

                if (!message) {
                    return
                }

                /**
                 * Convert the received buffer to JSON.
                 */
                const content = JSON.parse(
                    message.content.toString()
                ) as AlertMessage

                console.log("ALERT RECEIVED")
                console.log(content.message)
                console.log(
                    `Timestamp: ${content.timestamp}`
                )
                console.log(
                    "--------------------------------"
                )

                /**
                 * Acknowledge successful processing.
                 */
                channel.ack(message)
            }
        )

    } catch (error) {
        console.error("Reporter error:", error)
        process.exit(1)
    }
}

startReporter()