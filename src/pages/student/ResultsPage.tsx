import React, { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { studentService } from "@/services/api/students";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  User,
  Award,
  TrendingUp,
  Calendar,
  Building2,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Mock school header data
const SCHOOL_HEADER = {
  name: "Government Bilingual High School Bepanda",
  motto: "Peace-Work-Fatherland",
  address: "P.O BOX/B.P 24039, Douala, Cameroon",
  phone: "+237 233 123 456",
  email: "info@govsec-buea.cm",
  website: "www.govsec-buea.cm",
};

interface StudentResults {
  student_name: string;
  matricule: string;
  average: number;
  position: number;
  promotion_status: string;
  subjects: Array<{
    subject_name: string;
    coefficient: number;
    average: number;
    grade?: string;
    position?: number;
  }>;
  // Enhanced optional fields from backend
  class_name?: string;
  class_size?: number;
  total_students?: number;
}

interface StudentProfile {
  id: number;
  matricule: string;
  class_id: number;
  user: {
    full_name: string;
  };
}

const calculateGrade = (score: number): string => {
  if (score >= 16) return "A";
  if (score >= 14) return "B";
  if (score >= 12) return "C";
  if (score >= 10) return "D";
  return "F";
};

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case "A":
      return "bg-green-100 text-green-800";
    case "B":
      return "bg-blue-100 text-blue-800";
    case "C":
      return "bg-yellow-100 text-yellow-800";
    case "D":
      return "bg-orange-100 text-orange-800";
    case "F":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPromotionColor = (status: string): string => {
  return status === "PROMOTED"
    ? "bg-green-100 text-green-800"
    : status === "REPEAT"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";
};

export const StudentResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTerm, setSelectedTerm] = useState(1);
  const [results, setResults] = useState<StudentResults | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load student profile
        const profile = await studentService.getMyProfile();
        console.log("Student profile loaded:", profile);
        console.log("Student profile structure:", profile);
        setStudentProfile(profile);

        // Load results for selected term
        const resultsData = await studentService.getMyResults(selectedTerm);
        console.log("Student results loaded:", resultsData);
        console.log("Student results structure:", resultsData);
        console.log("Results position:", resultsData.position);
        console.log("Results student_name:", resultsData.student_name);
        console.log("Enhanced data - class_name:", resultsData.class_name);
        console.log("Enhanced data - class_size:", resultsData.class_size);
        console.log(
          "Enhanced data - total_students:",
          resultsData.total_students,
        );

        // Check if enhanced data is present
        if (!resultsData.class_name) {
          console.warn("WARNING: class_name is missing from results data");
        }
        if (!resultsData.class_size) {
          console.warn("WARNING: class_size is missing from results data");
        }
        if (!resultsData.total_students) {
          console.warn("WARNING: total_students is missing from results data");
        }

        // Add grades to subjects
        const processedResults = {
          ...resultsData,
          subjects:
            resultsData.subjects?.map((subject) => ({
              ...subject,
              grade: calculateGrade(subject.average),
            })) || [],
        };

        setResults(processedResults);
      } catch (err: any) {
        console.error("Failed to load results:", err);
        setError(err?.response?.data?.detail || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedTerm]);

  const handleDownloadPDF = async () => {
    try {
      setPdfGenerating(true);
      setError(null);
      console.log("Starting PDF download for term:", selectedTerm);
      await studentService.downloadResultsPDF(selectedTerm);
      console.log("PDF download completed successfully");

      // Show success message briefly
      const successMsg = document.createElement("div");
      successMsg.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
      successMsg.textContent = "PDF downloaded successfully!";
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
    } catch (err: any) {
      console.error("Failed to download PDF:", err);
      // Don't set error state if PDF actually downloaded (some browsers throw errors after successful download)
      if (
        !err.message?.includes("download") &&
        !err.message?.includes("blob")
      ) {
        setError(err?.response?.data?.detail || "Failed to download PDF");
      }
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleTermChange = (term: number) => {
    setSelectedTerm(term);
  };

  if (loading) {
    return (
      <PageContainer title="My Results" subtitle="Academic Performance Report">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="My Results" subtitle="Academic Performance Report">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </PageContainer>
    );
  }

  if (!results || !studentProfile) {
    return (
      <PageContainer title="My Results" subtitle="Academic Performance Report">
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">
            {!results
              ? "No results available"
              : "Unable to load student profile"}
          </div>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </PageContainer>
    );
  }

  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear - 1}/${currentYear}`;

  return (
    <PageContainer title="My Results" subtitle="Academic Performance Report">
      {/* School Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-blue-800">
              {SCHOOL_HEADER.name}
            </h1>
            <p className="text-lg text-gray-600 italic">
              "{SCHOOL_HEADER.motto}"
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                {SCHOOL_HEADER.address}
              </span>
              <span className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {SCHOOL_HEADER.phone}
              </span>
              <span className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {SCHOOL_HEADER.email}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Card Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-gray-800">
              END OF TERM REPORT CARD
            </h2>
            <div className="flex justify-center space-x-8 text-sm">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Academic Year: {academicYear}
              </span>
              <span className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                Term: {selectedTerm}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Term Selector and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          {[1, 2, 3].map((term) => (
            <Button
              key={term}
              variant={selectedTerm === term ? "default" : "outline"}
              onClick={() => handleTermChange(term)}
            >
              Term {term}
            </Button>
          ))}
        </div>
        <Button
          onClick={handleDownloadPDF}
          disabled={pdfGenerating}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>{pdfGenerating ? "Generating..." : "Download PDF"}</span>
        </Button>
      </div>

      {/* Student Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Student Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg font-semibold">
                {(() => {
                  // Try different possible paths for student name
                  if (studentProfile?.user?.full_name)
                    return studentProfile.user.full_name;
                  if (studentProfile?.user?.username)
                    return studentProfile.user.username;
                  if (studentProfile?.full_name)
                    return studentProfile.full_name;
                  if (results?.student_name) return results.student_name;
                  return "Student Name";
                })()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Matricule
              </label>
              <p className="text-lg font-semibold">
                {studentProfile?.matricule || results?.matricule || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Class</label>
              <p className="text-lg font-semibold">
                {results?.class_name || studentProfile?.class?.name || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Academic Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">Coefficient</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results?.subjects?.map((subject, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {subject.subject_name || "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    {subject.coefficient || 0}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {(subject.average || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getGradeColor(subject.grade || "F")}>
                      {subject.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        (subject.average || 0) >= 10 ? "default" : "destructive"
                      }
                    >
                      {(subject.average || 0) >= 10 ? "Passed" : "Failed"}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No subject data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(results.average || 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Overall Average</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                #{results.position || 0}
              </div>
              <div className="text-sm text-gray-500">Class Position</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {results.subjects?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Total Subjects</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge
                className={`text-lg px-4 py-2 ${getPromotionColor(
                  results.promotion_status || "REPEAT",
                )}`}
              >
                {results.promotion_status || "REPEAT"}
              </Badge>
              <div className="text-sm text-gray-500 mt-2">Promotion Status</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Total Students in Class</h4>
              <div className="text-2xl font-bold text-blue-600">
                {results.class_size || results.total_students || "N/A"}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Academic Year</h4>
              <div className="text-2xl font-bold text-purple-600">
                {currentYear - 1}/{currentYear}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
