"use client";

import * as React from "react";
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { FeatureHeader } from "@/components/feature-header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customInstance } from "@/lib/api/axios-instance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Notification {
  id: string;
  title: string;
  content: string;
  description: string | null;
  imageUrl: string | null;
  externalUrl: string | null;
  type: "urgent" | "general" | "event";
  targetAudience: "all" | "students" | "teachers";
  createdAt: string;
  createdBy: string | null;
}

interface CreateNotificationRequest {
  title: string;
  content: string;
  description?: string;
  imageUrl?: string;
  externalUrl?: string;
  type: "urgent" | "general" | "event";
  targetAudience: "all" | "students" | "teachers";
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingNotification, setEditingNotification] = React.useState<Notification | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [externalUrl, setExternalUrl] = React.useState("");
  const [type, setType] = React.useState<"urgent" | "general" | "event">("general");
  const [targetAudience, setTargetAudience] = React.useState<"all" | "students" | "teachers">("all");

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn: async () => {
      const response = await customInstance<{ data: Notification[]; total: number }>(
        "/notifications",
        { method: "GET" }
      );
      return response;
    },
  });

  // Create notification mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateNotificationRequest) => {
      return await customInstance<Notification>("/notifications", {
        method: "POST",
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setStatusMessage({ type: "success", message: "สร้างประกาศสำเร็จ!" });
      resetForm();
      setShowCreateForm(false);
      setTimeout(() => setStatusMessage(null), 3000);
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้างประกาศ";
      setStatusMessage({ 
        type: "error", 
        message: errorMessage
      });
    },
  });

  // Update notification mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateNotificationRequest> }) => {
      return await customInstance<Notification>(`/notifications/${id}`, {
        method: "PUT",
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setStatusMessage({ type: "success", message: "แก้ไขประกาศสำเร็จ!" });
      resetForm();
      setEditingNotification(null);
      setTimeout(() => setStatusMessage(null), 3000);
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการแก้ไขประกาศ";
      setStatusMessage({ 
        type: "error", 
        message: errorMessage
      });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await customInstance(`/notifications/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setStatusMessage({ type: "success", message: "ลบประกาศสำเร็จ!" });
      setTimeout(() => setStatusMessage(null), 3000);
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบประกาศ";
      setStatusMessage({ 
        type: "error", 
        message: errorMessage
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDescription("");
    setImageUrl("");
    setExternalUrl("");
    setType("general");
    setTargetAudience("all");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateNotificationRequest = { 
      title, 
      content, 
      type, 
      targetAudience 
    };
    
    // Only include description, imageUrl, and externalUrl if they have values
    if (description.trim()) {
      data.description = description;
    }
    if (imageUrl.trim()) {
      data.imageUrl = imageUrl;
    }
    if (externalUrl.trim()) {
      data.externalUrl = externalUrl;
    }

    if (editingNotification) {
      await updateMutation.mutateAsync({ id: editingNotification.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setTitle(notification.title);
    setContent(notification.content);
    setDescription(notification.description || "");
    setImageUrl(notification.imageUrl || "");
    setExternalUrl(notification.externalUrl || "");
    setType(notification.type);
    setTargetAudience(notification.targetAudience);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบประกาศนี้?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowCreateForm(false);
    setEditingNotification(null);
  };

  const notifications = notificationsData?.data || [];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "urgent": return "ด่วน";
      case "general": return "ทั่วไป";
      case "event": return "กิจกรรม";
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "urgent": return "bg-red-100 text-red-800";
      case "general": return "bg-blue-100 text-blue-800";
      case "event": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case "all": return "ทุกคน";
      case "students": return "นักเรียน";
      case "teachers": return "คุณครู";
      default: return audience;
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-gray-50">
      <FeatureHeader title="จัดการประกาศ" href="/dashboard" />

      <div className="px-4 space-y-6">
        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-purple-600 text-sm">
              <strong>💡 แดชบอร์ดผู้ดูแลระบบ:</strong> คุณสามารถสร้าง แก้ไข และลบประกาศได้ที่นี่
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-lg text-sm flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{statusMessage.message}</span>
          </div>
        )}

        {/* Create Button */}
        {!showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            สร้างประกาศใหม่
          </Button>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4">
              {editingNotification ? "แก้ไขประกาศ" : "สร้างประกาศใหม่"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">หัวข้อ</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ประกาศสำคัญ"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="content">เนื้อหา (สั้น)</Label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="ระบุรายละเอียดสั้นๆ..."
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <Label htmlFor="description">รายละเอียดเพิ่มเติม (ไม่บังคับ)</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ระบุรายละเอียดแบบเต็ม..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">URL รูปภาพ (ไม่บังคับ)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="externalUrl">ลิงก์ภายนอก (ไม่บังคับ)</Label>
                <Input
                  id="externalUrl"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com/resource"
                />
              </div>

              <div>
                <Label htmlFor="type">ประเภท</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as "urgent" | "general" | "event")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="general">ทั่วไป</option>
                  <option value="urgent">ด่วน</option>
                  <option value="event">กิจกรรม</option>
                </select>
              </div>

              <div>
                <Label htmlFor="targetAudience">กลุ่มเป้าหมาย</Label>
                <select
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as "all" | "students" | "teachers")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">ทุกคน</option>
                  <option value="students">นักเรียน</option>
                  <option value="teachers">คุณครู</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingNotification ? "บันทึกการแก้ไข" : "สร้างประกาศ"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">ประกาศทั้งหมด ({notifications.length})</h3>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">ยังไม่มีประกาศ</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(notification.type)}`}>
                        {getTypeLabel(notification.type)}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {getAudienceLabel(notification.targetAudience)}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{notification.content}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(notification)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
