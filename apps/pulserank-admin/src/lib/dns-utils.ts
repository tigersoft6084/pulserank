import { promisify } from "util";
import dns from "dns";

// Promisify DNS lookup
const lookup = promisify(dns.lookup);

// Function to get IP address for a domain
export async function getDomainIP(domain: string): Promise<string> {
  try {
    const result = await lookup(domain);
    return result.address;
  } catch (error) {
    console.error(`Failed to resolve IP for domain ${domain}:`, error);
    return "N/A";
  }
}
