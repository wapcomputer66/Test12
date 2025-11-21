import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Vibrant colors for raiyat assignment (like the examples shown)
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

// Get next available vibrant color for a project
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

// POST add a new raiyat to a project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'रैयत नाम आवश्यक है' },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { raiyatNames: true }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'प्रोजेक्ट नहीं मिला' },
        { status: 404 }
      );
    }

    // Check if raiyat name already exists (check in database directly)
    const existingRaiyat = await db.raiyat.findFirst({
      where: {
        projectId: projectId,
        name: name.trim()
      }
    });

    if (existingRaiyat) {
      return NextResponse.json(
        { error: 'यह रैयत नाम पहले से मौजूद है' },
        { status: 400 }
      );
    }

    // Get next available vibrant color
    const assignedColor = await getNextAvailableColor(projectId);

    // Create new raiyat with color
    const newRaiyat = await db.raiyat.create({
      data: {
        name: name.trim(),
        color: assignedColor,
        projectId: projectId
      }
    });

    // Get updated project
    const updatedProject = await db.project.findUnique({
      where: { id: projectId },
      include: {
        raiyatNames: true,
        landRecords: {
          include: {
            raiyat: true
          }
        }
      }
    });

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'प्रोजेक्ट अपडेट करने में विफल' },
        { status: 500 }
      );
    }

    const transformedProject = {
      id: updatedProject.id,
      name: updatedProject.name,
      created: updatedProject.createdAt.toISOString(),
      raiyatNames: updatedProject.raiyatNames,
      landRecords: updatedProject.landRecords.map(record => ({
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
      }))
    };

    return NextResponse.json({ project: transformedProject });
  } catch (error) {
    console.error('Failed to add raiyat:', error);
    return NextResponse.json(
      { error: 'रैयत नाम जोड़ने में विफल' },
      { status: 500 }
    );
  }
}