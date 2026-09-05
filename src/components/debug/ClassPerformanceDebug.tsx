import React, { useState, useEffect } from "react";
import { apiClient } from "@/services/api/client";
import { useAuth } from "@/hooks/useAuth";

export const ClassPerformanceDebug: React.FC = () => {
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

        // Test 2: Check new class performance endpoint
        try {
          const classPerformance = await apiClient.get("/class-performance/");
          diagnostics.tests.push({
            test: "Class Performance Endpoint (/class-performance/)",
            status: "PASS",
            data: {
              endpoint: "/class-performance/",
              responseCount: Array.isArray(classPerformance) ? classPerformance.length : 0,
              sampleData: Array.isArray(classPerformance) ? classPerformance.slice(0, 2) : [],
            },
          });
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Class Performance Endpoint (/class-performance/)",
            status: "FAIL",
            data: {
              endpoint: "/class-performance/",
              error: error.response?.data || error.message,
              status: error.response?.status,
            },
          });
        }

        // Test 3: Check old results endpoint
        try {
          const results = await apiClient.get("/results/");
          diagnostics.tests.push({
            test: "Old Results Endpoint (/results/)",
            status: "PASS",
            data: {
              endpoint: "/results/",
              responseCount: Array.isArray(results) ? results.length : 0,
              sampleData: Array.isArray(results) ? results.slice(0, 2) : [],
            },
          });
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Old Results Endpoint (/results/)",
            status: "FAIL",
            data: {
              endpoint: "/results/",
              error: error.response?.data || error.message,
              status: error.response?.status,
            },
          });
        }

        // Test 4: Check backend data structure
        try {
          const classPerf = await apiClient.get("/class-performance/");
          if (Array.isArray(classPerf) && classPerf.length > 0) {
            const sampleClass = classPerf[0];
            diagnostics.tests.push({
              test: "Data Structure Validation",
              status: "PASS",
              data: {
                hasRequiredFields: [
                  'className' in sampleClass,
                  'passRate' in sampleClass,
                  'totalStudents' in sampleClass,
                  'passedStudents' in sampleClass,
                ],
                fieldTypes: {
                  className: typeof sampleClass.className,
                  passRate: typeof sampleClass.passRate,
                  totalStudents: typeof sampleClass.totalStudents,
                  passedStudents: typeof sampleClass.passedStudents,
                },
                sampleClass,
              },
            });
          } else {
            diagnostics.tests.push({
              test: "Data Structure Validation",
              status: "FAIL",
              data: {
                reason: "No class performance data available",
                data: classPerf,
              },
            });
          }
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Data Structure Validation",
            status: "ERROR",
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
        <div className="text-lg">Running class performance diagnostics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Class Performance Diagnostics</h1>
      
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
        <h2 className="text-lg font-semibold mb-4">Fix Verification</h2>
        <div className="space-y-2 text-sm">
          <p>• "Class Performance Endpoint" should show PASS - confirms new endpoint works</p>
          <p>• "Data Structure Validation" should show PASS - confirms correct data format</p>
          <p>• Check sample data shows real class names (not random ones)</p>
          <p>• Verify passRate calculations are based on real student data</p>
          <p>• totalStudents and passedStudents should be real counts</p>
          <p>• No more "Class X" random generation from matricule numbers</p>
        </div>
      </div>
    </div>
  );
};
