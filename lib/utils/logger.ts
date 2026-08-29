/**
 * Centralized logging utility for the application
 * Provides different log levels and can be configured for production vs development
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableProductionLogs: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      enableConsole: true,
      enableProductionLogs: false,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enableConsole) return false;
    
    // In production, only log warnings and errors unless explicitly enabled
    if (process.env.NODE_ENV === 'production' && !this.config.enableProductionLogs) {
      return level === 'warn' || level === 'error';
    }

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  // Method to update configuration
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Method to disable all logging
  disable(): void {
    this.config.enableConsole = false;
  }

  // Method to enable all logging
  enable(): void {
    this.config.enableConsole = true;
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export the class for custom instances if needed
export { Logger };
export type { LogLevel, LoggerConfig };
