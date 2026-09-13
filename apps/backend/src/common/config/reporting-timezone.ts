import { appEnv } from './env.validation';

export function reportingTimeZone(): string {
  return appEnv().REPORTING_TIMEZONE;
}
