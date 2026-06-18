# Light Intensity Monitoring System

A Dockerized distributed system based on RabbitMQ for monitoring indoor light intensity values and generating alerts when low light conditions are detected.

## Overview

The application consists of three independent services running in separate Docker containers and communicating asynchronously through RabbitMQ queues.

### Components

1. **Light Intensity Generator**
    - Generates random light intensity values between 0 and 2000 lux every 3 seconds
    - Sends generated measurements to the `lightIntensityQueue`

2. **Light Intensity Processor**
    - Consumes messages from the `lightIntensityQueue`
    - Detects low light conditions
    - If 3 consecutive readings are below 100 lux, sends an alert message to the `lightAlertQueue`

3. **Alert Reporting Client**
    - Consumes alert messages from the `lightAlertQueue`
    - Prints alerts to the console

## System Architecture

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
     +----------------------+
     |   lightAlertQueue    |
     +----------------------+
              |
              v
+---------------------------+
| Alert Reporting Client    |
+---------------------------+
```

## How It Works

1. The generator service periodically creates random lux measurements
2. The processor service consumes the measurements from RabbitMQ
3. The processor tracks consecutive low light readings
4. If 3 consecutive readings are below 100 lux, an alert is generated
5. The reporter service consumes and displays alert messages

## Technologies

- Node.js
- TypeScript
- RabbitMQ
- Docker
- Docker Compose

## Features

- RabbitMQ point-to-point messaging
- Distributed service architecture
- Asynchronous queue-based communication
- Automatic low light detection
- Alert generation and reporting
- Containerized deployment with Docker Compose

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

## Project Structure

```text
.
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── README.md
└── src
    ├── generator
    ├── processor
    ├── reporter
    └── shared
```

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

### Generator Service

```text
Generator service started
Sending messages to queue: lightIntensityQueue
Generated light intensity: 320 lux
Generated light intensity: 78 lux
Generated light intensity: 64 lux
Generated light intensity: 52 lux
```

### Alert Reporter Service

```text
Reporter service started
ALERT RECEIVED
Low light alert: 3 consecutive readings below 100 lux.
```

## Testing

The system can be tested by verifying the following:

- Light intensity messages are successfully sent to RabbitMQ
- The processor correctly detects low light conditions
- Alert messages are forwarded to the `lightAlertQueue`
- The reporter successfully consumes and displays alerts

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

University project for the Information Systems Integration course.
