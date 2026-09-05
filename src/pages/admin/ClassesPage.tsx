import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EnhancedDataTable } from "@/components/ui/EnhancedDataTable";
import { Plus, Edit, Trash2, Building2, Users } from "lucide-react";
import { classService, Class, ClassFilters } from "@/services/api/classes";
import { studentService } from "@/services/api/students";
import { Column } from "@/components/ui/EnhancedDataTable";

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ClassFilters>({
    page: 1,
    limit: 25,
  });
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Class | null>(null);

  const columns: Column<Class>[] = [
    {
      key: "name",
      label: "Class Name",
      render: (classItem) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <span className="ml-3 font-medium">{classItem.name}</span>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "level",
      label: "Level",
      render: (classItem) => (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
          {classItem.level}
        </span>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "stream",
      label: "Stream",
      render: (classItem) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
          {classItem.stream}
        </span>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "students_count",
      label: "Students",
      render: (classItem) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-400 mr-2" />
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
            {classItem.students?.length || 0} students
          </span>
        </div>
      ),
      sortable: false,
      filterable: false,
    },
    {
      key: "actions",
      label: "Actions",
      render: (classItem) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingClass(classItem)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(classItem)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const [classesData, studentsData] = await Promise.all([
        classService.getAll(filters),
        studentService.getAll(), // Students endpoint doesn't support limit parameter
      ]);

      // Calculate student counts for each class
      const classesWithStudentCounts = classesData.data.map(
        (classItem: Class) => {
          const classStudents = studentsData.data.filter(
            (student: any) => student.class_id === classItem.id,
          );

          return {
            ...classItem,
            students: classStudents, // Add students array to class object
          };
        },
      );

      setClasses(classesWithStudentCounts);
      setTotal(classesData.total);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load classes:", error);
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleCreateClass = async (classData: any) => {
    try {
      const newClass = await classService.create(classData);
      setClasses((prev) => [newClass, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create class:", error);
    }
  };

  const handleUpdateClass = async (classData: any) => {
    if (!editingClass) return;

    try {
      const updatedClass = await classService.update(
        editingClass.id,
        classData,
      );
      setClasses((prev) =>
        prev.map((c) => (c.id === updatedClass.id ? updatedClass : c)),
      );
      setEditingClass(null);
    } catch (error) {
      console.error("Failed to update class:", error);
    }
  };

  const handleDeleteClass = async () => {
    if (!showDeleteModal) return;

    try {
      await classService.delete(showDeleteModal.id);
      setClasses((prev) => prev.filter((c) => c.id !== showDeleteModal.id));
      setShowDeleteModal(null);
    } catch (error) {
      console.error("Failed to delete class:", error);
    }
  };

  return (
    <PageContainer
      title="Classes Management"
      subtitle="Manage class information and student assignments"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
            <span className="text-gray-500">({total} total)</span>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </button>
        </div>

        {/* Data Table */}
        <EnhancedDataTable
          data={classes}
          columns={columns}
          loading={loading}
          searchable={true}
          filterable={true}
          pagination={{
            page: filters.page || 1,
            limit: filters.limit || 25,
            total: total,
            onPageChange: (page) => setFilters((prev) => ({ ...prev, page })),
            onLimitChange: (limit) =>
              setFilters((prev) => ({ ...prev, limit })),
          }}
        />
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Class
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateClass(Object.fromEntries(formData));
                e.currentTarget.reset();
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    name="level"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Level</option>
                    <option value="PRIMARY">Form 1</option>
                    <option value="SECONDARY">Form 2</option>
                    <option value="THIRD_FORM">Form 3</option>
                    <option value="FOURTH_FORM">Form 4</option>
                    <option value="FIFTH_FORM">Form 5</option>
                    <option value="LOWER_SIXTH">Lower Sixth</option>
                    <option value="UPPER_SIXTH">Upper Sixth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stream
                  </label>
                  <select
                    name="stream"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Stream</option>
                    <option value="GENERAL">General</option>
                    <option value="SCIENCE">Science</option>
                    <option value="ARTS">Arts</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="TECHNICAL">Technical</option>
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
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Class
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateClass(Object.fromEntries(formData));
                e.currentTarget.reset();
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingClass.name || ""}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    name="level"
                    defaultValue={editingClass.level || ""}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Level</option>
                    <option value="PRIMARY">Form 1</option>
                    <option value="SECONDARY">Form 2</option>
                    <option value="THIRD_FORM">Form 3</option>
                    <option value="FOURTH_FORM">Form 4</option>
                    <option value="FIFTH_FORM">Form 5</option>
                    <option value="LOWER_SIXTH">Lower Sixth</option>
                    <option value="UPPER_SIXTH">Upper Sixth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stream
                  </label>
                  <select
                    name="stream"
                    defaultValue={editingClass.stream || ""}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Stream</option>
                    <option value="GENERAL">General</option>
                    <option value="SCIENCE">Science</option>
                    <option value="ARTS">Arts</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="TECHNICAL">Technical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Class
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
              Are you sure you want to delete "{showDeleteModal.name}"? This
              action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClass}
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
