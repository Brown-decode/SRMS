import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EnhancedDataTable } from "@/components/ui/EnhancedDataTable";
import { BookOpen, Users, Calendar } from "lucide-react";
import { teacherService } from "@/services/api/teachers";
import { Column } from "@/components/ui/EnhancedDataTable";

interface TeacherSubject {
  id: number;
  class_id: number;
  subject_id: number;
  subject_name: string;
  class_name: string;
  coefficient: number;
}

export const TeacherSubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const columns: Column<TeacherSubject>[] = [
    {
      key: "subject_name",
      label: "Subject Name",
      render: (row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <span className="ml-3 font-medium">{row.subject_name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "class_name",
      label: "Class",
      render: (row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-green-600" />
          </div>
          <span className="ml-3 font-medium">{row.class_name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "coefficient",
      label: "Coefficient",
      render: (row) => (
        <div className="flex items-center">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {row.coefficient}
          </span>
        </div>
      ),
      sortable: true,
    },
  ];

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const classSubjects = await teacherService.getMyClassSubjects();
      setSubjects(classSubjects);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load subjects:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  return (
    <PageContainer
      title="My Subjects"
      subtitle="View your assigned subjects and classes"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : subjects.length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Classes Assigned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading
                    ? "..."
                    : new Set(subjects.map((s) => s.class_name)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Coefficient</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading
                    ? "..."
                    : subjects.reduce((sum, s) => sum + s.coefficient, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Subject Assignments
          </h3>

          {subjects.length === 0 && !loading ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Subjects Assigned
              </h3>
              <p className="text-gray-500 mb-6">
                You haven't been assigned to any subjects yet. Please contact
                your administrator.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <EnhancedDataTable
                data={subjects}
                columns={columns}
                loading={loading}
                searchable
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
