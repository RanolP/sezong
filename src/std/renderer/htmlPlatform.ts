import { Platform } from '../../api/render/platform';

export const HtmlPlatform = new Platform<string>('HTML', (a, b) => a + b, '');
