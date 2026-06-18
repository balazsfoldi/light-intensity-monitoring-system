# Light Intensity Monitoring System

A Dockerized RabbitMQ-based distributed system for monitoring indoor light intensity values and generating alerts when low light conditions are detected.

## Overview

The system consists of three independent Node.js/TypeScript services communicating through RabbitMQ queues.

The goal of the application is to simulate light intensity measurements, process the generated values, and report an alert when several consecutive low light readings are detected.

## Components

### 1. Light Intensity Generator

The generator service periodically creates random light intensity values.

* Generates random lux values between `MIN_LUX` and `MAX_LUX`
* Adds a timestamp to each measurement
* Sends the generated message to the `lightIntensityQueue`
* The generation interval can be configured with `GENERATION_INTERVAL_MS`

Example message:

```json
{
  "lux": 85,
  "timestamp": "2026-05-08T14:30:00.000Z"
}
```

### 2. Light Intensity Processor

The processor service consumes messages from the `lightIntensityQueue`.

It checks whether the received lux value is below the configured low light threshold.

* Consumes light intensity messages
* Compares the lux value with `LOW_LIGHT_THRESHOLD`
* Counts consecutive low light readings
* Sends an alert to `lightAlertQueue` if the number of consecutive low readings reaches `REQUIRED_CONSECUTIVE_LOW_READINGS`
* Resets the counter when a normal reading is received

Example alert message:

```json
{
  "message": "Low light alert: 3 consecutive readings below 100 lux.",
  "timestamp": "2026-05-08T14:30:05.000Z"
}
```

### 3. Alert Reporting Client

The reporter service consumes alert messages from the `lightAlertQueue`.

* Listens for alert messages
* Parses the received JSON message
* Prints the alert to the console

## Architecture

```text
+---------------------------+
| Light Intensity Generator |
+---------------------------+
              |
              v
     +----------------------+
     | lightIntensityQueue  |
     +----------------------+
              |
              v
+----------------------------+
| Light Intensity Processor  |
+----------------------------+
              |
              v
     +------------------+
     | lightAlertQueue  |
     +------------------+
              |
              v
+--------------------------+
| Alert Reporting Client   |
+--------------------------+
```

## Technologies

* Node.js
* TypeScript
* RabbitMQ
* Docker
* Docker Compose

## Features

* RabbitMQ-based asynchronous communication
* Distributed service architecture
* Dockerized environment
* Configurable light intensity generation
* Configurable low light threshold
* Consecutive low light detection
* Alert generation and reporting
* Automatic RabbitMQ reconnect retry on startup

## Queue Structure

### `lightIntensityQueue`

This queue contains generated light intensity measurements.

Example:

```json
{
  "lux": 320,
  "timestamp": "2026-05-08T14:30:00.000Z"
}
```

### `lightAlertQueue`

This queue contains generated low light alert messages.

Example:

```json
{
  "message": "Low light alert: 3 consecutive readings below 100 lux.",
  "timestamp": "2026-05-08T14:30:05.000Z"
}
```

## Configuration

The application can be configured through environment variables.

### Common

| Variable       | Description             | Default            |
| -------------- | ----------------------- | ------------------ |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://localhost` |

### Generator

| Variable                 | Description                                  | Default               |
| ------------------------ | -------------------------------------------- | --------------------- |
| `LIGHT_INTENSITY_QUEUE`  | Queue for generated light intensity messages | `lightIntensityQueue` |
| `GENERATION_INTERVAL_MS` | Message generation interval in milliseconds  | `500`                 |
| `MIN_LUX`                | Minimum generated lux value                  | `0`                   |
| `MAX_LUX`                | Maximum generated lux value                  | `2000`                |

### Processor

| Variable                            | Description                                              | Default               |
| ----------------------------------- | -------------------------------------------------------- | --------------------- |
| `LIGHT_INTENSITY_QUEUE`             | Queue for incoming light intensity messages              | `lightIntensityQueue` |
| `LIGHT_ALERT_QUEUE`                 | Queue for generated alert messages                       | `lightAlertQueue`     |
| `LOW_LIGHT_THRESHOLD`               | Threshold below which a reading is considered low        | `100`                 |
| `REQUIRED_CONSECUTIVE_LOW_READINGS` | Number of consecutive low readings required for an alert | `3`                   |

### Reporter

| Variable            | Description              | Default           |
| ------------------- | ------------------------ | ----------------- |
| `LIGHT_ALERT_QUEUE` | Queue for alert messages | `lightAlertQueue` |

## Running the Application

### Requirements

* Docker
* Docker Compose

### Start the system

```bash
docker compose up --build
```

This command starts:

* RabbitMQ
* Light Intensity Generator
* Light Intensity Processor
* Alert Reporting Client

## Expected Output

### Generator

```text
Generator service started
Sending messages to queue: lightIntensityQueue
Generated light intensity: 320 lux
Generated light intensity: 78 lux
Generated light intensity: 64 lux
Generated light intensity: 52 lux
```

### Processor

```text
Processor service started
Received light intensity: 78 lux
Low light detected (1/3)
Received light intensity: 64 lux
Low light detected (2/3)
Received light intensity: 52 lux
Low light detected (3/3)
Alert message sent
```

### Reporter

```text
Reporter service started
ALERT RECEIVED
Low light alert: 3 consecutive readings below 100 lux.
Timestamp: 2026-05-08T14:30:05.000Z
--------------------------------
```

## RabbitMQ Management Interface

RabbitMQ Management UI is available at:

```text
http://localhost:15672
```

Default credentials:

```text
Username: guest
Password: guest
```

In the management interface, the queues and message flow can be inspected visually.

## Reliability Notes

The queues are declared with:

```ts
durable: true
```

This means the queues can survive RabbitMQ restarts.

Messages are sent with:

```ts
persistent: true
```

This marks the messages as persistent.

Consumers call:

```ts
channel.ack(message)
```

This confirms that a message was successfully processed.

## Testing the System

The system can be tested by verifying that:

* The generator sends messages to RabbitMQ
* The processor consumes messages from `lightIntensityQueue`
* The processor detects consecutive low light readings correctly
* The processor sends alert messages to `lightAlertQueue`
* The reporter consumes and prints alert messages

For easier testing, the following environment values can be changed:

```yaml
LOW_LIGHT_THRESHOLD: 1500
REQUIRED_CONSECUTIVE_LOW_READINGS: 2
GENERATION_INTERVAL_MS: 1000
```

This makes alerts appear more frequently.

## Project Structure

```text
.
├── docker-compose.yml
├── Dockerfile
├── package.json
├── src
│   ├── generator
│   │   └── index.ts
│   ├── processor
│   │   └── index.ts
│   ├── reporter
│   │   └── index.ts
│   └── shared
│       └── connectRabbitMQ.ts
└── README.md
```

## Author

University integration systems assignment project.
