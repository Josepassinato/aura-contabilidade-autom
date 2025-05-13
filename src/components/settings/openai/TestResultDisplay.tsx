
import React from "react";

type TestResultProps = {
  testResult: { success: boolean; message: string } | null;
};

export function TestResultDisplay({ testResult }: TestResultProps) {
  if (!testResult) return null;

  return (
    <div className={`p-4 border rounded-md mt-4 ${
      testResult.success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
    }`}>
      <p className="font-medium">{testResult.success ? "Sucesso" : "Erro"}</p>
      <p>{testResult.message}</p>
    </div>
  );
}
