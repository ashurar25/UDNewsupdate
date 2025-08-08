import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type RssSource, type InsertRssSource } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRssSourceSchema } from "@shared/schema";
import { type InsertRssSource as FormData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Settings, 
  ArrowLeft,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function Admin() {
  const [editingSource, setEditingSource] = useState<RssSource | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch RSS sources
  const { data: rssSources = [], isLoading } = useQuery<RssSource[]>({
    queryKey: ["/api/rss-sources"],
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });

  // Add RSS source form
  const addForm = useForm<FormData>({
    resolver: zodResolver(insertRssSourceSchema),
    defaultValues: {
      name: "",
      url: "",
      isActive: true,
    },
  });

  // Edit RSS source form
  const editForm = useForm<FormData>({
    resolver: zodResolver(insertRssSourceSchema),
    defaultValues: {
      name: "",
      url: "",
      isActive: true,
    },
  });

  // Add RSS source mutation
  const addSourceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/admin/rss-sources", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-sources"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "เพิ่ม RSS Source สำเร็จ",
        description: "RSS Source ใหม่ถูกเพิ่มเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่ม RSS Source ได้",
        variant: "destructive",
      });
    },
  });

  // Update RSS source mutation
  const updateSourceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RssSource> }) => {
      const response = await apiRequest("PUT", `/api/admin/rss-sources/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-sources"] });
      setIsEditDialogOpen(false);
      setEditingSource(null);
      editForm.reset();
      toast({
        title: "อัพเดท RSS Source สำเร็จ",
        description: "RSS Source ถูกอัพเดทเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัพเดท RSS Source ได้",
        variant: "destructive",
      });
    },
  });

  // Delete RSS source mutation
  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/rss-sources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-sources"] });
      toast({
        title: "ลบ RSS Source สำเร็จ",
        description: "RSS Source ถูกลบเรียบร้อยแล้ว",
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบ RSS Source ได้",
        variant: "destructive",
      });
    },
  });

  // Refresh feeds mutation
  const refreshFeedsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/refresh-feeds");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rss-sources"] });
      const successCount = data.results.filter((r: any) => r.status === "success").length;
      const errorCount = data.results.filter((r: any) => r.status === "error").length;
      
      toast({
        title: "รีเฟรช RSS Feeds สำเร็จ",
        description: `อัพเดทสำเร็จ ${successCount} แหล่ง${errorCount > 0 ? `, ล้มเหลว ${errorCount} แหล่ง` : ""}`,
      });
    },
    onError: () => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถรีเฟรช RSS Feeds ได้",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (source: RssSource) => {
    setEditingSource(source);
    editForm.reset({
      name: source.name,
      url: source.url,
      isActive: Boolean(source.isActive),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("คุณแน่ใจว่าต้องการลบ RSS Source นี้?")) {
      deleteSourceMutation.mutate(id);
    }
  };

  const onAddSubmit = (data: FormData) => {
    addSourceMutation.mutate(data);
  };

  const onEditSubmit = (data: FormData) => {
    if (editingSource) {
      updateSourceMutation.mutate({ id: editingSource.id, data });
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "online":
        return "ออนไลน์";
      case "error":
        return "มีข้อผิดพลาด";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "online":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Header */}
      <header className="bg-thai-orange shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:text-thai-yellow hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับหน้าหลัก
                </Button>
              </Link>
              <h1 className="text-white text-xl lg:text-2xl font-bold flex items-center">
                <Settings className="w-6 h-6 mr-2" />
                หน้าแอดมิน - จัดการ RSS Sources
              </h1>
            </div>
            <Button
              onClick={() => refreshFeedsMutation.mutate()}
              disabled={refreshFeedsMutation.isPending}
              className="bg-thai-yellow hover:bg-thai-yellow/90 text-gray-800"
            >
              {refreshFeedsMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  กำลังรีเฟรช...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  รีเฟรช Feeds
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Add New RSS Source Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">จัดการ RSS Sources</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-thai-yellow hover:bg-thai-yellow/90 text-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่ม RSS Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่ม RSS Source ใหม่</DialogTitle>
                <DialogDescription>
                  กรอกข้อมูล RSS Source ที่ต้องการเพิ่ม
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อ</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น Matichon" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/rss" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>เปิดใช้งาน</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={addSourceMutation.isPending}
                      className="bg-thai-orange hover:bg-thai-orange/90"
                    >
                      {addSourceMutation.isPending ? "กำลังเพิ่ม..." : "เพิ่ม"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* RSS Sources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rssSources.map((source) => (
              <Card key={source.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(source.status)}
                      <span className={`text-sm ${getStatusColor(source.status)}`}>
                        {getStatusText(source.status)}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    <span className="truncate">{source.url}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">สถานะ:</span>
                      <Switch 
                        checked={Boolean(source.isActive)}
                        onCheckedChange={(checked) => {
                          updateSourceMutation.mutate({ 
                            id: source.id, 
                            data: { isActive: checked } 
                          });
                        }}
                      />
                      <span className="text-sm text-gray-600">
                        {source.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </div>
                  </div>
                  
                  {source.lastFetched && (
                    <p className="text-xs text-gray-500 mb-4">
                      อัพเดทล่าสุด: {new Date(source.lastFetched).toLocaleString('th-TH')}
                    </p>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(source)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      แก้ไข
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(source.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && rssSources.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">ยังไม่มี RSS Sources</h3>
            <p className="text-gray-500 mb-4">เริ่มต้นโดยการเพิ่ม RSS Source แรกของคุณ</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-thai-yellow hover:bg-thai-yellow/90 text-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              เพิ่ม RSS Source
            </Button>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไข RSS Source</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูล RSS Source
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อ</FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น Matichon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/rss" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>เปิดใช้งาน</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateSourceMutation.isPending}
                  className="bg-thai-orange hover:bg-thai-orange/90"
                >
                  {updateSourceMutation.isPending ? "กำลังอัพเดท..." : "อัพเดท"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}