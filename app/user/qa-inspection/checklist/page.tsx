"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ClipboardList, Plus, Edit, Trash2, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
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

interface ChecklistItem {
  id: number
  name: string
  description: string
  toolType: string
  sortOrder: number
  isRequired: boolean
}

export default function ChecklistManagePage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedToolType, setSelectedToolType] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    toolType: "",
    sortOrder: 1,
    isRequired: true
  })

  const toolTypes = [
    "Leather Softness", "Thickness", "Steel Ruler", "vernier caliper", 
    "vernier caliper digital", "Digital Balance", "Pin Gage", "Taper Gage"
  ]

  useEffect(() => {
    fetchChecklist()
  }, [])

  const fetchChecklist = async () => {
    try {
      const response = await fetch("/api/qa/checklist")
      if (!response.ok) throw new Error("Failed to fetch checklist")
      
      const data = await response.json()
      setChecklist(data)
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      toolType: "",
      sortOrder: 1,
      isRequired: true
    })
  }

  const openAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (item: ChecklistItem) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      toolType: item.toolType,
      sortOrder: item.sortOrder,
      isRequired: item.isRequired
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (item: ChecklistItem) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const handleAdd = async () => {
    try {
      const response = await fetch("/api/qa/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to add checklist item")

      toast({
        title: "เพิ่มสำเร็จ",
        description: "เพิ่มรายการตรวจเช็คเรียบร้อยแล้ว",
      })

      setIsAddDialogOpen(false)
      fetchChecklist()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มได้",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!selectedItem) return

    try {
      const response = await fetch(`/api/qa/checklist/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to update checklist item")

      toast({
        title: "แก้ไขสำเร็จ",
        description: "แก้ไขรายการตรวจเช็คเรียบร้อยแล้ว",
      })

      setIsEditDialogOpen(false)
      fetchChecklist()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขได้",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return

    try {
      const response = await fetch(`/api/qa/checklist/${selectedItem.id}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Failed to delete checklist item")

      toast({
        title: "ลบสำเร็จ",
        description: "ลบรายการตรวจเช็คเรียบร้อยแล้ว",
      })

      setIsDeleteDialogOpen(false)
      fetchChecklist()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบได้",
        variant: "destructive",
      })
    }
  }

  const filteredChecklist = checklist.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesToolType = !selectedToolType || item.toolType === selectedToolType
    return matchesSearch && matchesToolType
  })

  const groupedChecklist = filteredChecklist.reduce((acc, item) => {
    if (!acc[item.toolType]) acc[item.toolType] = []
    acc[item.toolType].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

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
          <ClipboardList className="h-6 w-6 text-primary" />
          จัดการหัวข้อการตรวจเช็ค
        </h1>
        <p className="text-muted-foreground">เพิ่ม แก้ไข หรือลบหัวข้อการตรวจเช็คเครื่องมือ</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาหัวข้อการตรวจเช็ค..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedToolType}
          onChange={(e) => setSelectedToolType(e.target.value)}
        >
          <option value="">ทุกประเภทเครื่องมือ</option>
          {toolTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1" />
          เพิ่มหัวข้อ
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedChecklist).map(([toolType, items]) => (
          <Card key={toolType}>
            <CardHeader>
              <CardTitle>{toolType}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {item.isRequired && <span className="text-red-500 text-sm">*</span>}
                        <span className="text-xs bg-muted px-2 py-1 rounded">#{item.sortOrder}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มหัวข้อการตรวจเช็ค</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="toolType">ประเภทเครื่องมือ</Label>
              <select
                id="toolType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.toolType}
                onChange={(e) => setFormData({...formData, toolType: e.target.value})}
              >
                <option value="">เลือกประเภทเครื่องมือ</option>
                {toolTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="name">หัวข้อการตรวจเช็ค</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="sortOrder">ลำดับ</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRequired"
                checked={formData.isRequired}
                onChange={(e) => setFormData({...formData, isRequired: e.target.checked})}
              />
              <Label htmlFor="isRequired">จำเป็นต้องตรวจ</Label>
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
            <DialogTitle>แก้ไขหัวข้อการตรวจเช็ค</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-toolType">ประเภทเครื่องมือ</Label>
              <select
                id="edit-toolType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.toolType}
                onChange={(e) => setFormData({...formData, toolType: e.target.value})}
              >
                <option value="">เลือกประเภทเครื่องมือ</option>
                {toolTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-name">หัวข้อการตรวจเช็ค</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">รายละเอียด</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-sortOrder">ลำดับ</Label>
              <Input
                id="edit-sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isRequired"
                checked={formData.isRequired}
                onChange={(e) => setFormData({...formData, isRequired: e.target.checked})}
              />
              <Label htmlFor="edit-isRequired">จำเป็นต้องตรวจ</Label>
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
              คุณแน่ใจหรือไม่ว่าต้องการลบหัวข้อการตรวจเช็ค "{selectedItem?.name}"?
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