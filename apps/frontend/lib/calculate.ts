import { Span, trace } from "@opentelemetry/api";
import axios from "axios";

const tracer = trace.getTracer("frontend");

/**
 * Performs calculation locally as a fallback when API calls fail
 */
const calculateLocally = (a: number, b: number, op: string): number => {
  return tracer.startActiveSpan("fetchCalculation", (span: Span) => {
    try {
      switch (op) {
        case "+":
          span.end();
          return a + b;
        case "-":
          span.end();
          return a - b;
        case "*":
          span.end();
          return a * b;
        case "/":
          if (b === 0) {
            span.end();
            return NaN;
          } // Handle division by zero gracefully
          span.end();
          return a / b;
        case "^":
          span.end();
          return Math.pow(a, b);
        // For unsupported operations, return NaN instead of throwing
        case "**":
        case "%":
        default:
          console.warn(`Unsupported operation: ${op}, returning NaN`);
          span.end();
          return NaN;
      }
    } catch (err) {
      console.error("Calculation error:", err);
      span.end();
      return NaN; // Return NaN for any calculation errors
    }
  });
};

/**
 * Fetches calculation from API with local fallback for better UX
 */
const fetchCalculation = async (
  a: number,
  b: number,
  op: string
): Promise<number> => {
  return tracer.startActiveSpan("fetchCalculation", async (span: Span) => {
    try {
      // Only attempt API call if URL is configured
      if (process.env.NEXT_PUBLIC_API_URL) {
        const res = await axios.post(
          process.env.NEXT_PUBLIC_API_URL,
          { a, b, op },
          {
            headers: {
              "Content-Type": "application/json",
            },
            // Set a reasonable timeout to avoid long waits
            timeout: 3000,
          }
        );

        if (res.status >= 200 && res.status < 300) {
          span.end();
          return res.data;
        }
      }

      // Fallback to local calculation
      console.log("Falling back to local calculation");
      span.end();
      return calculateLocally(a, b, op);
    } catch (err) {
      // Handle API errors gracefully with local fallback
      console.warn("API calculation failed, using local fallback", err);
      span.end();
      return calculateLocally(a, b, op);
    }
  });
};

export default fetchCalculation;
