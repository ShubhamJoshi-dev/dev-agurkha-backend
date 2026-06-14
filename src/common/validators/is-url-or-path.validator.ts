import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Accepts either an absolute http(s) URL (e.g. `https://cdn.example.com/x.png`)
 * or a root-relative path (e.g. `/uploads/x.png`, `/assets/allies/logo.png`).
 *
 * The CMS naturally produces relative asset paths from the media library, so a
 * strict `@IsUrl()` rejected every create/update that stored a local upload
 * path (see docs/BACKEND_NEEDS.md #2). This validator unblocks that while still
 * rejecting garbage values.
 */
export function isUrlOrPath(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim() === '') return false;

  // Root-relative path: "/uploads/x.png", "/assets/y.svg"
  if (value.startsWith('/')) return true;

  // Otherwise must be a valid absolute http(s) URL.
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function IsUrlOrPath(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUrlOrPath',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return isUrlOrPath(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an absolute URL or a root-relative path (starting with "/")`;
        },
      },
    });
  };
}
