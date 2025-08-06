export const dynamic = "force-dynamic"
import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Create Maintenance table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS Maintenance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        carId INT NOT NULL,
        serviceDate DATE NOT NULL,
        serviceType VARCHAR(100) NOT NULL,
        description TEXT,
        cost DECIMAL(10,2) DEFAULT 0,
        mileage INT DEFAULT 0,
        nextServiceDate DATE,
        nextServiceMileage INT,
        createdBy INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (carId) REFERENCES Cars(id) ON DELETE CASCADE,
        FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE SET NULL
      )
    `)

    return NextResponse.json({ 
      success: true, 
      message: "Maintenance table created successfully" 
    })
  } catch (error) {
    console.error("Error creating Maintenance table:", error)
    return NextResponse.json(
      { error: "Failed to create Maintenance table" },
      { status: 500 }
    )
  }
}