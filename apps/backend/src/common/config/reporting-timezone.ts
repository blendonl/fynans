const DEFAULT_REPORTING_TIMEZONE = 'Europe/Belgrade';

export function reportingTimeZone(): string {
  return process.env.REPORTING_TIMEZONE || DEFAULT_REPORTING_TIMEZONE;
}
