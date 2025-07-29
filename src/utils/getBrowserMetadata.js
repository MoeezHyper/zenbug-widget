import { UAParser } from "ua-parser-js";

export const getBrowserMetadata = () => {
  const parser = new UAParser();
  const result = parser.getResult();

  return {
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };
};
