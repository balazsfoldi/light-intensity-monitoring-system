import amqp from "amqplib"

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost"
const LIGHT_INTENSITY_QUEUE = "lightIntensityQueue"

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
                lux: Math.floor(Math.random() * 2001),
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
        }, 3000)

    } catch (error) {
        console.error("Generator error:", error)
        process.exit(1)
    }
}

startGenerator()