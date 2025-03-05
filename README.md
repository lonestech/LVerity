# LVerity - License Management System

LVerity is a robust license management system built with Go, designed to handle license generation, verification, and device management with a focus on security and scalability.

## Features

### License Management
- Generate and manage different types of licenses (Basic, Standard, Pro, Enterprise)
- Support for trial, official, and pay-per-use licenses
- License activation and verification
- Batch license operations
- License usage tracking and statistics

### Device Management
- Device registration and tracking
- Device status monitoring
- Usage statistics collection
- Device-license association

### User Management
- Role-based access control (RBAC)
- JWT-based authentication
- Secure password handling
- User activity tracking

## Technology Stack

- **Backend**: Go 1.20+
- **Framework**: Gin
- **Database**: MySQL
- **Authentication**: JWT
- **ORM**: GORM
- **Frontend**: React 18
- **UI Framework**: Ant Design
- **HTTP Client**: Axios
- **State Management**: Redux Toolkit
- **Build Tool**: Vite

## Prerequisites

- Go 1.20 or higher
- MySQL 5.7 or higher
- Git

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd LVerity
```

2. Configure the database:
- Create a MySQL database
- Copy `config.json.example` to `config.json`
- Update the database configuration in `config.json`:
```json
{
    "database": {
        "host": "localhost",
        "port": 3306,
        "user": "your_username",
        "password": "your_password",
        "dbname": "lverity"
    }
}
```

3. Install dependencies:
```bash
go mod download
```

4. Run the application:
```bash
go run ./pkg/main.go
```

## API Documentation

### Authentication

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "password"
}
```

### License Management

#### Generate License
```
POST /api/license/generate
Authorization: Bearer {token}
Content-Type: application/json

{
    "type": "standard",
    "max_devices": 5,
    "expire_days": 365
}
```

#### Verify License
```
GET /api/license/verify?code={license_code}
Authorization: Bearer {token}
```

#### Activate License
```
POST /api/license/activate
Authorization: Bearer {token}
Content-Type: application/json

{
    "code": "LICENSE-CODE",
    "device_id": "DEVICE-ID"
}
```

### Device Management

#### Register Device
```
POST /api/device/register
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Device Name",
    "fingerprint": "DEVICE-FINGERPRINT",
    "info": {
        "os": "Windows",
        "arch": "x64",
        "cpu": "Intel i7",
        "mac": "00:11:22:33:44:55"
    }
}
```

## Project Structure

```
LVerity/
├── pkg/
│   ├── config/      # Configuration management
│   ├── database/    # Database connection and migrations
│   ├── handler/     # HTTP request handlers
│   ├── middleware/  # HTTP middleware
│   ├── model/       # Data models
│   ├── service/     # Business logic
│   └── utils/       # Utility functions
├── web/
│   ├── src/
│   │   ├── api/            # API requests
│   │   ├── assets/         # Static assets
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── styles/         # Global styles
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Utility functions
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
├── config.json             # Backend configuration
└── README.md              # This file
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control
- API endpoint protection
- Device fingerprinting
- License code encryption

## Frontend Features

### User Interface
- Modern and responsive design using Ant Design
- Dark/Light theme support
- Interactive dashboard with charts and statistics
- Real-time data updates using React Query

### License Management UI
- License creation wizard with step-by-step form
- Batch license operations with table operations
- License status monitoring dashboard with real-time updates
- Export and import functionality with Excel support
- Advanced search and filter capabilities

### Device Management UI
- Device registration with form validation
- Real-time device status monitoring
- Interactive usage statistics charts
- Device-license association management
- Location-based device tracking with map integration

### User Management UI
- User profile management with avatar upload
- Role and permission management with dynamic updates
- Activity logs with filtering and pagination
- Secure password change interface

## Frontend Development

The frontend is built with React, TypeScript, and Ant Design, providing a modern and responsive user interface.

### Frontend Structure

- React 18 for UI rendering
- TypeScript for type safety
- Ant Design for component library
- Axios for API communication
- React Router for navigation

### Frontend-Backend Integration

The backend serves the frontend assets directly, making deployment simpler. When you run the backend server, it will automatically serve the frontend application.

## Quick Start

### Prerequisites

- Go 1.20+
- Node.js 16+ and NPM
- SQLite (included)

### Building and Running

1. **Build the frontend application:**

```bash
# Windows
build_frontend.bat

# Linux/Mac
chmod +x build_frontend.sh
./build_frontend.sh
```

2. **Run the backend server:**

```bash
go run main.go
```

3. **Access the application:**

Open your browser and navigate to [http://localhost:8080](http://localhost:8080)

### API Endpoints

The backend API is available at `/api`. All frontend requests to the backend use this prefix.

#### Authentication

- POST `/auth/login` - User login
- POST `/auth/logout` - User logout
- GET `/auth/captcha` - Get captcha for login
- POST `/auth/refresh` - Refresh JWT token

#### Devices

- GET `/api/devices` - List devices
- GET `/api/devices/:id` - Get device details
- POST `/api/devices` - Create device
- PUT `/api/devices/:id` - Update device
- DELETE `/api/devices/:id` - Delete device

#### Licenses

- GET `/api/licenses` - List licenses
- GET `/api/licenses/:id` - Get license details
- POST `/api/licenses` - Create license
- PUT `/api/licenses/:id` - Update license
- DELETE `/api/licenses/:id` - Delete license
- POST `/api/licenses/activate` - Activate license for a device

#### Users

- GET `/api/users` - List users
- GET `/api/users/:id` - Get user details
- POST `/api/users` - Create user
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

## Development Mode

For development, you can run the frontend and backend separately:

1. **Run the backend:**

```bash
go run main.go
```

2. **Run the frontend development server:**

```bash
cd web
npm install
npm run dev
```

The Vite development server will proxy API requests to the backend automatically.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
