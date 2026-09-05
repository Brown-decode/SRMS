import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EnhancedDataTable } from "@/components/ui/EnhancedDataTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye, Download } from "lucide-react";
import {
  assessmentService,
  Assessment,
  AssessmentCreate,
  AssessmentUpdate,
} from "@/services/api/assessments";
import { Column } from "@/components/ui/EnhancedDataTable";
import { toast } from "sonner";

export const TeacherAssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 25,
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);

  // Form states
  const [formData, setFormData] = useState<AssessmentCreate>({
    title: "",
    description: "",
    class_subject_id: 0,
    term: 1,
    sequence: 1,
    max_score: 100,
    weight: 100, // Default weight percentage
    date: new Date().toISOString().split("T")[0],
  });

  const loadAssessments = async () => {
    try {
      console.log("â Starting to load assessments...");
      setLoading(true);
      const response = await assessmentService.getAll();
      console.log("â Assessments loaded:", response);
      console.log("â Assessments count:", response?.length || 0);
      setAssessments(response);
      setTotal(response.length);
      setLoading(false);
      console.log("â Assessment loading completed");
    } catch (error) {
      console.error("â Failed to load assessments:", error);
      console.error(
        "â Error details:",
        error?.response?.data || error?.message,
      );
      toast.error("Failed to load assessments");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const handleCreate = async () => {
    try {
      const newAssessment = await assessmentService.create(formData);
      setAssessments([...assessments, newAssessment]);
      setTotal(total + 1);
      setIsCreateModalOpen(false);
      toast.success("Assessment created successfully");

      // Reset form
      setFormData({
        title: "",
        description: "",
        class_subject_id: 0,
        term: 1,
        sequence: 1,
        max_score: 100,
        weight: 100, // Default weight percentage
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Failed to create assessment:", error);
      toast.error("Failed to create assessment");
    }
  };

  const handleUpdate = async () => {
    if (!selectedAssessment) return;

    try {
      const updateData: AssessmentUpdate = {
        title: formData.title,
        description: formData.description,
        class_subject_id: formData.class_subject_id,
        term: formData.term,
        sequence: formData.sequence,
        max_score: formData.max_score,
        date: formData.date,
      };

      const updatedAssessment = await assessmentService.update(
        selectedAssessment.id,
        updateData,
      );
      setAssessments(
        assessments.map((a) =>
          a.id === selectedAssessment.id ? updatedAssessment : a,
        ),
      );
      setIsEditModalOpen(false);
      setSelectedAssessment(null);
      toast.success("Assessment updated successfully");
    } catch (error) {
      console.error("Failed to update assessment:", error);
      toast.error("Failed to update assessment");
    }
  };

  const handleDelete = async (assessment: Assessment) => {
    if (
      !window.confirm(`Are you sure you want to delete "${assessment.title}"?`)
    ) {
      return;
    }

    try {
      await assessmentService.delete(assessment.id);
      setAssessments(assessments.filter((a) => a.id !== assessment.id));
      setTotal(total - 1);
      toast.success("Assessment deleted successfully");
    } catch (error) {
      console.error("Failed to delete assessment:", error);
      toast.error("Failed to delete assessment");
    }
  };

  const openEditModal = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setFormData({
      title: assessment.title,
      description: assessment.description || "",
      class_subject_id: assessment.class_subject_id,
      term: assessment.term,
      sequence: assessment.sequence,
      max_score: assessment.max_score,
      weight: assessment.weight || 100, // Default to 100 if not set
      date: assessment.date,
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsViewModalOpen(true);
  };

  const exportScores = async (assessment: Assessment) => {
    try {
      await assessmentService.exportAssessmentScores(assessment.id);
      toast.success("Assessment scores exported successfully");
    } catch (error) {
      console.error("Failed to export scores:", error);
      toast.error("Failed to export scores");
    }
  };

  const columns: Column<Assessment>[] = [
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <div className="font-medium text-gray-900">{row.title}</div>
      ),
      sortable: true,
    },
    {
      key: "className",
      label: "Class",
      render: (row) => (
        <div className="text-gray-600">
          {(row as any).className || "Unknown Class"}
        </div>
      ),
      sortable: true,
    },
    {
      key: "term",
      label: "Term",
      render: (row) => <div className="text-gray-600">Term {row.term}</div>,
      sortable: true,
    },
    {
      key: "sequence",
      label: "Sequence",
      render: (row) => <div className="text-gray-600">{row.sequence}</div>,
      sortable: true,
    },
    {
      key: "max_score",
      label: "Max Score",
      render: (row) => <div className="text-gray-600">{row.max_score}</div>,
      sortable: true,
    },
    {
      key: "weight",
      label: "Weight %",
      render: (row) => (
        <div className="text-gray-600">{row.weight || 100}%</div>
      ),
      sortable: true,
    },
    {
      key: "date",
      label: "Date",
      render: (row) => (
        <div className="text-gray-600">
          {new Date(row.date).toLocaleDateString()}
        </div>
      ),
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openViewModal(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(row)}
            className="text-green-600 hover:text-green-800"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportScores(row)}
            className="text-purple-600 hover:text-purple-800"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer title="Assessment Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search assessments..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>

        {/* Assessments Table */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Debug: Loading: {loading.toString()}, Assessments:{" "}
            {assessments.length}, Total: {total}
          </p>
        </div>
        <EnhancedDataTable
          data={assessments}
          columns={columns}
          loading={loading}
          searchable={true}
          pagination={{
            page: filters.page,
            limit: filters.limit,
            total: total,
            onPageChange: (page) => setFilters({ ...filters, page }),
            onLimitChange: (limit) => setFilters({ ...filters, limit }),
          }}
        />

        {/* Create Assessment Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Create New Assessment
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter assessment title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter assessment description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term *
                    </label>
                    <input
                      type="number"
                      value={formData.term}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          term: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sequence *
                    </label>
                    <input
                      type="number"
                      value={formData.sequence}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sequence: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Score *
                    </label>
                    <input
                      type="number"
                      value={formData.max_score}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_score: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight %
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!formData.title || !formData.class_subject_id}
                  >
                    Create Assessment
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Edit Assessment Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Assessment</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter assessment title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter assessment description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term *
                    </label>
                    <input
                      type="number"
                      value={formData.term}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          term: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sequence *
                    </label>
                    <input
                      type="number"
                      value={formData.sequence}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sequence: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Score *
                    </label>
                    <input
                      type="number"
                      value={formData.max_score}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_score: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight %
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={!formData.title}>
                    Update Assessment
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* View Assessment Modal */}
        {isViewModalOpen && selectedAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h2 className="text-xl font-semibold mb-4">Assessment Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedAssessment.title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {selectedAssessment.description || "No description"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class
                    </label>
                    <p className="text-gray-900">
                      {(selectedAssessment as any).className || "Unknown Class"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term
                    </label>
                    <p className="text-gray-900">
                      Term {selectedAssessment.term}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sequence
                    </label>
                    <p className="text-gray-900">
                      {selectedAssessment.sequence}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Score
                    </label>
                    <p className="text-gray-900">
                      {selectedAssessment.max_score}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight %
                    </label>
                    <p className="text-gray-900">
                      {selectedAssessment.weight || 100}%
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedAssessment.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => exportScores(selectedAssessment)}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Scores
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
