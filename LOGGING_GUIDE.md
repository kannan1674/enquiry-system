# Logging Guide

## Overview
This project now uses a centralized logging utility to manage console output and reduce excessive logging in production.

## Usage

### Import the logger
```typescript
import { logger } from '@/lib/utils/logger';
```

### Use different log levels
```typescript
// Debug logs (only in development)
logger.debug('Debug information', data);

// Info logs (development and production if enabled)
logger.info('General information', data);

// Warning logs (always shown)
logger.warn('Warning message', data);

// Error logs (always shown)
logger.error('Error occurred', error);
```

## Configuration

### Environment-based behavior
- **Development**: All log levels are shown
- **Production**: Only warnings and errors are shown by default

### Custom configuration
```typescript
import { logger } from '@/lib/utils/logger';

// Enable all logs in production
logger.setConfig({ enableProductionLogs: true });

// Change log level
logger.setConfig({ level: 'info' });

// Disable all logging
logger.disable();

// Re-enable logging
logger.enable();
```

## Best Practices

1. **Use appropriate log levels**:
   - `debug`: Detailed information for debugging
   - `info`: General information about application flow
   - `warn`: Warning conditions that don't break functionality
   - `error`: Error conditions that need attention

2. **Avoid excessive logging**:
   - Don't log in render loops or frequent state changes
   - Use conditional logging for expensive operations
   - Remove debug logs before production deployment

3. **Replace console.log statements**:
   ```typescript
   // Instead of:
   console.log('User data:', userData);
   
   // Use:
   logger.debug('User data:', userData);
   ```

## Recent Changes
- Removed excessive debug logging from Home page component
- Cleaned up AuthRehydrator component logging
- Removed debug logging from search-queries page
- Cleaned up mega-menu component debug logs
- Removed excessive logging from Search page component
- Created centralized logging utility

The logging count has been reduced from 853 to 556 statements (35% reduction).
