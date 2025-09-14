export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validUrls: string[];
}

export interface ValidationTranslations {
  empty: string;
  tooMany: (max: number, count: number) => string;
  invalidFormat: (line: number, url: string) => string;
}

export interface MultiFormatValidationResult {
  isValid: boolean;
  errors: string[];
  validItems: string[];
  itemTypes: ("url" | "site" | "domain")[];
}

export interface MultiFormatValidationTranslations {
  empty: string;
  tooMany: (max: number, count: number) => string;
  invalidFormat: (line: number, item: string) => string;
}

export function validateUrlList(
  urls: string,
  maxSites: number = 10,
  t?: ValidationTranslations,
): ValidationResult {
  const errors: string[] = [];
  const validUrls: string[] = [];

  // Split by line breaks and filter out empty lines
  const urlLines = urls
    .split("\n")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  // Check if list is empty
  if (urlLines.length === 0) {
    errors.push(t?.empty || "Please enter at least one URL");
    return { isValid: false, errors, validUrls };
  }

  // Check if too many URLs
  if (urlLines.length > maxSites) {
    const errorMsg =
      t?.tooMany(maxSites, urlLines.length) ||
      `Maximum ${maxSites} sites allowed. You entered ${urlLines.length}`;
    errors.push(errorMsg);
  }

  // Validate each URL
  urlLines.forEach((url, index) => {
    const lineNumber = index + 1;

    // Check if URL matches www.example.com format
    const urlPattern =
      /^www\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!urlPattern.test(url)) {
      const errorMsg =
        t?.invalidFormat(lineNumber, url) ||
        `Line ${lineNumber}: "${url}" - Invalid format. Use format: www.example.com`;
      errors.push(errorMsg);
    } else {
      validUrls.push(url);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validUrls,
  };
}

export function validateMultiFormatList(
  items: string,
  maxItems: number = 10,
  t?: MultiFormatValidationTranslations,
): MultiFormatValidationResult {
  const errors: string[] = [];
  const validItems: string[] = [];
  const itemTypes: ("url" | "site" | "domain")[] = [];

  // Split by line breaks and filter out empty lines
  const itemLines = items
    .split("\n")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  // Check if list is empty
  if (itemLines.length === 0) {
    errors.push(t?.empty || "Please enter at least one item");
    return { isValid: false, errors, validItems, itemTypes };
  }

  // Check if too many items
  if (itemLines.length > maxItems) {
    const errorMsg =
      t?.tooMany(maxItems, itemLines.length) ||
      `Maximum ${maxItems} items allowed. You entered ${itemLines.length}`;
    errors.push(errorMsg);
  }

  // Patterns
  const urlPattern = /^https?:\/\//i;
  // Site: hostname with optional www, no protocol, may have subdomain
  const sitePattern = /^(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
  // Domain: root domain only (no subdomain, no www)
  const domainPattern = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

  // Helper to check if a hostname is a root domain (no subdomain, no www)
  function isRootDomain(host: string) {
    // No subdomain, no www
    return (
      domainPattern.test(host) &&
      !/^www\./.test(host) &&
      host.split(".").length === 2
    );
  }

  itemLines.forEach((item, index) => {
    const lineNumber = index + 1;
    if (urlPattern.test(item)) {
      validItems.push(item);
      itemTypes.push("url");
    } else if (sitePattern.test(item)) {
      if (isRootDomain(item)) {
        validItems.push(item);
        itemTypes.push("domain");
      } else {
        validItems.push(item);
        itemTypes.push("site");
      }
    } else {
      const errorMsg =
        t?.invalidFormat(lineNumber, item) ||
        `Line ${lineNumber}: "${item}" - Invalid format. Use URL (https://example.com/blabla), site (www.example.com or sub.example.com), or domain (example.com)`;
      errors.push(errorMsg);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validItems,
    itemTypes,
  };
}

/**
 * Validates if a string is a complete URL with protocol
 * @param url - The URL string to validate
 * @returns true if the URL is valid and has a protocol, false otherwise
 */
export function isValidFullUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const urlObj = new URL(url);
    // Check if protocol is http or https
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validates URL and returns error message if invalid
 * @param url - The URL string to validate
 * @returns Error message if invalid, null if valid
 */
export function getUrlValidationError(url: string): string | null {
  if (!url.trim()) {
    return null; // Empty URL is allowed (no error)
  }

  if (!isValidFullUrl(url)) {
    return "Please enter a complete URL with protocol (e.g., https://example.com)";
  }

  return null;
}

/**
 * Normalizes a URL by adding https:// if no protocol is provided
 * @param url - The URL string to normalize
 * @returns Normalized URL with protocol
 */
export function normalizeUrl(url: string): string {
  if (!url.trim()) {
    return url;
  }

  // If URL already has protocol, return as is
  if (url.match(/^https?:\/\//)) {
    return url;
  }

  // Add https:// if no protocol
  return `https://${url}`;
}

/**
 * Extracts the root domain from a URL
 * @param url - The URL string to extract domain from
 * @returns Root domain (e.g., "example.com" from "https://www.example.com/path")
 */
export function extractRootDomain(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    // If it's already a bare domain name, return it as is
    if (!url.includes("://") && !url.includes("/")) {
      // Check if it's a root domain (no subdomain, no www)
      const domainPattern = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
      if (
        domainPattern.test(url) &&
        !/^www\./.test(url) &&
        url.split(".").length === 2
      ) {
        return url;
      }
    }

    // Parse as URL
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    const hostname = urlObj.hostname;

    // Remove www. if present
    const host = hostname.replace(/^www\./, "");

    // Only keep root domain (last two parts)
    const parts = host.split(".");
    if (parts.length >= 2) {
      return parts.slice(-2).join(".");
    }

    return host;
  } catch (error) {
    console.error(`Error extracting root domain from URL ${url}:`, error);
    return null;
  }
}
