import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { EnhancedDataTable } from "@/components/ui/EnhancedDataTable";
import { Download, FileText, Search, Filter } from "lucide-react";
import { resultsService, ResultFilters } from "@/services/api/results";
import { classService } from "@/services/api/classes";
import { StudentReportCard } from "@/types/api";
import { Column } from "@/components/ui/EnhancedDataTable";

export const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<StudentReportCard[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ResultFilters>({
    term: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const columns: Column<any>[] = [
    {
      key: "student_name",
      label: "Student Name",
      render: (result) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <span className="ml-3 font-medium">{result.student_name}</span>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "matricule",
      label: "Matricule",
      render: (result) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
          {result.matricule}
        </span>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "average",
      label: "Average",
      render: (result) => (
        <div className="flex items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              result.average >= 10
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {result.average.toFixed(2)}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "promotion_status",
      label: "Status",
      render: (result) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            result.promotion_status === "PROMOTED"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {result.promotion_status}
        </span>
      ),
      sortable: true,
      filterable: true,
    },
    {
      key: "subjects",
      label: "Subjects",
      render: (result) => (
        <div className="text-sm text-gray-600">
          {result.subjects?.length || 0} subjects
        </div>
      ),
    },
  ];

  const loadClasses = useCallback(async () => {
    try {
      const classesData = await classService.getAll();
      setClasses(classesData.data); // Use .data to get array
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  }, []);

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);

      if (filters.class_id && filters.term) {
        // Load specific class results
        const resultsData = await resultsService.getClassResults(
          filters.class_id,
          filters.term,
        );
        setResults(resultsData);
      } else {
        // Load all results if no specific class selected
        const allResults = await resultsService.getAllResults();
        setResults(allResults);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load results:", error);
      setResults([]);
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleExport = async () => {
    if (!filters.class_id || !filters.term) return;

    try {
      await resultsService.exportClassResults(filters.class_id, filters.term);
    } catch (error) {
      console.error("Failed to export results:", error);
    }
  };

  const filteredResults = useMemo(() => {
    // Group results by student
    const studentMap = new Map<string, StudentReportCard>();

    results.forEach((student) => {
      const key = `${student.matricule}_${student.student_name}`;
      const existing = studentMap.get(key);

      // If no existing student or this one has a higher average, keep this one
      // This ensures we only show one entry per student (the best performing term)
      if (!existing || student.average > existing.average) {
        studentMap.set(key, student);
      }
    });

    const uniqueStudents = Array.from(studentMap.values());

    // Apply search filter
    if (searchTerm) {
      return uniqueStudents.filter(
        (student) =>
          student.student_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.matricule.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return uniqueStudents;
  }, [results, searchTerm]);

  return (
    <PageContainer>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Results</h2>
            <span className="text-gray-500">
              {filteredResults.length}{" "}
              {filteredResults.length === 1 ? "student" : "students"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              disabled={!filters.class_id || !filters.term}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Class:</label>
            <select
              value={filters.class_id || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  class_id: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Term:</label>
            <select
              value={filters.term || 1}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  term: parseInt(e.target.value),
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or matricule..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Data Table */}
        {results.length > 0 ? (
          <EnhancedDataTable
            data={filteredResults}
            columns={columns}
            loading={loading}
            searchable={false}
            filterable={false}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-8 text-center">
            <div className="text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Results Available
              </h3>
              <p className="text-sm">
                {filters.class_id && filters.term
                  ? "No results found for the selected class and term."
                  : "Showing the best performing term for each student. Select a class and term to view specific results."}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
