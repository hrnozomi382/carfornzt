"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"

interface MeasuringTool {
  id: number
  name: string
  model: string
  serialNumber: string
  location: string
  status: string
  lastCalibration: string
  nextCalibration: string
  lastInspection?: string
  inspectionStatus?: string
}

export default function QAInspectionPage() {
  const [tools, setTools] = useState<MeasuringTool[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [user, setUser] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<MeasuringTool | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    serialNumber: "",
    location: "",
    status: "active",
    lastCalibration: "",
    nextCalibration: ""
  })
  
  const toolTypes = [
    "Leather Softness", "Thickness", "Steel Ruler", "vernier caliper", 
    "vernier caliper digital", "Digital Balance", "Pin Gage", "Taper Gage"
  ]

  useEffect(() => {
    checkUserAccess()
    fetchTools()
  }, [])

  const checkUserAccess = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (!response.ok) throw new Error("Unauthorized")
      
      const userData = await response.json()
      if (userData.department !== "QA") {
        toast({
          title: "ไม่มีสิทธิ์เข้าถึง",
          description: "ระบบนี้เฉพาะแผนก QA เท่านั้น",
          variant: "destructive",
        })
        return
      }
      setUser(userData)
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตรวจสอบสิทธิ์ได้",
        variant: "destructive",
      })
    }
  }

  const fetchTools = async () => {
    try {
      const response = await fetch("/api/qa/tools")
      if (!response.ok) throw new Error("Failed to fetch tools")
      
      const data = await response.json()
      setTools(data)
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลเครื่องมือได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default"
      case "maintenance": return "destructive"
      case "inactive": return "secondary"
      default: return "outline"
    }
  }

  const getInspectionStatusColor = (status?: string) => {
    switch (status) {
      case "approved": return "default"
      case "completed": return "secondary"
      case "pending": return "outline"
      default: return "outline"
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      model: "",
      serialNumber: "",
      location: "",
      status: "active",
      lastCalibration: "",
      nextCalibration: ""
    })
  }

  const openAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (tool: MeasuringTool) => {
    setSelectedTool(tool)
    setFormData({
      name: tool.name,
      model: tool.model,
      serialNumber: tool.serialNumber,
      location: tool.location,
      status: tool.status,
      lastCalibration: tool.lastCalibration.split('T')[0],
      nextCalibration: tool.nextCalibration.split('T')[0]
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (tool: MeasuringTool) => {
    setSelectedTool(tool)
    setIsDeleteDialogOpen(true)
  }

  const handleAdd = async () => {
    try {
      const response = await fetch("/api/qa/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to add tool")

      toast({
        title: "เพิ่มสำเร็จ",
        description: "เพิ่มเครื่องมือเรียบร้อยแล้ว",
      })

      setIsAddDialogOpen(false)
      fetchTools()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มได้",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!selectedTool) return

    try {
      const response = await fetch(`/api/qa/tools/${selectedTool.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to update tool")

      toast({
        title: "แก้ไขสำเร็จ",
        description: "แก้ไขข้อมูลเรียบร้อยแล้ว",
      })

      setIsEditDialogOpen(false)
      fetchTools()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขได้",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedTool) return

    try {
      const response = await fetch(`/api/qa/tools/${selectedTool.id}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Failed to delete tool")

      toast({
        title: "ลบสำเร็จ",
        description: "ลบเครื่องมือเรียบร้อยแล้ว",
      })

      setIsDeleteDialogOpen(false)
      fetchTools()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบได้",
        variant: "destructive",
      })
    }
  }

  if (!user || user.department !== "QA") {
    return (
      <div className="p-4 pt-6 max-w-5xl mx-auto">
        <div className="text-center py-10">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-muted-foreground">ระบบตรวจเช็คเครื่องมือตรวจวัดเฉพาะแผนก QA เท่านั้น</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 pt-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pt-6 max-w-5xl mx-auto">
      <Toaster />
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          ตรวจเช็คเครื่องมือตรวจวัด
        </h1>
        <p className="text-muted-foreground">ระบบตรวจเช็คเครื่องมือตรวจวัดสำหรับแผนก QA</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาเครื่องมือ..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1" />
          เพิ่มเครื่องมือ
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{tool.model}</p>
                  <p className="text-xs text-muted-foreground">S/N: {tool.serialNumber}</p>
                </div>
                <Badge variant={getStatusColor(tool.status)}>
                  {tool.status === "active" ? "ใช้งานได้" : 
                   tool.status === "maintenance" ? "ซ่อมบำรุง" : "ไม่ใช้งาน"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p><span className="font-medium">ตำแหน่ง:</span> {tool.location}</p>
                <p><span className="font-medium">Calibration ครั้งล่าสุด:</span> {new Date(tool.lastCalibration).toLocaleDateString("th-TH")}</p>
                <p><span className="font-medium">Calibration ครั้งถัดไป:</span> {new Date(tool.nextCalibration).toLocaleDateString("th-TH")}</p>
              </div>

              {tool.lastInspection && (
                <div className="p-2 bg-muted rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">ตรวจเช็คล่าสุด:</span>
                    <Badge variant={getInspectionStatusColor(tool.inspectionStatus)} className="text-xs">
                      {tool.inspectionStatus === "approved" ? "อนุมัติแล้ว" :
                       tool.inspectionStatus === "completed" ? "รอการอนุมัติ" : "รอตรวจเช็ค"}
                    </Badge>
                  </div>
                  <p className="text-xs mt-1">{new Date(tool.lastInspection).toLocaleDateString("th-TH")}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Link href={`/user/qa-inspection/${tool.id}/inspect`} className="flex-1">
                    <Button className="w-full" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      ตรวจเช็ค
                    </Button>
                  </Link>
                  <Link href={`/user/qa-inspection/${tool.id}/history`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditDialog(tool)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openDeleteDialog(tool)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    ลบ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">ไม่พบเครื่องมือตรวจวัด</p>
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มเครื่องมือใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">ชื่อเครื่องมือ</Label>
              <select
                id="name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              >
                <option value="">เลือกชนิดเครื่องมือ</option>
                {toolTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="model">รุ่น</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="location">ตำแหน่ง</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="lastCalibration">Calibration ครั้งล่าสุด</Label>
              <Input
                id="lastCalibration"
                type="date"
                value={formData.lastCalibration}
                onChange={(e) => setFormData({...formData, lastCalibration: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="nextCalibration">Calibration ครั้งถัดไป</Label>
              <Input
                id="nextCalibration"
                type="date"
                value={formData.nextCalibration}
                onChange={(e) => setFormData({...formData, nextCalibration: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleAdd}>เพิ่ม</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลเครื่องมือ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">ชื่อเครื่องมือ</Label>
              <select
                id="edit-name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              >
                <option value="">เลือกชนิดเครื่องมือ</option>
                {toolTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-model">รุ่น</Label>
              <Input
                id="edit-model"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-serialNumber">Serial Number</Label>
              <Input
                id="edit-serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">ตำแหน่ง</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">สถานะ</Label>
              <select
                id="edit-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">ใช้งานได้</option>
                <option value="maintenance">ซ่อมบำรุง</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-lastCalibration">Calibration ครั้งล่าสุด</Label>
              <Input
                id="edit-lastCalibration"
                type="date"
                value={formData.lastCalibration}
                onChange={(e) => setFormData({...formData, lastCalibration: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-nextCalibration">Calibration ครั้งถัดไป</Label>
              <Input
                id="edit-nextCalibration"
                type="date"
                value={formData.nextCalibration}
                onChange={(e) => setFormData({...formData, nextCalibration: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleEdit}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบเครื่องมือ "{selectedTool?.name}"?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}