import React, { useState, useEffect } from "react";
import { apiClient } from "@/services/api/client";
import { useAuth } from "@/hooks/useAuth";

export const AssessmentDebug: React.FC = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        setLoading(true);
        const diagnostics: any = {
          user: user,
          timestamp: new Date().toISOString(),
          tests: [],
        };

        // Test 1: Check authentication
        try {
          const token = localStorage.getItem("srms_access_token");
          diagnostics.tests.push({
            test: "Authentication Token",
            status: token ? "PASS" : "FAIL",
            data: token ? "Token exists" : "No token found",
          });
        } catch (error) {
          diagnostics.tests.push({
            test: "Authentication Token",
            status: "ERROR",
            data: error,
          });
        }

        // Test 2: Check teacher profile
        try {
          const profile = await apiClient.get("/teachers/me");
          diagnostics.tests.push({
            test: "Teacher Profile",
            status: "PASS",
            data: profile,
          });
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Teacher Profile",
            status: "FAIL",
            data: error.response?.data || error.message,
          });
        }

        // Test 3: Check class subjects
        try {
          const classSubjects = await apiClient.get(
            "/teachers/me/class-subjects",
          );
          diagnostics.tests.push({
            test: "Class Subjects",
            status: "PASS",
            data: classSubjects,
          });
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Class Subjects",
            status: "FAIL",
            data: error.response?.data || error.message,
          });
        }

        // Test 4: Check assessments (main issue) - CORRECT ENDPOINT
        try {
          const assessments = await apiClient.get("/assessment/");
          diagnostics.tests.push({
            test: "Teacher Assessments (/assessment/)",
            status: "PASS",
            data: assessments,
          });
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Teacher Assessments (/assessment/)",
            status: "FAIL",
            data: error.response?.data || error.message,
          });
        }

        // Test 5: Check if wrong endpoint was being used
        try {
          const assessments = await apiClient.get("/teachers/me/assessments");
          diagnostics.tests.push({
            test: "Wrong Endpoint Test (/teachers/me/assessments)",
            status: "PASS",
            data: assessments,
          });
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Wrong Endpoint Test (/teachers/me/assessments)",
            status: "FAIL",
            data: error.response?.data || error.message,
          });
        }

        setDebugInfo(diagnostics);
      } catch (error) {
        console.error("Diagnostic error:", error);
      } finally {
        setLoading(false);
      }
    };

    runDiagnostics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Running diagnostics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Assessment Loading Diagnostics
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo.user, null, 2)}
          </pre>
        </div>

        {/* Test Results */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Diagnostic Tests</h2>
          <div className="space-y-3">
            {debugInfo.tests?.map((test: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded border ${
                  test.status === "PASS"
                    ? "bg-green-50 border-green-200"
                    : test.status === "FAIL"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{test.test}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      test.status === "PASS"
                        ? "bg-green-100 text-green-800"
                        : test.status === "FAIL"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
                <details className="mt-2">
                  <summary className="text-sm text-gray-600 cursor-pointer">
                    View Details
                  </summary>
                  <pre className="text-xs bg-gray-50 p-2 mt-2 rounded overflow-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
        <div className="space-y-2 text-sm">
          <p>
            • If "Teacher Assessments (/assessment/)" test FAILS, check
            authentication and permissions
          </p>
          <p>
            • If "Class Subjects" test FAILS, the teacher may not be assigned to
            any classes
          </p>
          <p>
            • If "Authentication Token" test FAILS, the user is not properly
            logged in
          </p>
          <p>
            • Check browser console (F12) for network errors and detailed API
            responses
          </p>
          <p>
            • Ensure the teacher is assigned to at least one class-subject
            combination
          </p>
          <p>
            • The backend uses /assessment/ endpoint with role-based filtering
            internally
          </p>
          <p>
            • Teachers should only see assessments for their assigned
            class-subjects
          </p>
        </div>
      </div>
    </div>
  );
};
