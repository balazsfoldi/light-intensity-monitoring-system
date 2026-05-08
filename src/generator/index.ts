import "dotenv/config"
import amqp from "amqplib"

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost"
const LIGHT_INTENSITY_QUEUE = process.env.LIGHT_INTENSITY_QUEUE || "lightIntensityQueue"
const GENERATION_INTERVAL_MS = Number(process.env.GENERATION_INTERVAL_MS) || 500
const MIN_LUX = Number(process.env.MIN_LUX) || 0
const MAX_LUX = Number(process.env.MAX_LUX) || 2000

interface LightIntensityMessage {
    lux: number
    timestamp: string
}

async function startGenerator(): Promise<void> {
    try {
        console.log("Connecting to RabbitMQ...")

        const connection = await amqp.connect(RABBITMQ_URL)
        const channel = await connection.createChannel()

        await channel.assertQueue(LIGHT_INTENSITY_QUEUE, {
            durable: true
        })

        console.log("Generator service started")
        console.log(`Sending messages to queue: ${LIGHT_INTENSITY_QUEUE}`)

        setInterval(() => {
            const message: LightIntensityMessage = {
                lux: Math.floor(
                    Math.random() * (MAX_LUX - MIN_LUX + 1)
                ) + MIN_LUX,
                timestamp: new Date().toISOString()
            }

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