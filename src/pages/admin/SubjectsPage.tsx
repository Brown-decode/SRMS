import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { EnhancedDataTable } from '@/components/ui/EnhancedDataTable';
import { Plus, Edit, Trash2, BookOpen, Search } from 'lucide-react';
import { subjectService, SubjectCreateResponse } from '@/services/api/subjects';
import { Column } from '@/components/ui/EnhancedDataTable';

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectCreateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectCreateResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<SubjectCreateResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const columns: Column<SubjectCreateResponse>[] = [
    {
      key: 'name',
      label: 'Subject Name',
      render: (subject) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-green-600" />
          </div>
          <span className="ml-3 font-medium">{subject.name}</span>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (subject) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingSubject(subject)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(subject)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const loadSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const subjectsData = await subjectService.getAll();
      setSubjects(subjectsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCreateSubject = async (subjectData: any) => {
    try {
      await subjectService.create(subjectData);
      setShowCreateModal(false);
      loadSubjects();
    } catch (error) {
      console.error('Failed to create subject:', error);
    }
  };

  const handleUpdateSubject = async (subjectData: any) => {
    if (!editingSubject) return;

    try {
      await subjectService.update(editingSubject.id, subjectData);
      setEditingSubject(null);
      loadSubjects();
    } catch (error) {
      console.error('Failed to update subject:', error);
    }
  };

  const handleDeleteSubject = async () => {
    if (!showDeleteModal) return;

    try {
      await subjectService.delete(showDeleteModal.id);
      setShowDeleteModal(null);
      loadSubjects();
    } catch (error) {
      console.error('Failed to delete subject:', error);
    }
  };

  return (
    <PageContainer>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Subjects</h2>
            <span className="text-gray-500">({subjects.length} total)</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by subject name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Data Table */}
        <EnhancedDataTable
          data={subjects}
          columns={columns}
          loading={loading}
          searchable={true}
          filterable={true}
        />
      </div>

      {/* Create Subject Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Subject
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const subjectData = {
                  name: formData.get('name'),
                };
                handleCreateSubject(subjectData);
                e.currentTarget.reset();
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
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
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Subject
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const subjectData = {
                  name: formData.get('name'),
                };
                handleUpdateSubject(subjectData);
                e.currentTarget.reset();
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingSubject.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Subject
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
              Delete Subject
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{showDeleteModal.name}"? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubject}
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
