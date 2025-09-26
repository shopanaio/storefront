import { UAParser } from "ua-parser-js";

export const parseUserAgent = (userAgent?: string) => {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();

  const isMobile = device.type === "mobile";
  const isTablet = device.type === "tablet";
  const isDesktop = !isMobile && !isTablet;
  const isIOS = os.name === "iOS";

  return { isMobile, isDesktop, isTablet, isIOS };
};
