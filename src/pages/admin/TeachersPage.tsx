import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EnhancedDataTable } from "@/components/ui/EnhancedDataTable";
import { Plus, Edit, Trash2, User, Download, Search } from "lucide-react";
import {
  teacherService,
  Teacher,
  TeacherFilters,
} from "@/services/api/teachers";
import { teacherAssignmentService } from "@/services/api/teacherAssignments";
import { Column } from "@/components/ui/EnhancedDataTable";

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TeacherFilters>({
    page: 1,
    limit: 25,
  });
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const columns: Column<Teacher>[] = [
    {
      key: "full_name",
      label: "Full Name",
      render: (teacher) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <User className="h-4 w-4 text-green-600" />
          </div>
          <span className="ml-3 font-medium">{teacher.full_name}</span>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "loginid",
      label: "Email/Username",
      render: (teacher) => (
        <span className="font-mono text-sm">{teacher.loginid}</span>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "subjects_count",
      label: "Subjects",
      render: (teacher) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
          {teacher.subjects?.length || 0} subjects
        </span>
      ),
      sortable: false,
      filterable: false,
    },
    {
      key: "actions",
      label: "Actions",
      render: (teacher) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingTeacher(teacher)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(teacher)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const [response, assignmentsResponse] = await Promise.all([
        teacherService.getAll(filters),
        teacherAssignmentService.getAll({ limit: 1000 }), // Get all assignments
      ]);

      setTeachers(response.data);
      setTotal(response.total);

      // Calculate subject counts for each teacher
      const teachersWithSubjectCounts = response.data.map(
        (teacher: Teacher) => {
          const teacherAssignments = assignmentsResponse.data.filter(
            (assignment: any) => assignment.teacher_id === teacher.id,
          );
          const uniqueSubjects = new Set(
            teacherAssignments.map((assignment: any) => assignment.subject_id),
          );

          return {
            ...teacher,
            subjects: Array.from(uniqueSubjects), // Convert Set to array
          };
        },
      );

      setTeachers(teachersWithSubjectCounts);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load teachers:", error);
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

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
      await teacherService.exportCSV(filters);
    } catch (error) {
      console.error("Failed to export teachers:", error);
    }
  };

  const handleCreateTeacher = async (teacherData: any) => {
    try {
      await teacherService.create(teacherData);
      setShowCreateModal(false);
      loadTeachers(); // Reload to get updated data
    } catch (error) {
      console.error("Failed to create teacher:", error);
    }
  };

  const handleUpdateTeacher = async (teacherData: any) => {
    if (!editingTeacher) return;

    try {
      await teacherService.update(editingTeacher.id, teacherData);
      setEditingTeacher(null);
      loadTeachers(); // Reload to get updated data
    } catch (error) {
      console.error("Failed to update teacher:", error);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!showDeleteModal) return;

    try {
      await teacherService.delete(showDeleteModal.id);
      setShowDeleteModal(null);
      loadTeachers(); // Reload to get updated data
    } catch (error) {
      console.error("Failed to delete teacher:", error);
    }
  };

  return (
    <PageContainer
      title="Teachers Management"
      subtitle="Manage teacher accounts and subject assignments"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Teachers</h2>
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
              Add Teacher
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Data Table */}
        <EnhancedDataTable
          data={teachers}
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

      {/* Create Teacher Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Teacher
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const teacherData = {
                  full_name: formData.get("full_name"),
                  loginid: formData.get("loginid"),
                  password: formData.get("password"),
                };
                handleCreateTeacher(teacherData);
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
                    Email/Username
                  </label>
                  <input
                    name="loginid"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                  Create Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Teacher
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const teacherData = {
                  full_name: formData.get("full_name"),
                  loginid: formData.get("loginid"),
                };
                handleUpdateTeacher(teacherData);
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
                    defaultValue={editingTeacher.full_name || ""}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email/Username
                  </label>
                  <input
                    name="loginid"
                    type="email"
                    defaultValue={editingTeacher.loginid || ""}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Teacher
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
                onClick={handleDeleteTeacher}
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
