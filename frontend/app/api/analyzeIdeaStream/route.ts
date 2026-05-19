import { NextRequest } from "next/server";
import { enforceRateLimit } from "@/lib/requestGuard";
import { cleanText } from "@/utils/textCleaner";
import { runAgentPipeline } from "@/engines/agentOrchestrator";

export async function POST(request: NextRequest) {
  const requester = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = enforceRateLimit(`analyzeIdeaStream:${requester}`, 15, 60_000);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please retry shortly." }),
      { 
        status: 429,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const payload = (await request.json()) as { ideaName?: string; ideaDescription?: string };
    const ideaName = cleanText(payload.ideaName ?? "");
    const ideaDescription = cleanText(payload.ideaDescription ?? "");

    if (ideaName.length < 3 || ideaDescription.length < 12) {
      return new Response(
        JSON.stringify({ error: "ideaName and ideaDescription are required." }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "🧠 AI Analysis starting..."
          }) + "\n"));

          // Step 1: Idea Analysis
          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status", 
            message: "🔍 Analyzing idea concept and keywords..."
          }) + "\n"));
          
          await new Promise(resolve => setTimeout(resolve, 800)); // Natural delay

          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "🏭 Identifying industries and technologies..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 600));

          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "👥 Defining target users and pain points..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 800));

          // Step 2: External Research
          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "🔍 Scanning patents and prior art..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 1000));

          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "📚 Searching research papers and documentation..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 800));

          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "💻 Analyzing GitHub repositories and similar projects..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 1000));

          // Step 3: Analysis
          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "📊 Calculating innovation scores and metrics..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 800));

          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "🎯 Evaluating market potential and competition..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 600));

          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "💰 Assessing investment readiness..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 800));

          // Step 4: Final Processing
          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "🗺️ Building innovation landscape map..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 600));

          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "📋 Generating insights and recommendations..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 800));

          controller.enqueue(encoder.encode(JSON.stringify({
            type: "status",
            message: "🚀 Finalizing comprehensive analysis..."
          }) + "\n"));

          await new Promise(resolve => setTimeout(resolve, 600));

          // Run the actual analysis
          const result = await runAgentPipeline({
            ideaName,
            ideaDescription,
          });

          // Send final result
          controller.enqueue(encoder.encode(JSON.stringify({
            type: "result",
            data: result
          }) + "\n"));

          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(JSON.stringify({
            type: "error",
            message: "Analysis failed. Please try again."
          }) + "\n"));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
