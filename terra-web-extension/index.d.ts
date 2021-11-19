declare module 'terra-web-extension' {
  const fn: (
    url: string,
    param?: { extensionPaths?: string[]; puppeteerLaunchOptions?: object },
  ) => void;
  
  export = fn;
}
