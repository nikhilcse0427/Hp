# Run HTML/PHP on Server - VSCode Extension

## Overview

The "Run HTML/PHP on Server" extension for Visual Studio Code allows you to quickly run and serve HTML and PHP files on a local server with an auto-refresh feature. It is designed to streamline the development workflow for web developers by providing a simple way to view and automatically refresh HTML and PHP files in the browser.

## Features

- Serve HTML and PHP files on a local server.
- Auto-refresh functionality for a seamless development experience.
- Works with Visual Studio Code to enhance your web development workflow.

## Getting Started

1. Install the extension from the Visual Studio Code Marketplace.
2. Open your HTML or PHP file in Visual Studio Code.
3. Run the command `Run HTML on Server` from the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
4. The extension will start a local server and open the file in your default web browser with auto-refresh enabled.

## Configuration

No additional configuration is required. The extension uses the extension's directory as the static content root and automatically adds an auto-refresh meta tag to the served HTML or PHP file.

## Notes

- PHP files are processed through a PHP interpreter (assuming PHP is installed on your machine).
- The server runs on port 3001 by default. Make sure this port is not occupied by other applications.

## Issues and Contributions

If you encounter any issues or have suggestions for improvements, please [submit an issue](https://github.com/thehsansaeed/Rapid-Live-Server/issues) on the GitHub repository.

Feel free to contribute by forking the repository and creating a pull request.


## License 
This extension is licensed under the [MIT](https://github.com/thehsansaeed/Rapid-Live-Server/blob/main/LICENSE.md)



## Acknowledgments

- Thanks to the [Express.js](https://expressjs.com/) team for the server framework.
- Auto-refresh feature inspired by the needs of web developers for a faster development cycle.

## Contact

For any inquiries or feedback, please contact [muhammadahsen83@gmail.com](mailto:your.muhammadahsen83@gmail.com).

Happy coding!

