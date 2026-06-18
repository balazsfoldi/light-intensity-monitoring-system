import "dotenv/config"
import { connectRabbitMQ } from "../shared/connectRabbitMQ.ts"

/**
 * RabbitMQ connection URL.
 * In Docker Compose this points to the RabbitMQ service name.
 * Locally it falls back to localhost.
 */
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost"

/**
 * Queue that receives raw light intensity measurements.
 */
const LIGHT_INTENSITY_QUEUE =
    process.env.LIGHT_INTENSITY_QUEUE || "lightIntensityQueue"

/**
 * Queue that receives generated alert messages.
 */
const LIGHT_ALERT_QUEUE =
    process.env.LIGHT_ALERT_QUEUE || "lightAlertQueue"

/**
 * Lux value below which a reading is considered low light.
 */
const LOW_LIGHT_THRESHOLD =
    Number(process.env.LOW_LIGHT_THRESHOLD) || 100

/**
 * Number of consecutive low light readings required to trigger an alert.
 */
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
        const connection = await connectRabbitMQ(RABBITMQ_URL)
        const channel = await connection.createChannel()

        /**
         * Declares the input queue.
         * durable: true means the queue survives RabbitMQ restart.
         */
        await channel.assertQueue(LIGHT_INTENSITY_QUEUE, {
            durable: true
        })

        /**
         * Declares the output alert queue.
         */
        await channel.assertQueue(LIGHT_ALERT_QUEUE, {
            durable: true
        })

        console.log("Processor service started")

        /**
         * Stores how many low light readings arrived consecutively.
         */
        let consecutiveLowReadings = 0

        /**
         * Consumes measurements from the light intensity queue.
         */
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

                    /**
                     * Sends the generated alert to the alert queue.
                     */
                    channel.sendToQueue(
                        LIGHT_ALERT_QUEUE,
                        Buffer.from(JSON.stringify(alert)),
                        {
                            persistent: true
                        }
                    )

                    console.log("Alert message sent")

                    /**
                     * Resets the counter after sending an alert.
                     */
                    consecutiveLowReadings = 0
                }
            } else {
                /**
                 * If the current reading is not low,
                 * the consecutive sequence is interrupted.
                 */
                consecutiveLowReadings = 0
            }

            /**
             * Acknowledges successful message processing.
             * RabbitMQ can safely remove the message from the queue.
             */
            channel.ack(message)
        })

    } catch (error) {
        console.error("Processor error:", error)
        process.exit(1)
    }
}

startProcessor()