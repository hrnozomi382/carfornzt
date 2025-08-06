"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, History, CheckCircle, XCircle, MinusCircle, Printer, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface InspectionHistory {
  id: number
  inspectionDate: string
  status: string
  notes: string
  inspectorName: string
  approverName: string
  approvedAt: string
  results: {
    checklistItemName: string
    result: string
    notes: string
  }[]
}

interface Tool {
  id: number
  name: string
  model: string
  serialNumber: string
}

export default function HistoryPage() {
  const params = useParams()
  const router = useRouter()
  const toolId = params.id as string
  
  const [tool, setTool] = useState<Tool | null>(null)
  const [history, setHistory] = useState<InspectionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState<InspectionHistory | null>(null)

  useEffect(() => {
    fetchData()
  }, [toolId])

  const fetchData = async () => {
    try {
      const [toolResponse, historyResponse] = await Promise.all([
        fetch(`/api/qa/tools/${toolId}`),
        fetch(`/api/qa/tools/${toolId}/history`)
      ])

      if (!toolResponse.ok || !historyResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const toolData = await toolResponse.json()
      const historyData = await historyResponse.json()

      setTool(toolData)
      setHistory(historyData)
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

  const handleDelete = async () => {
    if (!selectedInspection) return

    try {
      const response = await fetch(`/api/qa/inspections/${selectedInspection.id}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Failed to delete inspection")

      toast({
        title: "ลบสำเร็จ",
        description: "ลบประวัติการตรวจเช็คเรียบร้อยแล้ว",
      })

      setDeleteDialogOpen(false)
      setSelectedInspection(null)
      fetchData()
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบได้",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">อนุมัติแล้ว</Badge>
      case "rejected":
        return <Badge variant="destructive">ปฏิเสธ</Badge>
      case "completed":
        return <Badge variant="secondary">รอการอนุมัติ</Badge>
      default:
        return <Badge variant="outline">-</Badge>
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case "pass": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "fail": return <XCircle className="h-4 w-4 text-red-500" />
      case "na": return <MinusCircle className="h-4 w-4 text-gray-500" />
      default: return null
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
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="print:hidden">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <History className="h-6 w-6" />
              ประวัติการตรวจเช็ค
            </h1>
            {tool && (
              <p className="text-muted-foreground">
                {tool.name} - {tool.model} (S/N: {tool.serialNumber})
              </p>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setPrintDialogOpen(true)}
          className="flex items-center gap-1 print:hidden"
        >
          <Printer className="h-4 w-4" />
          ปริ้น
        </Button>
      </div>

      <div className="space-y-6">
        {history.length > 0 ? (
          (() => {
            const groupedByMonth = history.reduce((acc, inspection) => {
              const monthKey = new Date(inspection.inspectionDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })
              if (!acc[monthKey]) acc[monthKey] = []
              acc[monthKey].push(inspection)
              return acc
            }, {} as Record<string, InspectionHistory[]>)

            return Object.entries(groupedByMonth).map(([month, inspections]) => (
              <div key={month}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{month}</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedMonth(month)
                      setTimeout(() => window.print(), 100)
                    }}
                    className="print:hidden"
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    ปริ้นเดือนนี้
                  </Button>
                </div>
                <div className="space-y-4">
                  {inspections.map((inspection) => (
                    <Card key={inspection.id} className={selectedMonth === month ? 'print-month-content' : 'print:hidden'}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              การตรวจเช็ค - {new Date(inspection.inspectionDate).toLocaleDateString("th-TH")}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              ตรวจโดย: {inspection.inspectorName}
                            </p>
                            {inspection.approverName && (
                              <p className="text-sm text-muted-foreground">
                                อนุมัติโดย: {inspection.approverName} | {new Date(inspection.approvedAt).toLocaleDateString("th-TH")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(inspection.status)}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedInspection(inspection)
                                setDeleteDialogOpen(true)
                              }}
                              className="print:hidden text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {inspection.notes && (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm"><strong>หมายเหตุทั่วไป:</strong> {inspection.notes}</p>
                          </div>
                        )}

                        <div className="space-y-3">
                          <h4 className="font-medium">ผลการตรวจเช็ค:</h4>
                          {inspection.results.map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                              <div className="flex items-center gap-2">
                                {getResultIcon(result.result)}
                                <span className="text-sm">{result.checklistItemName}</span>
                              </div>
                              <div className="text-right">
                                {result.result === "pass" && <span className="text-green-600 text-sm">ผ่าน</span>}
                                {result.result === "fail" && <span className="text-red-600 text-sm">ไม่ผ่าน</span>}
                                {result.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">{result.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          })()
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">ยังไม่มีประวัติการตรวจเช็ค</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="hidden print:block mt-8 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <div>
            <p>เดือน: {selectedMonth}</p>
            <p>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</p>
          </div>
          <div className="text-right">
            <p>ลายเซ็นผู้พิมพ์: ________________________</p>
          </div>
        </div>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการตรวจเช็คนี้?
              {selectedInspection && (
                <span className="block mt-2 font-medium">
                  วันที่: {new Date(selectedInspection.inspectionDate).toLocaleDateString("th-TH")}
                </span>
              )}
              <span className="block mt-1 text-red-600">การกระทำนี้ไม่สามารถย้อนกลับได้</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}