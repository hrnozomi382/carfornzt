"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wrench, Plus, Calendar, Car } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface Car {
  id: number
  name: string
  licensePlate: string
}

interface MaintenanceRecord {
  id: number
  carId: number
  carName: string
  licensePlate: string
  serviceDate: string
  serviceType: string
  description: string
  cost: number
  mileage: number
  nextServiceDate: string
  nextServiceMileage: number
  createdByName: string
}

export default function MaintenancePage() {
  const [cars, setCars] = useState<Car[]>([])
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    carId: "",
    serviceDate: "",
    serviceType: "",
    description: "",
    cost: "",
    mileage: "",
    nextServiceDate: "",
    nextServiceMileage: ""
  })

  useEffect(() => {
    fetchCars()
    fetchRecords()
  }, [])

  const fetchCars = async () => {
    try {
      const response = await fetch("/api/cars")
      const data = await response.json()
      setCars(data)
    } catch (error) {
      console.error("Error fetching cars:", error)
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/maintenance")
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error("Error fetching maintenance records:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.carId || !formData.serviceDate || !formData.serviceType) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลที่จำเป็น",
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
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          mileage: formData.mileage ? parseInt(formData.mileage) : null,
          nextServiceMileage: formData.nextServiceMileage ? parseInt(formData.nextServiceMileage) : null
        })
      })

      if (response.ok) {
        toast({
          title: "บันทึกสำเร็จ",
          description: "บันทึกการซ่อมบำรุงเรียบร้อยแล้ว"
        })
        setFormData({
          carId: "",
          serviceDate: "",
          serviceType: "",
          description: "",
          cost: "",
          mileage: "",
          nextServiceDate: "",
          nextServiceMileage: ""
        })
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

  return (
    <div className="p-6">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            บันทึกซ่อมบำรุง
          </h1>
          <p className="text-muted-foreground">จัดการข้อมูลการซ่อมบำรุงรถ</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มการซ่อมบำรุง
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>เพิ่มการซ่อมบำรุงใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carId">รถ *</Label>
                  <Select value={formData.carId} onValueChange={(value) => setFormData({...formData, carId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกรถ" />
                    </SelectTrigger>
                    <SelectContent>
                      {cars.map((car) => (
                        <SelectItem key={car.id} value={car.id.toString()}>
                          {car.name} ({car.licensePlate})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="serviceDate">วันที่ซ่อม *</Label>
                  <Input
                    type="date"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceType">ประเภทการซ่อม *</Label>
                  <Select value={formData.serviceType} onValueChange={(value) => setFormData({...formData, serviceType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="เปลี่ยนน้ำมันเครื่อง">เปลี่ยนน้ำมันเครื่อง</SelectItem>
                      <SelectItem value="ตรวจเช็คทั่วไป">ตรวจเช็คทั่วไป</SelectItem>
                      <SelectItem value="ซ่อมเครื่องยนต์">ซ่อมเครื่องยนต์</SelectItem>
                      <SelectItem value="ซ่อมเบรก">ซ่อมเบรก</SelectItem>
                      <SelectItem value="เปลี่ยนยาง">เปลี่ยนยาง</SelectItem>
                      <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cost">ค่าใช้จ่าย (บาท)</Label>
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="mileage">เลขไมล์</Label>
                  <Input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="nextServiceDate">วันที่ซ่อมครั้งถัดไป</Label>
                  <Input
                    type="date"
                    value={formData.nextServiceDate}
                    onChange={(e) => setFormData({...formData, nextServiceDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="nextServiceMileage">เลขไมล์ซ่อมครั้งถัดไป</Label>
                  <Input
                    type="number"
                    value={formData.nextServiceMileage}
                    onChange={(e) => setFormData({...formData, nextServiceMileage: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="รายละเอียดการซ่อมบำรุง..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการซ่อมบำรุง</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>รถ</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>ค่าใช้จ่าย</TableHead>
                <TableHead>เลขไมล์</TableHead>
                <TableHead>ซ่อมครั้งถัดไป</TableHead>
                <TableHead>เลขไมล์ซ่อมครั้งถัดไป</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.serviceDate).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.carName}</div>
                      <div className="text-sm text-muted-foreground">{record.licensePlate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.serviceType}</Badge>
                  </TableCell>
                  <TableCell>{record.cost ? `${record.cost.toLocaleString()} บาท` : "-"}</TableCell>
                  <TableCell>{record.mileage ? record.mileage.toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    {record.nextServiceDate ? new Date(record.nextServiceDate).toLocaleDateString('th-TH') : "-"}
                  </TableCell>
                  <TableCell>{record.nextServiceMileage ? record.nextServiceMileage.toLocaleString() : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}