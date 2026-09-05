import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  User,
  Mail,
  Building2,
  BookOpen,
  Calendar,
  Edit2,
  Save,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { teacherService } from "@/services/api/teachers";
import { apiClient } from "@/services/api/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useTheme } from "@/contexts/ThemeContext";

interface TeacherProfile {
  id: number;
  full_name: string;
  loginid: string;
  user_id: number;
}

interface ClassSubject {
  id: number;
  class_id: number;
  subject_id: number;
  subject_name: string;
  class_name: string;
  coefficient: number;
}

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  totalAssessments: number;
  averagePerformance: number;
}

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", loginid: "" });
  const [saving, setSaving] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Load teacher profile
      const profileData = await teacherService.getMyProfile();
      setProfile(profileData);
      setEditForm({
        full_name: profileData.full_name,
        loginid: profileData.loginid,
      });

      // Load class subjects
      const subjects = await teacherService.getMyClassSubjects();
      setClassSubjects(subjects);

      // Load stats (reuse dashboard service)
      try {
        const { dashboardService } = await import("@/services/api/dashboard");
        const statsData = await dashboardService.getTeacherStats();
        setStats(statsData);
      } catch (error) {
        console.warn("Could not load stats:", error);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load profile:", error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditForm({
      full_name: profile?.full_name || "",
      loginid: profile?.loginid || "",
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      full_name: profile?.full_name || "",
      loginid: profile?.loginid || "",
    });
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      // Update teacher profile
      await teacherService.update(profile.id, {
        full_name: editForm.full_name,
        loginid: editForm.loginid,
      });

      // Reload profile
      await loadProfile();
      setEditing(false);
      setSaving(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <PageContainer title="Profile" subtitle="Manage your account information">
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Profile" subtitle="Manage your account information">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Profile Information
              </h3>
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  title="Edit Profile"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                    title="Save"
                  >
                    {saving ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, full_name: e.target.value })
                      }
                      className="px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    />
                  ) : (
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {profile?.full_name}
                    </p>
                  )}
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Teacher
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.loginid}
                      onChange={(e) =>
                        setEditForm({ ...editForm, loginid: e.target.value })
                      }
                      className="flex-1 px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    />
                  ) : (
                    <span className="text-neutral-600 dark:text-neutral-300">
                      {profile?.loginid}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Information */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Statistics */}
            {stats && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                  Teaching Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalClasses}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Classes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.totalStudents}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Students
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.totalAssessments}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Assessments
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {stats.averagePerformance}%
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      Avg Performance
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Class Assignments */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Class Assignments
              </h3>
              <div className="space-y-3">
                {classSubjects.length === 0 ? (
                  <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">
                    No class assignments found
                  </p>
                ) : (
                  classSubjects.map((cs) => (
                    <div
                      key={cs.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {cs.class_name}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {cs.subject_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                          Coeff: {cs.coefficient}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Theme Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                      Dark Mode
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 dark:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  {isDark ? (
                    <Moon className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                  ) : (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">
                    {isDark ? "Dark theme is active" : "Light theme is active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-soft border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Teacher ID
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    #{profile?.id}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    User ID
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    #{profile?.user_id}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Account Type
                  </span>
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-xs font-medium">
                    Teacher
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Member Since
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
