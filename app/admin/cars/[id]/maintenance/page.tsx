"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, Wrench, Plus, AlertTriangle, CheckCircle, Settings, Save, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Car {
  id: number
  name: string
  licensePlate: string
  currentMileage: number
}

interface MaintenanceItem {
  id: string
  name: string
  category: string
  intervalKm: number
  intervalMonths: number
  priority: "high" | "medium" | "low"
}

interface MaintenanceRecord {
  id: number
  serviceDate: string
  serviceType: string
  description: string
  cost: number
  mileage: number
}

const defaultMaintenanceItems: MaintenanceItem[] = [
  { id: "oil", name: "เปลี่ยนน้ำมันเครื่อง", category: "น้ำมันและของเหลว", intervalKm: 5000, intervalMonths: 6, priority: "high" },
  { id: "coolant", name: "ตรวจน้ำหล่อเย็น", category: "น้ำมันและของเหลว", intervalKm: 10000, intervalMonths: 12, priority: "medium" },
  { id: "brake_fluid", name: "ตรวจน้ำมันเบรก", category: "น้ำมันและของเหลว", intervalKm: 20000, intervalMonths: 24, priority: "high" },
  { id: "air_filter", name: "เปลี่ยนกรองอากาศ", category: "ระบบเครื่องยนต์", intervalKm: 10000, intervalMonths: 12, priority: "medium" },
  { id: "spark_plugs", name: "เปลี่ยนหัวเทียน", category: "ระบบเครื่องยนต์", intervalKm: 30000, intervalMonths: 36, priority: "medium" },
  { id: "brake_pads", name: "ตรวจผ้าเบรก", category: "ระบบเบรก", intervalKm: 15000, intervalMonths: 12, priority: "high" },
  { id: "tire_rotation", name: "หมุนยาง", category: "ยางและล้อ", intervalKm: 8000, intervalMonths: 6, priority: "medium" },
  { id: "tire_pressure", name: "ตรวจลมยาง", category: "ยางและล้อ", intervalKm: 1000, intervalMonths: 1, priority: "high" },
  { id: "battery", name: "ตรวจแบตเตอรี่", category: "ระบบไฟฟ้า", intervalKm: 15000, intervalMonths: 12, priority: "medium" },
  { id: "ac_filter", name: "เปลี่ยนกรองแอร์", category: "อื่นๆ", intervalKm: 15000, intervalMonths: 12, priority: "low" }
]

