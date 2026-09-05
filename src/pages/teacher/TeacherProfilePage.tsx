import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { teacherService, Teacher } from "@/services/api/teachers";
import { User, Settings, Shield } from "lucide-react";
import { toast } from "sonner";

interface UserSettings {
  theme: "light" | "dark";
}

export const TeacherProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Teacher | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    theme: "light",
  });

  useEffect(() => {
    loadData();
    loadSettings();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const profile = await teacherService.getMyProfile();
      setProfileData(profile);
    } catch (error) {
      console.error("Failed to load profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("teacher_settings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      // Apply theme immediately
      if (parsed.theme === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("teacher_settings", JSON.stringify(newSettings));

    // Apply theme immediately
    if (key === "theme") {
      document.documentElement.classList.toggle("dark", value === "dark");
    }
  };

  if (loading) {
    return (
      <PageContainer title="My Profile" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading profile data...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="My Profile"
      subtitle="Manage your personal information"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "security", label: "Security", icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && profileData && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Full Name
                  </label>
                  <p className="text-lg font-semibold">
                    {profileData.full_name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Login ID
                  </label>
                  <p className="text-lg font-semibold">
                    {profileData.loginid || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Employee ID
                  </label>
                  <p className="text-lg font-semibold">
                    {profileData.id || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <p className="text-lg font-semibold">TEACHER</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange("theme", e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Account Security</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Your account is protected with secure authentication.
                  </p>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Session Management</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You are currently logged in to your account.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
