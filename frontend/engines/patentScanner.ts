import { scanPatentIntelligence } from "@/engines/patentIntelligenceEngine";

export async function scanPatents(keywords: string[]) {
  return scanPatentIntelligence(keywords);
}
