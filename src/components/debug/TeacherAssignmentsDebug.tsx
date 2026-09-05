import React, { useState, useEffect } from "react";
import { apiClient } from "@/services/api/client";
import { useAuth } from "@/hooks/useAuth";

export const TeacherAssignmentsDebug: React.FC = () => {
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

        // Test 2: Check class_subject endpoint
        try {
          const classSubjects = await apiClient.get("/class_subject/");
          diagnostics.tests.push({
            test: "Class Subject Endpoint (/class_subject/)",
            status: "PASS",
            data: {
              endpoint: "/class_subject/",
              responseType: typeof classSubjects,
              isArray: Array.isArray(classSubjects),
              responseCount: Array.isArray(classSubjects) ? classSubjects.length : 0,
              sampleData: Array.isArray(classSubjects) ? classSubjects.slice(0, 2) : [],
            },
          });
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Class Subject Endpoint (/class_subject/)",
            status: "FAIL",
            data: {
              endpoint: "/class_subject/",
              error: error.response?.data || error.message,
              status: error.response?.status,
            },
          });
        }

        // Test 3: Check teachers endpoint
        try {
          const teachers = await apiClient.get("/teachers/?limit=10");
          diagnostics.tests.push({
            test: "Teachers Endpoint (/teachers/)",
            status: "PASS",
            data: {
              endpoint: "/teachers/?limit=10",
              responseType: typeof teachers,
              isArray: Array.isArray(teachers),
              responseCount: Array.isArray(teachers) ? teachers.length : 0,
              sampleData: Array.isArray(teachers) ? teachers.slice(0, 2) : [],
            },
          });
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Teachers Endpoint (/teachers/)",
            status: "FAIL",
            data: {
              endpoint: "/teachers/?limit=10",
              error: error.response?.data || error.message,
              status: error.response?.status,
            },
          });
        }

        // Test 4: Check classes endpoint
        try {
          const classes = await apiClient.get("/classes/");
          diagnostics.tests.push({
            test: "Classes Endpoint (/classes/)",
            status: "PASS",
            data: {
              endpoint: "/classes/",
              responseType: typeof classes,
              isArray: Array.isArray(classes),
              responseCount: Array.isArray(classes) ? classes.length : 0,
              sampleData: Array.isArray(classes) ? classes.slice(0, 2) : [],
            },
          });
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Classes Endpoint (/classes/)",
            status: "FAIL",
            data: {
              endpoint: "/classes/",
              error: error.response?.data || error.message,
              status: error.response?.status,
            },
          });
        }

        // Test 5: Check subjects endpoint
        try {
          const subjects = await apiClient.get("/subjects/");
          diagnostics.tests.push({
            test: "Subjects Endpoint (/subjects/)",
            status: "PASS",
            data: {
              endpoint: "/subjects/",
              responseType: typeof subjects,
              isArray: Array.isArray(subjects),
              responseCount: Array.isArray(subjects) ? subjects.length : 0,
              sampleData: Array.isArray(subjects) ? subjects.slice(0, 2) : [],
            },
          });
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Subjects Endpoint (/subjects/)",
            status: "FAIL",
            data: {
              endpoint: "/subjects/",
              error: error.response?.data || error.message,
              status: error.response?.status,
            },
          });
        }

        // Test 6: Check individual teacher by ID (if we have class subjects)
        try {
          const classSubjects = await apiClient.get("/class_subject/");
          if (Array.isArray(classSubjects) && classSubjects.length > 0) {
            const firstAssignment = classSubjects[0];
            const teacher = await apiClient.get(`/teachers/${firstAssignment.teacher_id}`);
            diagnostics.tests.push({
              test: "Individual Teacher Endpoint",
              status: "PASS",
              data: {
                endpoint: `/teachers/${firstAssignment.teacher_id}`,
                teacherData: teacher,
              },
            });
          } else {
            diagnostics.tests.push({
              test: "Individual Teacher Endpoint",
              status: "SKIP",
              data: "No class subjects available to test with",
            });
          }
        } catch (error: any) {
          diagnostics.tests.push({
            test: "Individual Teacher Endpoint",
            status: "FAIL",
            data: {
              error: error.response?.data || error.message,
              status: error.response?.status,
            },
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
        <div className="text-lg">Running teacher assignments diagnostics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teacher Assignments Diagnostics</h1>
      
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
          <h2 className="text-lg font-semibold mb-4">API Endpoint Tests</h2>
          <div className="space-y-3">
            {debugInfo.tests?.map((test: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded border ${
                  test.status === "PASS"
                    ? "bg-green-50 border-green-200"
                    : test.status === "FAIL"
                    ? "bg-red-50 border-red-200"
                    : test.status === "SKIP"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
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
                        : test.status === "SKIP"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
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
        <h2 className="text-lg font-semibold mb-4">Debug Analysis</h2>
        <div className="space-y-2 text-sm">
          <p>Check if all endpoints return PASS status</p>
          <p>Verify response types and data structures</p>
          <p>Look for any 422 or 404 errors</p>
          <p>Check if data arrays contain expected fields</p>
          <p>Verify authentication is working properly</p>
        </div>
      </div>
    </div>
  );
};