export default function CarMaintenancePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showEditStandards, setShowEditStandards] = useState(false)
  const [showQuickForm, setShowQuickForm] = useState(false)
  const [quickSelectedItem, setQuickSelectedItem] = useState<MaintenanceItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [editingStandards, setEditingStandards] = useState(defaultMaintenanceItems)
  const [formData, setFormData] = useState({
    serviceDate: "",
    cost: "",
    description: ""
  })

  useEffect(() => {
    fetchCarData()
    fetchRecords()
    loadCustomStandards()
  }, [params.id])

  const loadCustomStandards = () => {
    const saved = localStorage.getItem('maintenanceStandards')
    if (saved) {
      setEditingStandards(JSON.parse(saved))
    } else {
      setEditingStandards(defaultMaintenanceItems)
    }
  }

  const saveStandards = () => {
    localStorage.setItem('maintenanceStandards', JSON.stringify(editingStandards))
    setShowEditStandards(false)
    toast({
      title: "บันทึกสำเร็จ",
      description: "บันทึกมาตรฐานการซ่อมบำรุงแล้ว"
    })
  }

  const updateStandard = (id: string, field: keyof MaintenanceItem, value: any) => {
    setEditingStandards(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const fetchCarData = async () => {
    try {
      const response = await fetch(`/api/cars/${params.id}`)
      const data = await response.json()
      setCar(data)
    } catch (error) {
      console.error("Error fetching car:", error)
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/maintenance`)
      const data = await response.json()
      setRecords(data.filter((record: any) => record.carId === parseInt(params.id)))
    } catch (error) {
      console.error("Error fetching maintenance records:", error)
    }
  }

  const getMaintenanceStatus = (item: MaintenanceItem) => {
    if (!car) return "unknown"
    
    const lastRecord = records
      .filter(r => r.serviceType.includes(item.name))
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())[0]
    
    if (!lastRecord) return "overdue"
    
    const daysSinceService = Math.floor((Date.now() - new Date(lastRecord.serviceDate).getTime()) / (1000 * 60 * 60 * 24))
    const kmSinceService = car.currentMileage - lastRecord.mileage
    
    const monthsOverdue = daysSinceService > (item.intervalMonths * 30)
    const kmOverdue = kmSinceService > item.intervalKm
    
    if (monthsOverdue || kmOverdue) return "overdue"
    
    const monthsNearDue = daysSinceService > (item.intervalMonths * 30 * 0.8)
    const kmNearDue = kmSinceService > (item.intervalKm * 0.8)
    
    if (monthsNearDue || kmNearDue) return "due_soon"
    
    return "ok"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItems.length || !formData.serviceDate) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาเลือกรายการซ่อมบำรุงและระบุวันที่",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const serviceType = selectedItems.map(id => 
        editingStandards.find(item => item.id === id)?.name
      ).join(", ")

      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: params.id,
          serviceType,
          serviceDate: formData.serviceDate,
          description: formData.description,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          mileage: car?.currentMileage
        })
      })

      if (response.ok) {
        toast({
          title: "บันทึกสำเร็จ",
          description: "บันทึกการซ่อมบำรุงเรียบร้อยแล้ว"
        })
        setFormData({ serviceDate: "", cost: "", description: "" })
        setSelectedItems([])
        setShowForm(false)
        fetchRecords()
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "due_soon": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "overdue": return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok": return <Badge className="bg-green-100 text-green-800">ปกติ</Badge>
      case "due_soon": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">ใกล้ครบกำหนด</Badge>
      case "overdue": return <Badge variant="destructive">เกินกำหนด</Badge>
      default: return <Badge variant="outline">ไม่ทราบ</Badge>
    }
  }

  if (!car) return <div>Loading...</div>

  return (
    <div className="p-4">
      <Toaster />
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/cars/${car.id}`)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            การซ่อมบำรุง - {car.name}
          </h1>
          <p className="text-sm text-muted-foreground">ทะเบียน: {car.licensePlate} | เลขไมล์: {car.currentMileage.toLocaleString()} กม.</p>
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <Button onClick={() => setShowForm(!showForm)} className="rounded-full h-12 w-12 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
        <Button variant="outline" onClick={() => setShowEditStandards(!showEditStandards)} className="rounded-full h-12 w-12 shadow-lg">
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      <div className="space-y-4">
        {showEditStandards && (
          <Card>
            <CardHeader>
              <CardTitle>แก้ไขมาตรฐาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {editingStandards.map((item) => (
                  <div key={item.id} className="p-3 border rounded space-y-2">
                    <Input
                      value={item.name}
                      onChange={(e) => updateStandard(item.id, 'name', e.target.value)}
                      placeholder="ชื่อรายการ"
                      className="text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        value={item.intervalKm}
                        onChange={(e) => updateStandard(item.id, 'intervalKm', parseInt(e.target.value) || 0)}
                        placeholder="กม."
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        value={item.intervalMonths}
                        onChange={(e) => updateStandard(item.id, 'intervalMonths', parseInt(e.target.value) || 0)}
                        placeholder="เดือน"
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={saveStandards} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  บันทึก
                </Button>
                <Button variant="outline" onClick={() => setShowEditStandards(false)} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  ยกเลิก
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>บันทึกการซ่อมบำรุง</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>เลือกรายการที่ทำ *</Label>
                  <div className="space-y-2 mt-2 max-h-32 overflow-y-auto border rounded p-2">
                    {editingStandards.map(item => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={item.id}
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItems([...selectedItems, item.id])
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item.id))
                            }
                          }}
                        />
                        <Label htmlFor={item.id} className="text-sm">{item.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>วันที่ซ่อม *</Label>
                  <Input
                    type="date"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>ค่าใช้จ่าย (บาท)</Label>
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>รายละเอียด</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="รายละเอียดเพิ่มเติม..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>รายการตรวจเช็ค</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {editingStandards.map(item => {
                const status = getMaintenanceStatus(item)
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded" onClick={() => {
                    if (status === 'overdue' || status === 'due_soon') {
                      setQuickSelectedItem(item)
                      setFormData({ serviceDate: "", cost: "", description: "" })
                      setShowQuickForm(true)
                    }
                  }}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.intervalKm.toLocaleString()} กม. / {item.intervalMonths} เดือน
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(status)}
                      {(status === 'overdue' || status === 'due_soon') && (
                        <div className="text-xs text-blue-600">คลิกเพื่อบันทึก</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ประวัติการซ่อมบำรุง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="p-3 border rounded">
                  <div className="font-medium text-sm mb-1">{record.serviceType}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date(record.serviceDate).toLocaleDateString('th-TH')}
                  </div>
                  {record.description && (
                    <div className="text-sm text-muted-foreground mb-2">{record.description}</div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span>เลขไมล์: {record.mileage?.toLocaleString()} กม.</span>
                    {record.cost && <span>ค่าใช้จ่าย: {record.cost.toLocaleString()} บาท</span>}
                  </div>
                </div>
              ))}
              {records.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  ยังไม่มีประวัติการซ่อมบำรุง
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Maintenance Dialog */}
      <Dialog open={showQuickForm} onOpenChange={setShowQuickForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>บันทึกการซ่อมบำรุง</DialogTitle>
          </DialogHeader>
          {quickSelectedItem && (
            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!formData.serviceDate) {
                toast({
                  title: "ข้อมูลไม่ครบถ้วน",
                  description: "กรุณาระบุวันที่ซ่อม",
                  variant: "destructive"
                })
                return
              }

              setLoading(true)
              try {
                const response = await fetch("/api/maintenance", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    carId: params.id,
                    serviceType: quickSelectedItem.name,
                    serviceDate: formData.serviceDate,
                    description: formData.description,
                    cost: formData.cost ? parseFloat(formData.cost) : null,
                    mileage: car?.currentMileage
                  })
                })

                if (response.ok) {
                  toast({
                    title: "บันทึกสำเร็จ",
                    description: "บันทึกการซ่อมบำรุงเรียบร้อยแล้ว"
                  })
                  setFormData({ serviceDate: "", cost: "", description: "" })
                  setShowQuickForm(false)
                  fetchRecords()
                } else {
                  throw new Error("Failed to save")
                }
              } catch (error) {
                toast({
                  title: "เกิดข้อผิดพลาด",
                  description: "ไม่สามารถบันทึกข้อมูลได้",
                  variant: "destructive"
                })
              } finally {
                setLoading(false)
              }
            }} className="space-y-4">
              <div className="p-3 bg-muted rounded">
                <div className="font-medium">{quickSelectedItem.name}</div>
                <div className="text-sm text-muted-foreground">
                  ทุก {quickSelectedItem.intervalKm.toLocaleString()} กม. หรือ {quickSelectedItem.intervalMonths} เดือน
                </div>
              </div>

              <div>
                <Label>วันที่ซ่อม *</Label>
                <Input
                  type="date"
                  value={formData.serviceDate}
                  onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
                />
              </div>
              
              <div>
                <Label>ค่าใช้จ่าย (บาท)</Label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>รายละเอียด</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowQuickForm(false)} className="flex-1">
                  ยกเลิก
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Bottom padding for fixed buttons */}
      <div className="h-20"></div>
    </div>
  )
}