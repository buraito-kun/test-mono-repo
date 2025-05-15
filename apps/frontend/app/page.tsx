"use client";

import fetchCalculation from "@/lib/calculate";
import { useState, useEffect } from "react";

export default function Home() {
  const [a, setA] = useState<number | string>("");
  const [b, setB] = useState<number | string>("");
  const [op, setOp] = useState("+");
  const [value, setValue] = useState<number | null>();
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number | string>>, value: string) => {
    if (value === "") {
      setter("");
    } else {
      setter(parseFloat(value));
    }
    setError(null);
  };

  const onClickCalculate = async () => {
    if (a === "" || b === "") {
      setError("Please enter both values");
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    
    try {
      const result = await fetchCalculation(Number(a), Number(b), op);
      setValue(result);
    } catch (err) {
      setError("An error occurred during calculation");
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  const getOperationSymbol = (operation: string) => {
    switch (operation) {
      case "+": return "+";
      case "-": return "-";
      case "*": return "×";
      case "/": return "÷";
      case "^": return "^";
      default: return operation;
    }
  };

  // Handle keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onClickCalculate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [a, b, op]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">Simple Calculator</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {/* Result Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-right h-16 flex items-center justify-end">
            <span className="text-2xl md:text-3xl font-semibold text-gray-700 overflow-x-auto">
              {value !== undefined ? value : error ? "Error" : ""}
            </span>
          </div>
          
          {/* Calculator Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-center">
            <div>
              <label htmlFor="a" className="block text-sm font-medium text-gray-700 mb-1">First Number</label>
              <input
                id="a"
                type="number"
                value={a}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                onChange={(e) => handleInputChange(setA, e.target.value)}
                placeholder="a"
              />
            </div>
            
            <div>
              <label htmlFor="op" className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
              <select
                id="op"
                value={op}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                onChange={(e) => setOp(e.target.value)}
              >
                <option value="+">Addition (+)</option>
                <option value="-">Subtraction (-)</option>
                <option value="*">Multiplication (×)</option>
                <option value="/">Division (÷)</option>
                <option value="^">Exponent (^)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="b" className="block text-sm font-medium text-gray-700 mb-1">Second Number</label>
              <input
                id="b"
                type="number"
                value={b}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                onChange={(e) => handleInputChange(setB, e.target.value)}
                placeholder="b"
              />
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}
          
          {/* Equation Preview */}
          <div className="text-center mb-6">
            <span className="text-lg text-gray-600">
              {a !== "" ? a : "_"} {getOperationSymbol(op)} {b !== "" ? b : "_"} = {value !== undefined ? value : "?"}
            </span>
          </div>
          
          {/* Calculate Button */}
          <button
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${isCalculating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            onClick={onClickCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? "Calculating..." : "Submit!"}
          </button>
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-4">
          Press Enter to calculate quickly
        </p>
      </div>
    </div>
  );
}
