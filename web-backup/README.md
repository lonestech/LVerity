# LVerity Web Frontend

This is the web frontend for the LVerity project, built with:
- Vite
- React
- TypeScript
- Ant Design Pro Components

## Project Structure

```
src/
  ├── pages/          # Route-based components
  │   ├── license/    # License management
  │   ├── device/     # Device management
  │   ├── user/       # User management
  │   ├── system/     # System settings
  │   └── dashboard/  # Analytics dashboard
  ├── services/       # API services
  ├── models/         # Data models
  └── components/     # Shared components
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts
