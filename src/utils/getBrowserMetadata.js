import { UAParser } from "ua-parser-js";

export const getBrowserMetadata = async () => {
  const parser = new UAParser();
  const result = parser.getResult();

  // Get IP + location
  const res = await fetch("https://ipwho.is/");
  const data = await res.json();

  return {
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    ip: data.ip,
    location: `${data.city}, ${data.region}, ${data.country}`,
  };
};
