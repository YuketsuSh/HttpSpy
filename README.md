# HttpSpy

HttpSpy is a command-line tool that allows developers to monitor and log HTTP/HTTPS requests in real-time on a local network or a specific machine. It captures request details such as headers, body, and response times to assist in debugging and optimizing web applications.

## Features

- **Real-time HTTP/HTTPS monitoring**: Captures and displays outgoing and incoming HTTP and HTTPS requests.
- **Logs requests**: Saves logs in structured formats like JSON for future analysis.
- **Custom filters**: Allows filtering by HTTP method (GET, POST, etc.).
- **CLI Commands**: Control the monitoring process through start/stop commands.
  - **Automatic SSL certificates**: Automatically generates SS-+

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
- `-m, --methods <methods>`: Filter by HTTP methods (comma-separated, e.g., GET,POST).
- `-r, --realtime`: Display logs in real-time in the console.
- `--https`: Enable HTTPS monitoring with automatic SSL certificate generation.

Example:
```bash
./bin/httpspy.js start -p 8070 -m GET --realtime --https
```

### Stopping the monitoring:

To stop the monitoring and save logs:
```bash
./bin/httpspy.js stop
```

### Saving logs:

Logs are automatically saved when you stop the monitoring, but you can also specify a custom log file:
```bash
./bin/httpspy.js stop --save <filename>
```

### Example
```bash
./bin/httpspy.js start -p 8089 --https --realtime
./bin/httpspy.js stop --save logs.txt
```

## Future Plans

- **Daemon mode**: Run HttpSpy in the background as a service.
- **Advanced filtering**: Include more granular filters such as request/response headers.
- **Integration**: With monitoring tools like Prometheus and Grafana.

## Contributing

Feel free to contribute by opening an issue or submitting a pull request.

---

## License

GPL-3.0 License. See `LICENSE` file for more details.