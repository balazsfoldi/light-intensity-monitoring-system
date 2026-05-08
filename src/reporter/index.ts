import "dotenv/config"
import amqp from "amqplib"

const RABBITMQ_URL =
    process.env.RABBITMQ_URL || "amqp://localhost"

const LIGHT_ALERT_QUEUE =
    process.env.LIGHT_ALERT_QUEUE || "lightAlertQueue"

interface AlertMessage {
    message: string
    timestamp: string
}

async function startReporter(): Promise<void> {
    try {
        console.log("Connecting to RabbitMQ...")

        const connection = await amqp.connect(RABBITMQ_URL)

        const channel = await connection.createChannel()

        await channel.assertQueue(LIGHT_ALERT_QUEUE, {
            durable: true
        })

        console.log("Reporter service started")

        channel.consume(LIGHT_ALERT_QUEUE, (message) => {
            if (!message) {
                return
            }

            const content = JSON.parse(
                message.content.toString()
            ) as AlertMessage

            console.log("ALERT RECEIVED")
            console.log(content.message)
            console.log(`Timestamp: ${content.timestamp}`)
            console.log("--------------------------------")

            channel.ack(message)
        })

    } catch (error) {
        console.error("Reporter error:", error)
        process.exit(1)
    }
}

startReporter()