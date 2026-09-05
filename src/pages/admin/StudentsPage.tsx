import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EnhancedDataTable } from "@/components/ui/EnhancedDataTable";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  Download,
  Search,
} from "lucide-react";
import {
  studentService,
  Student,
  StudentFilters,
} from "@/services/api/students";
import { Column } from "@/components/ui/EnhancedDataTable";

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    limit: 25,
  });
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const columns: Column<Student>[] = [
    {
      key: "full_name",
      label: "Full Name",
      render: (student) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <span className="ml-3 font-medium">{student.full_name}</span>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "matricule",
      label: "Matricule",
      render: (student) => (
        <span className="font-mono text-sm">{student.matricule}</span>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "date_of_birth",
      label: "Date of Birth",
      render: (student) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          <span>{student.date_of_birth}</span>
        </div>
      ),
      sortable: true,
      filterable: false,
    },
    {
      key: "gender",
      label: "Gender",
      render: (student) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            student.gender === "MALE"
              ? "bg-blue-100 text-blue-800"
              : "bg-pink-100 text-pink-800"
          }`}
        >
          {student.gender}
        </span>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (student) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingStudent(student)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(student)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentService.getAll(filters);
      setStudents(response.data);
      setTotal(response.total);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load students:", error);
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters((prev) => ({
      ...prev,
      search: term || undefined,
      page: 1, // Reset to first page on search
    }));
  };

  const handleExport = async () => {
    try {
      await studentService.exportCSV(filters);
    } catch (error) {
      console.error("Failed to export students:", error);
    }
  };

  const handleCreateStudent = async (studentData: any) => {
    try {
      await studentService.create(studentData);
      setShowCreateModal(false);
      loadStudents(); // Reload to get updated data
    } catch (error) {
      console.error("Failed to create student:", error);
    }
  };

  const handleUpdateStudent = async (studentData: any) => {
    if (!editingStudent) return;

    try {
      await studentService.update(editingStudent.id, studentData);
      setEditingStudent(null);
      loadStudents(); // Reload to get updated data
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const handleDeleteStudent = async () => {
    if (!showDeleteModal) return;

    try {
      await studentService.delete(showDeleteModal.id);
      setShowDeleteModal(null);
      loadStudents(); // Reload to get updated data
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  return (
    <PageContainer
      title="Students Management"
      subtitle="Manage student records and academic information"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Students</h2>
            <span className="text-gray-500">({total} total)</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Export to CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or matricule..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Data Table */}
        <EnhancedDataTable
          data={students}
          columns={columns}
          loading={loading}
          searchable={false} // Disable client-side search since we use server-side
          filterable={false} // Disable client-side filter since we use server-side
          pagination={{
            page: filters.page || 1,
            limit: filters.limit || 25,
            total: total,
            onPageChange: (page) => setFilters((prev) => ({ ...prev, page })),
            onLimitChange: (limit) =>
              setFilters((prev) => ({ ...prev, limit, page: 1 })),
          }}
        />
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Student
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const studentData = {
                  full_name: formData.get("full_name"),
                  matricule: formData.get("matricule"),
                  date_of_birth: formData.get("date_of_birth"),
                  gender: formData.get("gender"),
                };
                handleCreateStudent(studentData);
                e.currentTarget.reset();
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    name="full_name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matricule
                  </label>
                  <input
                    name="matricule"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    name="date_of_birth"
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Student
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const studentData = {
                  full_name: formData.get("full_name"),
                  matricule: formData.get("matricule"),
                  date_of_birth: formData.get("date_of_birth"),
                  gender: formData.get("gender"),
                };
                handleUpdateStudent(studentData);
                e.currentTarget.reset();
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    name="full_name"
                    type="text"
                    defaultValue={editingStudent.full_name || ""}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matricule
                  </label>
                  <input
                    name="matricule"
                    type="text"
                    defaultValue={editingStudent.matricule || ""}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    name="date_of_birth"
                    type="date"
                    defaultValue={editingStudent.date_of_birth || ""}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    defaultValue={editingStudent.gender || ""}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{showDeleteModal.full_name}"?
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
