export class RegisterWebPushRequestDto {
  endpoint!: string;
  p256dh!: string;
  auth!: string;
  userAgent?: string;
}
