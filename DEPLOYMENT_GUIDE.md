# Stock Market Simulator - Replit Deployment Guide

## Overview
This guide will help you deploy the Stock Market Simulator on Replit as a fully functional website.

## Prerequisites
- A Replit account
- Basic understanding of Node.js and React

## Quick Start

### 1. Fork/Import to Replit
1. Go to [replit.com](https://replit.com)
2. Click "Create Repl"
3. Choose "Import from GitHub" 
4. Enter your repository URL or fork this project
5. Select "Node.js" as the language

### 2. Environment Setup
The project is already configured with:
- `.replit` - Replit configuration
- `replit.nix` - Nix dependencies
- `package.json` - Node.js dependencies
- `requirements.txt` - Python dependencies

### 3. Install Dependencies
The dependencies will be installed automatically when you first run the project. If you need to install manually:

```bash
npm install
```

### 4. Environment Variables
Set these environment variables in Replit's Secrets tab:

```
DATABASE_URL=your_postgresql_connection_string
ALPHAVANTAGE_API_KEY=your_alphavantage_api_key
NODE_ENV=production
PORT=3000
```

### 5. Database Setup
1. In Replit, go to the "Tools" section
2. Click on "Database" 
3. Create a new PostgreSQL database
4. Copy the connection string to your environment variables

### 6. Run the Application
1. Click the "Run" button in Replit
2. The application will start on port 3000
3. Replit will automatically provide a public URL

## Development vs Production

### Development Mode
- Uses Vite dev server with hot reload
- Runs on port 3000
- Command: `npm run dev`

### Production Mode
- Serves built static files
- Optimized for performance
- Command: `npm run start`

## Build Process

### Client Build
```bash
npm run build:client
```
This builds the React application to `dist/public/`

### Server Build (Optional)
```bash
npm run build:server
```
This bundles the server code for production

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Check if another process is using port 3000
   - The app will automatically try different ports

2. **Database Connection Issues**
   - Verify your DATABASE_URL is correct
   - Ensure the database is accessible from Replit

3. **Build Failures**
   - Check that all dependencies are installed
   - Verify Node.js version (requires 18+)

4. **Python Dependencies**
   - If Python dependencies fail to install, the app will continue with JavaScript fallback
   - Check the console for any Python-related errors

### Performance Optimization

1. **Enable Caching**
   - Static assets are automatically cached
   - Database queries use connection pooling

2. **Monitor Resources**
   - Use Replit's resource monitor
   - Optimize database queries if needed

## Features Available

- ✅ Real-time stock price updates
- ✅ Virtual trading with simulated money
- ✅ Portfolio management
- ✅ Transaction history
- ✅ Watchlist functionality
- ✅ Responsive design
- ✅ WebSocket connections

## Support

If you encounter issues:
1. Check the console logs in Replit
2. Verify all environment variables are set
3. Ensure the database is properly configured
4. Check the network tab for API errors

## Deployment Checklist

- [ ] Repository imported to Replit
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database created and connected
- [ ] Application runs successfully
- [ ] Public URL accessible
- [ ] All features working correctly 