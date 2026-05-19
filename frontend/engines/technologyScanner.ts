import { scanTechnologySignals } from "@/engines/technologyScannerEngine";

export async function scanTechnologies(keywords: string[]) {
  return scanTechnologySignals(keywords);
}
