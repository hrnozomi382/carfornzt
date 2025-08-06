"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Inspection {
  id: number
  toolName: string
  model: string
  serialNumber: string
  inspectorName: string
  inspectionDate: string
  notes: string
}

interface InspectionDetail {
  checklistItemName: string
  result: string
  notes: string
}

export default function ApprovePage() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [inspectionDetails, setInspectionDetails] = useState<InspectionDetail[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    checkUserAccess()
    fetchInspections()
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

  const fetchInspections = async () => {
    try {
      const response = await fetch("/api/qa/inspections")
      if (!response.ok) throw new Error("Failed to fetch inspections")
      
      const data = await response.json()
      setInspections(data)
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

  const fetchInspectionDetails = async (inspectionId: number) => {
    setDetailLoading(true)
    try {
      const response = await fetch(`/api/qa/inspections/${inspectionId}/details`)
      if (!response.ok) throw new Error("Failed to fetch details")
      
      const data = await response.json()
      setInspectionDetails(data)
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายละเอียดได้",
        variant: "destructive",
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const openDetailDialog = (inspection: Inspection) => {
    setSelectedInspection(inspection)
    setDetailDialogOpen(true)
    fetchInspectionDetails(inspection.id)
  }

  const handleApprove = async (inspectionId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/qa/inspections/${inspectionId}/${action}`, {
        method: "POST"
      })

      if (!response.ok) throw new Error(`Failed to ${action} inspection`)

      toast({
        title: action === 'approve' ? "อนุมัติสำเร็จ" : "ปฏิเสธสำเร็จ",
        description: `${action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}การตรวจเช็คเรียบร้อยแล้ว`,
      })

      setInspections(inspections.filter(i => i.id !== inspectionId))
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการได้",
        variant: "destructive",
      })
    }
  }

  if (!user || user.department !== "QA") {
    return (
      <div className="p-4 pt-6 max-w-5xl mx-auto">
        <div className="text-center py-10">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-muted-foreground">ระบบอนุมัติการตรวจเช็คเฉพาะแผนก QA เท่านั้น</p>
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
          <Clock className="h-6 w-6 text-primary" />
          อนุมัติการตรวจเช็ค
        </h1>
        <p className="text-muted-foreground">รายการการตรวจเช็คที่รอการอนุมัติ</p>
      </div>

      <div className="space-y-4">
        {inspections.map((inspection) => (
          <Card key={inspection.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{inspection.toolName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {inspection.model} (S/N: {inspection.serialNumber})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ตรวจโดย: {inspection.inspectorName} | {new Date(inspection.inspectionDate).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <Badge variant="secondary">รอการอนุมัติ</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {inspection.notes && (
                <div className="mb-4 p-3 bg-muted rounded-md">
                  <p className="text-sm"><strong>หมายเหตุ:</strong> {inspection.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailDialog(inspection)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  ดูรายละเอียด
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(inspection.id, 'approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  อนุมัติ
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleApprove(inspection.id, 'reject')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  ปฏิเสธ
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {inspections.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">ไม่มีการตรวจเช็คที่รอการอนุมัติ</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>รายละเอียดการตรวจเช็ค</DialogTitle>
          </DialogHeader>
          {selectedInspection && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium">{selectedInspection.toolName}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedInspection.model} (S/N: {selectedInspection.serialNumber})
                </p>
                <p className="text-sm text-muted-foreground">
                  ตรวจโดย: {selectedInspection.inspectorName} | {new Date(selectedInspection.inspectionDate).toLocaleDateString("th-TH")}
                </p>
              </div>
              
              {selectedInspection.notes && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm"><strong>หมายเหตุทั่วไป:</strong> {selectedInspection.notes}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-3">ผลการตรวจเช็ค:</h4>
                {detailLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inspectionDetails.map((detail, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-2">
                          {detail.result === "pass" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{detail.checklistItemName}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm ${
                            detail.result === "pass" ? "text-green-600" : "text-red-600"
                          }`}>
                            {detail.result === "pass" ? "ผ่าน" : "ไม่ผ่าน"}
                          </span>
                          {detail.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{detail.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}