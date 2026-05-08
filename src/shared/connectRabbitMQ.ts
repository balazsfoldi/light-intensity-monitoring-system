import amqp from "amqplib"

export async function connectRabbitMQ(
    url: string
): Promise<amqp.ChannelModel> {

    while (true) {
        try {
            console.log("Connecting to RabbitMQ...")

            const connection = await amqp.connect(url)

            console.log("Connected to RabbitMQ")

            return connection

        } catch (error) {
            console.log(
                "RabbitMQ not ready yet. Retrying in 5 seconds..."
            )

            await new Promise((resolve) =>
                setTimeout(resolve, 5000)
            )
        }
    }
}