"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, CheckCircle, XCircle, Edit, Save, X, Plus, Trash2, Printer } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ChecklistItem {
  id: number
  name: string
  description: string
  isRequired: boolean
}

interface Tool {
  id: number
  name: string
  model: string
  serialNumber: string
  location: string
}

export default function InspectPage() {
  const params = useParams()
  const router = useRouter()
  const toolId = params.id as string
  
  const [tool, setTool] = useState<Tool | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [results, setResults] = useState<Record<number, string>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [generalNotes, setGeneralNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "" })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemForm, setNewItemForm] = useState({ name: "", description: "" })

  useEffect(() => {
    fetchData()
  }, [toolId])

  const fetchData = async () => {
    try {
      const toolResponse = await fetch(`/api/qa/tools/${toolId}`)
      if (!toolResponse.ok) throw new Error("Failed to fetch tool")
      
      const toolData = await toolResponse.json()
      
      const checklistResponse = await fetch(`/api/qa/checklist?toolType=${encodeURIComponent(toolData.name)}`)

      if (!toolResponse.ok || !checklistResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      if (!checklistResponse.ok) throw new Error("Failed to fetch checklist")
      
      const checklistData = await checklistResponse.json()

      setTool(toolData)
      setChecklist(checklistData)
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

  const handleResultChange = (itemId: number, result: string) => {
    setResults(prev => ({ ...prev, [itemId]: result }))
  }

  const handleNotesChange = (itemId: number, note: string) => {
    setNotes(prev => ({ ...prev, [itemId]: note }))
  }

  const handleSubmit = async () => {
    // ตรวจสอบว่าตอบครบทุกข้อที่จำเป็น
    const requiredItems = checklist.filter(item => item.isRequired)
    const missingResults = requiredItems.filter(item => !results[item.id])
    
    if (missingResults.length > 0) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาตอบคำถามที่จำเป็นให้ครบถ้วน",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/qa/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: parseInt(toolId),
          results,
          notes,
          generalNotes
        })
      })

      if (!response.ok) throw new Error("Failed to submit inspection")

      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกการตรวจเช็คเรียบร้อยแล้ว",
      })

      router.push("/user/qa-inspection")
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกได้",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case "pass": return <CheckCircle className="h-5 w-5 text-green-500" />
      case "fail": return <XCircle className="h-5 w-5 text-red-500" />
      default: return null
    }
  }

  const startEdit = (item: ChecklistItem) => {
    setEditingItem(item.id)
    setEditForm({ name: item.name, description: item.description })
  }

  const saveEdit = async () => {
    if (!editingItem) return
    
    try {
      const response = await fetch(`/api/qa/checklist/${editingItem}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          toolType: tool?.name,
          sortOrder: checklist.find(c => c.id === editingItem)?.sortOrder || 1,
          isRequired: checklist.find(c => c.id === editingItem)?.isRequired || true
        })
      })

      if (!response.ok) throw new Error("Failed to update")

      setChecklist(checklist.map(item => 
        item.id === editingItem 
          ? { ...item, name: editForm.name, description: editForm.description }
          : item
      ))
      setEditingItem(null)
      
      toast({
        title: "แก้ไขสำเร็จ",
        description: "แก้ไขหัวข้อตรวจเช็คเรียบร้อยแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขได้",
        variant: "destructive",
      })
    }
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditForm({ name: "", description: "" })
  }

  const addNewItem = async () => {
    if (!tool || !newItemForm.name.trim()) return
    
    try {
      const response = await fetch("/api/qa/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItemForm,
          toolType: tool.name,
          sortOrder: checklist.length + 1,
          isRequired: true
        })
      })

      if (!response.ok) throw new Error("Failed to add")

      // Refresh checklist
      const checklistResponse = await fetch(`/api/qa/checklist?toolType=${encodeURIComponent(tool.name)}`)
      if (checklistResponse.ok) {
        const checklistData = await checklistResponse.json()
        setChecklist(checklistData)
      }
      
      setShowAddForm(false)
      setNewItemForm({ name: "", description: "" })
      
      toast({
        title: "เพิ่มสำเร็จ",
        description: "เพิ่มหัวข้อตรวจเช็คเรียบร้อยแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มได้",
        variant: "destructive",
      })
    }
  }

  const deleteItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/qa/checklist/${itemId}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Failed to delete")

      setChecklist(checklist.filter(item => item.id !== itemId))
      
      toast({
        title: "ลบสำเร็จ",
        description: "ลบหัวข้อตรวจเช็คเรียบร้อยแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบได้",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-4 pt-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pt-6 max-w-4xl mx-auto">
      <Toaster />
      
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="print:hidden">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">ตรวจเช็คเครื่องมือ</h1>
            {tool && (
              <p className="text-muted-foreground">
                {tool.name} - {tool.model} (S/N: {tool.serialNumber})
              </p>
            )}
          </div>
        </div>

      <div className="space-y-6">
        <div className="flex justify-end print:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            เพิ่มหัวข้อ
          </Button>
        </div>

        {showAddForm && (
          <Card className="border-dashed">
            <CardHeader>
              <div className="space-y-3">
                <Input
                  placeholder="ชื่อหัวข้อตรวจเช็ค"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({...newItemForm, name: e.target.value})}
                />
                <Textarea
                  placeholder="รายละเอียด"
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({...newItemForm, description: e.target.value})}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addNewItem}>
                    <Save className="h-4 w-4 mr-1" />
                    บันทึก
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setShowAddForm(false)
                      setNewItemForm({ name: "", description: "" })
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {checklist.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editingItem === item.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="h-4 w-4 mr-1" />
                          บันทึก
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="flex items-center gap-2">
                        {getResultIcon(results[item.id])}
                        {item.name}
                        {item.isRequired && <span className="text-red-500">*</span>}
                      </CardTitle>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </>
                  )}
                </div>
                {editingItem !== item.id && (
                  <div className="flex gap-1 print:hidden">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => startEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 print:hidden">
                <Button
                  variant={results[item.id] === "pass" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleResultChange(item.id, "pass")}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  ผ่าน
                </Button>
                <Button
                  variant={results[item.id] === "fail" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleResultChange(item.id, "fail")}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  ไม่ผ่าน
                </Button>
              </div>
              <div className="hidden print:block">
                <p className="text-sm font-medium">
                  ผลการตรวจ: 
                  {results[item.id] === "pass" && <span className="text-green-600">✓ ผ่าน</span>}
                  {results[item.id] === "fail" && <span className="text-red-600">✗ ไม่ผ่าน</span>}
                  {!results[item.id] && <span className="text-gray-500">ยังไม่ได้ตรวจ</span>}
                </p>
              </div>

              <div>
                <Label htmlFor={`notes-${item.id}`}>หมายเหตุ</Label>
                <Textarea
                  id={`notes-${item.id}`}
                  placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                  value={notes[item.id] || ""}
                  onChange={(e) => handleNotesChange(item.id, e.target.value)}
                  rows={2}
                  className="print:border-none print:p-0 print:resize-none"
                />
                <div className="hidden print:block text-sm mt-1">
                  {notes[item.id] || "ไม่มีหมายเหตุ"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>หมายเหตุทั่วไป</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="หมายเหตุเพิ่มเติมเกี่ยวกับการตรวจเช็คครั้งนี้"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              rows={3}
              className="print:border-none print:p-0 print:resize-none"
            />
            <div className="hidden print:block text-sm mt-1">
              {generalNotes || "ไม่มีหมายเหตุทั่วไป"}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end print:hidden">
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4" />
            ปริ้น
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "กำลังบันทึก..." : "บันทึกการตรวจเช็ค"}
          </Button>
        </div>
        
        <div className="hidden print:block mt-8 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <div>
              <p>วันที่ตรวจเช็ค: {new Date().toLocaleDateString('th-TH')}</p>
            </div>
            <div className="text-right">
              <p>ลายเซ็นผู้ตรวจ: ________________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}