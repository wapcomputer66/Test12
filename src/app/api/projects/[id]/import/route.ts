import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Vibrant colors for raiyat assignment
const VIBRANT_COLORS = [
  '#ef4444', // Red
  '#22c55e', // Green  
  '#a16207', // Dark brown/amber
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Orange
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f97316', // Dark orange
  '#6366f1', // Indigo
  '#84cc16', // Lime
];

// Get next available color for a project
async function getNextAvailableColor(projectId: string): Promise<string> {
  const existingRiyats = await db.raiyat.findMany({
    where: { projectId },
    select: { color: true }
  });
  
  const usedColors = existingRiyats.map(r => r.color).filter(Boolean);
  
  // Find first unused color
  for (const color of VIBRANT_COLORS) {
    if (!usedColors.includes(color)) {
      return color;
    }
  }
  
  // If all colors are used, return a random one
  return VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { records } = await request.json();

    if (!records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'अमान्य रिकॉर्ड डेटा' },
        { status: 400 }
      );
    }

    // Get project and existing raiyats
    const project = await db.project.findUnique({
      where: { id },
      include: { raiyatNames: true }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'प्रोजेक्ट नहीं मिला' },
        { status: 404 }
      );
    }

    const createdRecords: any[] = [];
    const errors: string[] = [];
    
    // Get all existing raiyats for this project to avoid duplicates
    const existingRaiyats = await db.raiyat.findMany({
      where: { projectId: id }
    });
    
    // Create a map for quick lookup
    const raiyatMap = new Map();
    existingRaiyats.forEach(raiyat => {
      raiyatMap.set(raiyat.name.toLowerCase(), raiyat);
    });

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        // Find or create raiyat (case-insensitive check)
        let raiyat = raiyatMap.get(record.raiyatName.toLowerCase());
        
        if (!raiyat) {
          // Get next available color for new raiyat
          const assignedColor = await getNextAvailableColor(id);
          
          raiyat = await db.raiyat.create({
            data: {
              name: record.raiyatName,
              color: assignedColor,
              projectId: id
            }
          });
          // Add to map for future records in this import
          raiyatMap.set(raiyat.name.toLowerCase(), raiyat);
        }

        // Create land record directly (allow same khesra numbers for same raiyat)
        const newRecord = await db.landRecord.create({
          data: {
            timestamp: new Date().toISOString(),
            raiyatId: raiyat.id,
            projectId: id,
            jamabandiNumber: record.jamabandiNumber || null,
            khataNumber: record.khataNumber || null,
            khesraNumber: record.khesraNumber,
            rakwa: record.rakwa?.toString() || null,
            uttar: record.uttar || null,
            dakshin: record.dakshin || null,
            purab: record.purab || null,
            paschim: record.paschim || null,
            remarks: record.remarks || null
          }
        });

        createdRecords.push(newRecord);
      } catch (error) {
        errors.push(`पंक्ति ${i + 1}: ${error instanceof Error ? error.message : 'अज्ञात त्रुटि'}`);
      }
    }

    // Get updated project with all records
    const updatedProject = await db.project.findUnique({
      where: { id },
      include: {
        raiyatNames: true,
        landRecords: {
          include: { raiyat: true }
        }
      }
    });

    const transformedProject = {
      id: updatedProject?.id,
      name: updatedProject?.name,
      created: updatedProject?.createdAt.toISOString(),
      raiyatNames: updatedProject?.raiyatNames || [],
      landRecords: updatedProject?.landRecords.map(record => ({
        id: record.id,
        timestamp: record.timestamp,
        raiyatId: record.raiyatId,
        raiyatName: record.raiyat.name,
        raiyatColor: record.raiyat.color,
        jamabandiNumber: record.jamabandiNumber,
        khataNumber: record.khataNumber,
        khesraNumber: record.khesraNumber,
        rakwa: record.rakwa,
        uttar: record.uttar,
        dakshin: record.dakshin,
        purab: record.purab,
        paschim: record.paschim,
        remarks: record.remarks
      })) || []
    };

    return NextResponse.json({
      project: transformedProject,
      createdCount: createdRecords.length,
      errorCount: errors.length,
      errors
    });
  } catch (error) {
    console.error('Failed to import records:', error);
    return NextResponse.json(
      { error: 'रिकॉर्ड इंपोर्ट करने में विफल' },
      { status: 500 }
    );
  }
}