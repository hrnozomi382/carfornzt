"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Car, User, Calendar, FileText, Wrench, Gauge, Printer } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface DamageReport {
  id: number
  bookingId: number
  carId: number
  userId: number
  carCondition: string
  notes: string
  reportDate: string
  status: string
  carName: string
  carLicensePlate: string
  userName: string
  userDepartment: string
  startMileage: number
  endMileage: number
}

export default function DamageReports() {
  const [reports, setReports] = useState<DamageReport[]>([])
  const [history, setHistory] = useState<DamageReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDamageReports()
  }, [])

  const fetchDamageReports = async () => {
    try {
      const [reportsRes, historyRes] = await Promise.all([
        fetch("/api/damage-reports"),
        fetch("/api/damage-reports?type=history")
      ])
      
      if (!reportsRes.ok || !historyRes.ok) throw new Error("Failed to fetch reports")
      
      const reportsData = await reportsRes.json()
      const historyData = await historyRes.json()
      
      setReports(reportsData)
      setHistory(historyData)
    } catch (error) {
      console.error("Error fetching damage reports:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRepaired = async (reportId: number) => {
    try {
      const response = await fetch(`/api/damage-reports/${reportId}/repair`, {
        method: "POST"
      })
      if (!response.ok) throw new Error("Failed to mark as repaired")
      
      const repairedReport = reports.find(report => report.id === reportId)
      if (repairedReport) {
        const updatedReport = { ...repairedReport, status: "แจ้งซ่อมแล้ว" }
        setReports(reports.filter(report => report.id !== reportId))
        setHistory([updatedReport, ...history])
      }
      
      toast({
        title: "บันทึกสำเร็จ",
        description: "ทำการแจ้งซ่อมเรียบร้อยแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกได้",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatNotes = (notes: string) => {
    if (notes.includes('--- ข้อมูลจาก User ---')) {
      const parts = notes.split('--- ข้อมูลจาก User ---')
      const userInfo = parts[1]?.trim()
      
      if (userInfo) {
        return (
          <div className="space-y-2">
            <div className="font-medium text-orange-800 border-b border-orange-300 pb-1">
              ข้อมูลจากผู้ใช้
            </div>
            <div className="pl-2 whitespace-pre-line">
              {userInfo.replace(/\s+/g, ' ')}
            </div>
          </div>
        )
      }
    }
    
    return (
      <div className="whitespace-pre-line">
        {notes.replace(/\s*-\s*/g, '\n')}
      </div>
    )
  }

  const printReport = (report: DamageReport) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>ใบรายงานการแจ้งชำรุด</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Sarabun', Arial, sans-serif; font-size: 12px; margin: 0; line-height: 1.3; }
          @media print { body { margin: 0; -webkit-print-color-adjust: exact; } }
          .header { text-align: center; margin-bottom: 15px; }
          .header h1 { font-size: 16px; margin: 0 0 5px 0; }
          .header p { font-size: 11px; margin: 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; }
          .field { margin-bottom: 8px; }
          .label { font-weight: bold; font-size: 11px; margin-bottom: 2px; }
          .value { border-bottom: 1px solid #000; min-height: 18px; padding: 2px 0; font-size: 11px; }
          .notes-section { margin: 10px 0; }
          .signature-section { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px; }
          .signature { text-align: center; font-size: 10px; }
          .signature-line { border-bottom: 1px solid #000; margin-bottom: 5px; height: 30px; }
          .compact-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ใบรายงานการแจ้งชำรุด</h1>
        </div>
        
        <div class="info-grid">
          <div>
            <div class="field">
              <div class="label">ชื่อรถ:</div>
              <div class="value">${report.carName}</div>
            </div>
            <div class="field">
              <div class="label">ทะเบียนรถ:</div>
              <div class="value">${report.carLicensePlate}</div>
            </div>
            <div class="field">
              <div class="label">ผู้แจ้ง:</div>
              <div class="value">${report.userName} (${report.userDepartment})</div>
            </div>
            <div class="field">
              <div class="label">วันที่แจ้ง:</div>
              <div class="value">${formatDate(report.reportDate)}</div>
            </div>
          </div>
          <div>
            <div class="field">
              <div class="label">เลขไมล์เริ่มต้น:</div>
              <div class="value">${report.startMileage?.toLocaleString() || 'N/A'} กม.</div>
            </div>
            <div class="field">
              <div class="label">เลขไมล์สิ้นสุด:</div>
              <div class="value">${report.endMileage?.toLocaleString() || 'N/A'} กม.</div>
            </div>
            <div class="field">
              <div class="label">สถานะ:</div>
              <div class="value">${report.status}</div>
            </div>
          </div>
        </div>
        
        <div class="notes-section">
          <div class="field">
            <div class="label">รายละเอียดปัญหา:</div>
            <div class="value" style="min-height: 40px; white-space: pre-line; font-size: 10px;">${report.notes.replace(/--- ข้อมูลจาก User ---/g, '\n--- ข้อมูลจาก User ---\n')}</div>
          </div>
        </div>
        
        <div class="field">
          <div class="label">วิธีแก้ปัญหา:</div>
          <div class="value" style="min-height: 40px;"></div>
        </div>
        
        <div class="compact-grid">
          <div class="field">
            <div class="label">เข้าซ่อมวันที่:</div>
            <div class="value"></div>
          </div>
          <div class="field">
            <div class="label">แล้วเสร็จวันที่:</div>
            <div class="value"></div>
          </div>
          <div class="field">
            <div class="label">ค่าใช้จ่าย:</div>
            <div class="value"></div>
          </div>
        </div>
        
        <div class="field">
          <div class="label">หมายเหตุ:</div>
          <div class="value" style="min-height: 30px;"></div>
        </div>
        
        <div class="signature-section">
          <div class="signature">
            <div class="signature-line"></div>
            <div>ผู้แจ้ง</div>
            <div>วันที่: _______________</div>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div>ผู้ตรวจเช็ค</div>
            <div>วันที่: _______________</div>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div>ผู้อนุมัติ</div>
            <div>วันที่: _______________</div>
          </div>
        </div>
        
        <div style="text-align: right; margin-top: 20px; font-size: 10px;">
          เอกสารหมายเลข: QF-DL-005
        </div>
      </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const renderReportCard = (report: DamageReport, showRepairButton = true) => (
    <Card key={report.id} className="border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Car className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{report.carName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                ทะเบียน: {report.carLicensePlate}
              </p>
            </div>
          </div>
          <Badge 
            variant={report.status === "รอดำเนินการ" ? "destructive" : "default"}
          >
            {report.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{report.userName}</p>
              <p className="text-sm text-muted-foreground">{report.userDepartment}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{formatDate(report.reportDate)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">เลขไมล์</p>
              <p className="text-sm text-muted-foreground">
                {report.startMileage?.toLocaleString() || 'N/A'} - {report.endMileage?.toLocaleString() || 'N/A'} กม.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800">รายละเอียดปัญหา:</p>
              <div className="text-sm text-orange-700 mt-1">
                {formatNotes(report.notes)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            onClick={() => printReport(report)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            พิมพ์ใบรายงาน
          </Button>
          {showRepairButton && report.status === "รอดำเนินการ" && (
            <Button 
              onClick={() => markAsRepaired(report.id)}
              className="flex items-center gap-2"
            >
              <Wrench className="h-4 w-4" />
              แจ้งซ่อม
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

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
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          รายการที่แจ้งชำรุด
        </h1>
        <p className="text-muted-foreground">รายการรถที่ผู้ใช้แจ้งว่ามีปัญหาหรือชำรุด</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">รอดำเนินการ ({reports.length})</TabsTrigger>
          <TabsTrigger value="history">ประวัติการแจ้ง ({history.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4 mt-6">
          {reports.length > 0 ? (
            reports.map((report) => renderReportCard(report, true))
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">ไม่มีรายการแจ้งชำรุดในขณะนี้</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 mt-6">
          {history.length > 0 ? (
            history.map((report) => renderReportCard(report, false))
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">ไม่มีประวัติการแจ้ง</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}