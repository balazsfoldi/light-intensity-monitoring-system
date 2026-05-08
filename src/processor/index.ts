import "dotenv/config"
import amqp from "amqplib"

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost"

const LIGHT_INTENSITY_QUEUE =
    process.env.LIGHT_INTENSITY_QUEUE || "lightIntensityQueue"

const LIGHT_ALERT_QUEUE =
    process.env.LIGHT_ALERT_QUEUE || "lightAlertQueue"

const LOW_LIGHT_THRESHOLD =
    Number(process.env.LOW_LIGHT_THRESHOLD) || 100

const REQUIRED_CONSECUTIVE_LOW_READINGS =
    Number(process.env.REQUIRED_CONSECUTIVE_LOW_READINGS) || 3

interface LightIntensityMessage {
    lux: number
    timestamp: string
}

interface AlertMessage {
    message: string
    timestamp: string
}

async function startProcessor(): Promise<void> {
    try {
        console.log("Connecting to RabbitMQ...")

        const connection = await amqp.connect(RABBITMQ_URL)

        const channel = await connection.createChannel()

        await channel.assertQueue(LIGHT_INTENSITY_QUEUE, {
            durable: true
        })

        await channel.assertQueue(LIGHT_ALERT_QUEUE, {
            durable: true
        })

        console.log("Processor service started")

        let consecutiveLowReadings = 0

        channel.consume(LIGHT_INTENSITY_QUEUE, (message) => {
            if (!message) {
                return
            }

            const content = JSON.parse(
                message.content.toString()
            ) as LightIntensityMessage

            console.log(
                `Received light intensity: ${content.lux} lux`
            )

            if (content.lux < LOW_LIGHT_THRESHOLD) {
                consecutiveLowReadings++

                console.log(
                    `Low light detected (${consecutiveLowReadings}/${REQUIRED_CONSECUTIVE_LOW_READINGS})`
                )

                if (
                    consecutiveLowReadings >=
                    REQUIRED_CONSECUTIVE_LOW_READINGS
                ) {
                    const alert: AlertMessage = {
                        message:
                            `Low light alert: ` +
                            `${REQUIRED_CONSECUTIVE_LOW_READINGS} consecutive readings below ` +
                            `${LOW_LIGHT_THRESHOLD} lux.`,
                        timestamp: new Date().toISOString()
                    }

                    channel.sendToQueue(
                        LIGHT_ALERT_QUEUE,
                        Buffer.from(JSON.stringify(alert)),
                        {
                            persistent: true
                        }
                    )

                    console.log("Alert message sent")

                    consecutiveLowReadings = 0
                }
            } else {
                consecutiveLowReadings = 0
            }

            channel.ack(message)
        })

    } catch (error) {
        console.error("Processor error:", error)
        process.exit(1)
    }
}

startProcessor()