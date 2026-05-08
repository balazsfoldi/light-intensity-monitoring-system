# Light Intensity Monitoring System

A Dockerized RabbitMQ-based distributed system for monitoring indoor light intensity values and generating alerts when low light conditions are detected.

## Overview

The system consists of three independent components communicating through RabbitMQ queues:

1. **Light Intensity Generator**
    - Generates random light intensity values between 0 and 2000 lux every 3 seconds
    - Sends the generated values to the `lightIntensityQueue`

2. **Light Intensity Processor**
    - Consumes messages from the `lightIntensityQueue`
    - Detects low light conditions
    - If 3 consecutive readings are below 100 lux, sends an alert message to the `lightAlertQueue`

3. **Alert Reporting Client**
    - Consumes alert messages from the `lightAlertQueue`
    - Prints alerts to the console

## Architecture

```text
+---------------------------+
| Light Intensity Generator |
+---------------------------+
              |
              v
     +------------------+
     | lightIntensity   |
     |      Queue       |
     +------------------+
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

- Node.js
- TypeScript
- RabbitMQ
- Docker Compose

## Features

- RabbitMQ point-to-point messaging
- Distributed service architecture
- Dockerized environment
- Automatic low light detection
- Alert generation and reporting
- Queue-based asynchronous communication

## Queue Structure

### `lightIntensityQueue`

Contains generated light intensity measurements.

Example message:

```json
{
  "lux": 85,
  "timestamp": "2026-05-08T14:30:00.000Z"
}
```

### `lightAlertQueue`

Contains generated low light alert messages.

Example message:

```json
{
  "message": "Low light alert: 3 consecutive readings below 100 lux."
}
```

## Project Structure

```text
.
├── docker-compose.yml
├── generator/
├── processor/
├── reporter/
└── README.md
```

## Running the Application

### Requirements

- Docker
- Docker Compose

### Start the system

```bash
docker compose up --build
```

## Expected Output

### Generator

```text
Generated light intensity: 320 lux
Generated light intensity: 78 lux
Generated light intensity: 64 lux
Generated light intensity: 52 lux
```

### Reporter

```text
Low light alert: 3 consecutive readings below 100 lux.
```

## Testing

The system can be tested by verifying the following:

- Light intensity messages are successfully sent to RabbitMQ
- The processor correctly detects low light conditions
- Alert messages are forwarded to the alert queue
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

## Author

University integration systems assignment project.
