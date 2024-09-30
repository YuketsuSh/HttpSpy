# HttpSpy

HttpSpy is a command-line tool that allows developers to monitor and log HTTP/HTTPS requests in real-time on a local network or a specific machine. It captures request details such as headers, body, and response times to assist in debugging and optimizing web applications.

## Features

- **Real-time HTTP/HTTPS monitoring**: Captures and displays outgoing and incoming HTTP and HTTPS requests.
- **Logs requests**: Saves logs in structured formats like JSON, CSV, or plain text for future analysis.
- **Custom filters**: Allows filtering by HTTP method (GET, POST, etc.).
- **CLI Commands**: Control the monitoring process through start/stop commands.
- **HTTPS support**: Monitor both HTTP and HTTPS traffic with automatic SSL handling.
- **Graceful shutdown**: Logs and saves requests properly when stopping the tool.

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

To start capturing HTTP/HTTPS requests in real-time:
```bash
./bin/httpspy.js start
```

You can specify the following options:

- `-p, --port <number>`: Specify the port to start monitoring (default: 8089).
- `-m, --methods <methods>`: Filter by HTTP methods (comma-separated, e.g., GET, POST).
- `-r, --realtime`: Display logs in real-time in the console.
- `--https`: Enable HTTPS monitoring with automatic SSL certificate handling.
- `--save <filepath>`: Specify where to save the logs (default: logs/logs.txt).
- `--debug`: Enable detailed logging for debugging purposes.

Example:
```bash
./bin/httpspy.js start -p 8070 -m GET,POST --realtime --https --debug
```

### Stopping the monitoring:

To stop the monitoring and save the captured logs:
```bash
./bin/httpspy.js stop
```

You can also specify a custom log file:
```bash
./bin/httpspy.js stop --save <filename>
```

### Example

Start monitoring with real-time output and HTTPS enabled, then save the logs to a file:
```bash
./bin/httpspy.js start -p 8089 --https --realtime
./bin/httpspy.js stop --save logs/logs.txt
```

### Log Formats

- **JSON**: Structured format, useful for programmatic analysis.
- **CSV**: Easy to import into spreadsheets or other data tools.
- **Plain text**: Simple, human-readable format.

Logs can be saved in any of these formats by specifying the filename with the appropriate extension (e.g., `logs.json`, `logs.csv`, `logs.txt`).

## Future Plans

- **Daemon mode**: Run HttpSpy in the background as a service.
- **Advanced filtering**: Include more granular filters such as request/response headers.
- **Integration**: Support for monitoring tools like Prometheus and Grafana.
- **Timeline Tracking**: Visualize request paths in a separate terminal (currently under development).

## Contributing

Feel free to contribute by opening an issue or submitting a pull request.

---

## License

GPL-3.0 License. See `LICENSE` file for more details.