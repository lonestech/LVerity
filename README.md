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

1. Navigate to the frontend directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

### Environment Configuration

Create `.env` files for different environments:

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=LVerity (Dev)

# .env.production
VITE_API_BASE_URL=/api
VITE_APP_TITLE=LVerity
```

### Development Guidelines

1. Component Development
- Use functional components with hooks
- Implement proper TypeScript types
- Follow React best practices for performance
- Write unit tests using React Testing Library

2. State Management
- Use Redux Toolkit for global state
- Implement Redux Thunk for async actions
- Use React Query for server state management
- Follow proper state normalization practices

3. Styling
- Use styled-components for component styling
- Follow Ant Design design guidelines
- Implement responsive design principles
- Support theme customization

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
