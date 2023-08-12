export interface ExtractorConfig {
  divinePrideApiKey: string;
  downloadSprites?: boolean;
  downloadAnimatedSprites?: boolean;
  downloadMapImages?: boolean;
  ignoreEmptySpawns?: boolean;
  useFilter?: boolean;
  desiredStats?: string[];
}
