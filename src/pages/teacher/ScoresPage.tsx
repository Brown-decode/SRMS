import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EnhancedDataTable } from "@/components/ui/EnhancedDataTable";
import { Save, Edit, Plus, FileText, Download } from "lucide-react";
import { assessmentService, Assessment } from "@/services/api/assessments";
import { Column } from "@/components/ui/EnhancedDataTable";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const ScoresPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [assessmentScores, setAssessmentScores] = useState<any[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const columns: Column<any>[] = [
    {
      key: "student_name",
      label: "Student Name",
      render: (row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <span className="ml-3 font-medium">{row.student_name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "score",
      label: "Score",
      render: (row) => (
        <div className="flex items-center">
          {row.score !== null ? (
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                row.score >= 80
                  ? "bg-green-100 text-green-800"
                  : row.score >= 60
                    ? "bg-yellow-100 text-yellow-800"
                    : row.score >= 40
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
              }`}
            >
              {row.score}
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              Not Scored
            </span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              // Handle score editing with better UX
              const currentScore =
                row.score !== null ? row.score.toString() : "";
              const newScore = prompt(
                `Enter score for ${row.student_name} (Max: ${selectedAssessment?.max_score || 0}):`,
                currentScore,
              );

              if (newScore !== null && newScore.trim() !== "") {
                const parsedScore = parseFloat(newScore);
                if (!isNaN(parsedScore)) {
                  updateStudentScore(row.student_id, parsedScore);
                } else {
                  alert("Please enter a valid number");
                }
              }
            }}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
            title="Edit Score"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await assessmentService.getAll();
      setAssessments(response);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load assessments:", error);
      setLoading(false);
      // Show user-friendly error message
      alert(
        "Failed to load assessments. Please ensure you are assigned to classes and subjects.",
      );
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessmentScores = async (assessmentId: number) => {
    try {
      setScoresLoading(true);
      const response =
        await assessmentService.getAssessmentScores(assessmentId);
      setAssessmentScores(response.students);
      setScoresLoading(false);
    } catch (error) {
      console.error("Failed to load assessment scores:", error);
      setScoresLoading(false);
    }
  };

  const updateStudentScore = async (studentId: number, score: number) => {
    try {
      // Validate score
      if (
        !selectedAssessment ||
        score < 0 ||
        score > selectedAssessment.max_score
      ) {
        alert(
          `Score must be between 0 and ${selectedAssessment?.max_score || 0}`,
        );
        return;
      }

      // Update local state immediately for better UX
      setAssessmentScores((prev) =>
        prev.map((student) =>
          student.student_id === studentId ? { ...student, score } : student,
        ),
      );

      // Call API to update score
      await assessmentService.updateScore(
        selectedAssessment.id,
        studentId,
        score,
      );

      // Reload scores to ensure consistency
      await loadAssessmentScores(selectedAssessment.id);
    } catch (error: any) {
      console.error("Failed to update score:", error);
      // Revert local state on error
      await loadAssessmentScores(selectedAssessment.id);

      // Show user-friendly error
      const errorMessage =
        error?.response?.data?.detail || "Failed to update score";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleBulkScoreEntry = async (scoresData: any[]) => {
    if (!selectedAssessment) return;

    try {
      // Filter out empty scores and validate
      const validScores = scoresData.filter(
        (score) =>
          score.score !== null &&
          score.score !== undefined &&
          score.score !== "" &&
          !isNaN(score.score),
      );

      if (validScores.length === 0) {
        alert("No valid scores to save");
        return;
      }

      // Send scores as floats (no integer conversion needed)
      await assessmentService.createScores(selectedAssessment.id, validScores);
      setShowScoreModal(false);

      // Reload scores to reflect changes
      await loadAssessmentScores(selectedAssessment.id);

      // Show success message
      alert(`Successfully saved ${validScores.length} score(s)`);
    } catch (error: any) {
      console.error("Failed to save scores:", error);
      const errorMessage =
        error?.response?.data?.detail || "Failed to save scores";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleExport = async () => {
    if (!selectedAssessment) return;

    try {
      await assessmentService.exportAssessmentScores(selectedAssessment.id);
    } catch (error: any) {
      console.error("Failed to export scores:", error);
      const errorMessage =
        error?.response?.data?.detail || "Failed to export scores";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <PageContainer
      title="Scores Entry"
      subtitle="Enter and manage assessment scores"
    >
      <div className="space-y-6">
        {/* Assessment Selection */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Assessment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center">
                <LoadingSpinner />
              </div>
            ) : assessments.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                No assessments found
              </div>
            ) : (
              assessments.map((assessment) => (
                <button
                  key={assessment.id}
                  onClick={() => {
                    setSelectedAssessment(assessment);
                    loadAssessmentScores(assessment.id);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-soft ${
                    selectedAssessment?.id === assessment.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {assessment.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Class: {(assessment as any).className || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Term: {assessment.term || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Max Score: {assessment.max_score}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Scores Table */}
        {selectedAssessment && (
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Scores - {selectedAssessment.title}
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => setShowScoreModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Bulk Entry
                </button>
                <button
                  onClick={() => loadAssessmentScores(selectedAssessment.id)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>

            <EnhancedDataTable
              data={assessmentScores}
              columns={columns}
              loading={scoresLoading}
              searchable={true}
              onExport={handleExport}
            />
          </div>
        )}

        {/* Bulk Score Entry Modal */}
        {showScoreModal && selectedAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bulk Score Entry - {selectedAssessment.title}
              </h3>

              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  Enter scores for all students. You can navigate between fields
                  using Tab key.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {assessmentScores.map((student, index) => (
                  <div key={student.student_id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {student.student_name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedAssessment.max_score}
                      step="0.01"
                      defaultValue={student.score || ""}
                      placeholder={`Max: ${selectedAssessment.max_score}`}
                      data-student={student.student_id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Tab") {
                          e.preventDefault();
                          const inputs = document.querySelectorAll(
                            'input[type="number"]',
                          );
                          const currentIndex = Array.from(inputs).indexOf(
                            e.target as HTMLInputElement,
                          );
                          if (currentIndex < inputs.length - 1) {
                            (
                              inputs[currentIndex + 1] as HTMLInputElement
                            ).focus();
                          }
                        }
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowScoreModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const scoresData = assessmentScores
                      .map((student) => {
                        const inputElement = document.querySelector(
                          `input[data-student="${student.student_id}"]`,
                        ) as HTMLInputElement;

                        const value = inputElement?.value?.trim();

                        // Handle empty or invalid values
                        if (!value || value === "") {
                          return {
                            student_id: student.student_id,
                            score: null, // Will be filtered out
                          };
                        }

                        const parsedScore = parseFloat(value);

                        return {
                          student_id: student.student_id,
                          score: isNaN(parsedScore) ? null : parsedScore,
                        };
                      })
                      .filter(
                        (score) => score.score !== null && !isNaN(score.score),
                      );

                    handleBulkScoreEntry(scoresData);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save All Scores
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
