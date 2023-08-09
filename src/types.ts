import type { Stats } from 'divine-pride-api-wrapper/build/types';

export interface ExtractorConfig {
  divinePrideApiKey: string;
  downloadSprites?: boolean;
  downloadAnimatedSprites?: boolean;
  downloadMapImages?: boolean;
  ignoreEmptySpawns?: boolean;
  useFilter?: boolean;
  desiredStats?: Partial<Stats>;
}
