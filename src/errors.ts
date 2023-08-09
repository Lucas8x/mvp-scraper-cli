export class NoHtmlPage extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoHtmlPage';
  }
}

export class FailedGetMvpData extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FailedGetMvpData';
  }
}

export class FailedSpriteDownload extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FailedSpriteDownload';
  }
}

export class FailedAnimatedSpriteDownload extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FailedAnimatedSpriteDownload';
  }
}

export class FailedMapImageDownload extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FailedMapImageDownload';
  }
}
