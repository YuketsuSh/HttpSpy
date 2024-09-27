# HttpSpy

HttpSpy is a command-line tool that allows developers to monitor and log HTTP requests in real-time on a local network or a specific machine. It captures request details such as headers, body, and response times to assist in debugging and optimizing web applications.

## Features

- **Real-time HTTP monitoring**: Captures and displays outgoing and incoming HTTP requests.
- **Logs requests**: Saves logs in structured formats like JSON and plain text for future analysis.
- **Custom filters**: Allows filtering by HTTP method (GET, POST, etc.) and status code (200, 404, etc.).
- **CLI Commands**: Control the monitoring process through start/stop commands.
- **Save logs**: Export captured data to a log file.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/YuketsuSh/HttpSpy.git
    cd HttpSpy
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Make the CLI tool executable:
    ```bash
    chmod +x bin/httpspy.js
    ```

## Usage

### Starting the monitoring:

To start capturing HTTP requests in real-time:
```bash
./bin/httpspy.js start
```

### Stopping the monitoring:

To stop the monitoring and save logs:
```bash
./bin/httpspy.js stop
```

### Apply filters:

To filter requests by HTTP method or status code:
```bash
./bin/httpspy.js filter --method GET --status 200
```

### Saving logs:

To save logs to a custom file:
```bash
./bin/httpspy.js save <filename>
```

### Example
```bash
./bin/httpspy.js start
./bin/httpspy.js filter --method POST
./bin/httpspy.js save logs.json
```

## Future Plans

- **Daemon mode**: Run HttpSpy in the background.
- **HTTPS support**: Capture HTTPS requests and SSL details.
- **Integration**: With monitoring tools like Prometheus and Grafana.

## Contributing

Feel free to contribute by opening an issue or submitting a pull request.

---

## License

MIT License. See `LICENSE` file for more details.