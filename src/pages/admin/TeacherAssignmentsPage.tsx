import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EnhancedDataTable } from "@/components/ui/EnhancedDataTable";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Building2,
  Download,
  Search,
  AlertCircle,
} from "lucide-react";
import {
  teacherAssignmentService,
  TeacherAssignment,
  TeacherAssignmentCreate,
  TeacherAssignmentFilters,
} from "@/services/api/teacherAssignments";
import { teacherService, Teacher } from "@/services/api/teachers";
import { classService, Class } from "@/services/api/classes";
import { subjectService, SubjectCreateResponse } from "@/services/api/subjects";
import { Column } from "@/components/ui/EnhancedDataTable";

export const TeacherAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<SubjectCreateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TeacherAssignmentFilters>({
    page: 1,
    limit: 25,
  });
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<TeacherAssignment | null>(null);
  const [showDeleteModal, setShowDeleteModal] =
    useState<TeacherAssignment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<number | undefined>();
  const [selectedClass, setSelectedClass] = useState<number | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>();

  // Form state for create/edit
  const [formData, setFormData] = useState<TeacherAssignmentCreate>({
    teacher_id: 0,
    class_id: 0,
    subject_id: 0,
    coefficient: 1,
  });

  const columns: Column<TeacherAssignment>[] = [
    {
      key: "teacher",
      label: "Teacher",
      render: (assignment) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="ml-3">
            <div className="font-medium">{assignment.teacher.full_name}</div>
            <div className="text-sm text-gray-500">
              {assignment.teacher.loginid}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "class",
      label: "Class",
      render: (assignment) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-green-600" />
          </div>
          <div className="ml-3">
            <div className="font-medium">{assignment.class.name}</div>
            <div className="text-sm text-gray-500">
              {assignment.class.level} - {assignment.class.stream}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "subject",
      label: "Subject",
      render: (assignment) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-purple-600" />
          </div>
          <span className="ml-3 font-medium">{assignment.subject.name}</span>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "coefficient",
      label: "Coefficient",
      render: (assignment) => (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          {assignment.coefficient}
        </span>
      ),
      sortable: true,
      filterable: false,
    },
    {
      key: "created_at",
      label: "Created",
      render: (assignment) => (
        <span className="text-sm text-gray-500">
          {new Date(assignment.created_at).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      filterable: false,
    },
    {
      key: "actions",
      label: "Actions",
      render: (assignment) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(assignment)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(assignment)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Load assignments
  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teacherAssignmentService.getAll(filters);
      setAssignments(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to load assignments:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load teachers, classes, and subjects
  const loadOptions = useCallback(async () => {
    try {
      const [teachersRes, classesRes, subjectsRes] = await Promise.all([
        teacherService.getAll({ limit: 100 }), // Teachers endpoint max limit is 100
        classService.getAll(), // Classes endpoint doesn't accept limit parameter
        subjectService.getAll(), // Subjects endpoint doesn't accept limit parameter
      ]);
      setTeachers(teachersRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes);
    } catch (error) {
      console.error("Failed to load options:", error);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // Handle search and filters
  const handleSearch = () => {
    setFilters({
      ...filters,
      search: searchTerm,
      teacher_id: selectedTeacher,
      class_id: selectedClass,
      subject_id: selectedSubject,
      page: 1,
    });
  };

  // Handle create/edit
  const handleCreate = () => {
    setFormData({
      teacher_id: 0,
      class_id: 0,
      subject_id: 0,
      coefficient: 1,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (assignment: TeacherAssignment) => {
    setFormData({
      teacher_id: assignment.teacher_id,
      class_id: assignment.class_id,
      subject_id: assignment.subject_id,
      coefficient: assignment.coefficient,
    });
    setEditingAssignment(assignment);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await teacherAssignmentService.update(editingAssignment.id, formData);
      } else {
        await teacherAssignmentService.create(formData);
      }
      setShowCreateModal(false);
      setEditingAssignment(null);
      loadAssignments();
    } catch (error) {
      console.error("Failed to save assignment:", error);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await teacherAssignmentService.delete(showDeleteModal.id);
      setShowDeleteModal(null);
      loadAssignments();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    }
  };

  const handleExport = async () => {
    try {
      await teacherAssignmentService.exportCSV(filters);
    } catch (error) {
      console.error("Failed to export:", error);
    }
  };

  return (
    <PageContainer
      title="Teacher Class Assignments"
      subtitle="Manage teacher assignments to classes and subjects"
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </button>
        </div>
      }
    >
      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teacher
            </label>
            <select
              value={selectedTeacher || ""}
              onChange={(e) =>
                setSelectedTeacher(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
            >
              <option value="">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Class
            </label>
            <select
              value={selectedClass || ""}
              onChange={(e) =>
                setSelectedClass(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject || ""}
              onChange={(e) =>
                setSelectedSubject(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <EnhancedDataTable
        columns={columns}
        data={assignments || []}
        loading={loading}
        pagination={{
          page: filters.page || 1,
          total: total,
          limit: filters.limit || 25,
          onPageChange: (page) => setFilters({ ...filters, page }),
          onLimitChange: (limit) => setFilters({ ...filters, limit, page: 1 }),
        }}
      />

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingAssignment ? "Edit Assignment" : "Create Assignment"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teacher
                  </label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teacher_id: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class
                  </label>
                  <select
                    value={formData.class_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        class_id: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subject_id: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Coefficient
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.coefficient}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coefficient: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAssignment(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAssignment ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold">Delete Assignment</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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
