import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  TrendingUp,
  RefreshCw,
  Building2,
  Edit,
} from "lucide-react";
import { apiClient } from "../../services/api/client";
import { teacherService } from "../../services/api/teachers";
import { EnhancedDataTable } from "../../components/ui/EnhancedDataTable";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Column } from "../../components/ui/EnhancedDataTable";

interface ClassData {
  id: number;
  name: string;
}

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [classStats, setClassStats] = useState<{
    [key: number]: { students: number; average: number };
  }>({});
  const [statsLoading, setStatsLoading] = useState<{ [key: number]: boolean }>(
    {},
  );
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const columns: Column<ClassData>[] = [
    {
      key: "name",
      label: "Class Name",
      render: (row) => (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 text-gray-500 mr-2" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "students",
      label: "Students",
      render: (row) => {
        const stats = classStats[row.id];
        if (statsLoading[row.id]) {
          return <LoadingSpinner size="sm" />;
        }
        return (
          <div className="flex items-center">
            <Users className="h-4 w-4 text-gray-500 mr-2" />
            <span className="font-medium">{stats?.students || 0}</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: "average",
      label: "Class Average",
      render: (row) => {
        const stats = classStats[row.id];
        if (statsLoading[row.id]) {
          return <LoadingSpinner size="sm" />;
        }
        return (
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-gray-500 mr-2" />
            <span className="font-medium text-gray-400">N/A</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              navigate(`/teacher/assessments?class_id=${row.id}`)
            }
            className="text-blue-600 hover:text-blue-800"
            title="Manage Assessments"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const loadClasses = async () => {
    try {
      setLoading(true);

      // Get teacher's class subjects first
      const classSubjects = await teacherService.getMyClassSubjects();
      
      // Extract unique classes from class subjects to avoid duplicates
      const uniqueClassesMap = new Map();
      classSubjects.forEach((cs: any) => {
        if (!uniqueClassesMap.has(cs.class_id)) {
          uniqueClassesMap.set(cs.class_id, {
            id: cs.class_id,
            name: cs.class_name,
          });
        }
      });
      
      const uniqueClasses = Array.from(uniqueClassesMap.values());
      setClasses(uniqueClasses);

      if (uniqueClasses.length === 0) {
        console.log(
          "No classes found - teacher may not be assigned to any classes",
        );
      }

      // Load stats for each unique class
      uniqueClasses.forEach((cls) => {
        loadClassStats(cls.id);
      });

      setLoading(false);
    } catch (error: any) {
      console.error("Failed to load classes:", error);
      setLoading(false);
    }
  };

  const loadClassStats = async (classId: number) => {
    try {
      setStatsLoading((prev) => ({ ...prev, [classId]: true }));

      // Get student count only
      const studentsResponse = await apiClient.get(
        `/classes/${classId}/students`,
      );

      // The students API returns array directly in response
      let students = [];
      if (Array.isArray(studentsResponse)) {
        students = studentsResponse;
      } else if (Array.isArray(studentsResponse.data)) {
        students = studentsResponse.data;
      } else if (
        studentsResponse.data &&
        Array.isArray(studentsResponse.data.data)
      ) {
        students = studentsResponse.data.data;
      }

      const finalStats = { students: students.length, average: 0 };

      setClassStats((prev) => ({
        ...prev,
        [classId]: finalStats,
      }));
    } catch (error) {
      console.error(`Failed to load stats for class ${classId}:`, error);
    } finally {
      setStatsLoading((prev) => ({ ...prev, [classId]: false }));
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      await teacherService.exportClassesCSV();
    } catch (error) {
      console.error("Failed to export classes:", error);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // Calculate summary stats - focus on students only
  const totalStudents = Object.values(classStats).reduce(
    (sum, stats) => sum + stats.students,
    0,
  );

  return (
    <PageContainer
      title="My Classes"
      subtitle="Manage and view your assigned classes"
      actions={
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          title="Refresh Class Data"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.length}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalStudents}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Performance</p>
              <p className="text-2xl font-bold text-gray-400">N/A</p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div
          onClick={() => navigate("/teacher/subjects")}
          className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Subjects</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.length}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Class Table */}
      {classes.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Classes Assigned
          </h3>
          <p className="text-gray-500 mb-6">
            You haven't been assigned to any classes yet. Please contact your
            administrator.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Class Assignments
            </h3>
          </div>
          <div className="overflow-x-auto">
            <EnhancedDataTable
              data={classes}
              columns={columns}
              loading={loading}
              searchable
              onExport={handleExport}
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
};
