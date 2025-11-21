import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, mobileNumber } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'प्रोजेक्ट नाम आवश्यक है' },
        { status: 400 }
      );
    }

    if (!mobileNumber || mobileNumber.trim() === '') {
      return NextResponse.json(
        { error: 'मोबाइल नंबर आवश्यक है' },
        { status: 400 }
      );
    }

    // Validate mobile number format (10-digit)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber.trim())) {
      return NextResponse.json(
        { error: 'कृपया एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें' },
        { status: 400 }
      );
    }

    // Get the current project to check userId
    const currentProject = await db.project.findUnique({
      where: { id }
    });

    if (!currentProject) {
      return NextResponse.json(
        { error: 'प्रोजेक्ट नहीं मिला' },
        { status: 404 }
      );
    }

    // Check if project name already exists (excluding current project)
    const existingProjectByName = await db.project.findFirst({
      where: { 
        name: name.trim(),
        userId: currentProject.userId,
        id: { not: id }
      }
    });

    if (existingProjectByName) {
      return NextResponse.json(
        { error: 'यह प्रोजेक्ट नाम पहले से मौजूद है' },
        { status: 400 }
      );
    }

    // Check if mobile number already exists (excluding current project)
    const existingProjectByMobile = await db.project.findFirst({
      where: { 
        mobileNumber: mobileNumber.trim(),
        userId: currentProject.userId,
        id: { not: id }
      }
    });

    if (existingProjectByMobile) {
      return NextResponse.json(
        { error: 'यह मोबाइल नंबर पहले से मौजूद है' },
        { status: 400 }
      );
    }

    const project = await db.project.update({
      where: { id },
      data: { 
        name: name.trim(),
        mobileNumber: mobileNumber.trim()
      },
      include: {
        raiyatNames: true,
        landRecords: {
          include: {
            raiyat: true
          }
        }
      }
    });

    const transformedProject = {
      id: project.id,
      name: project.name,
      mobileNumber: project.mobileNumber,
      created: project.createdAt.toISOString(),
      raiyatNames: project.raiyatNames,
      landRecords: project.landRecords.map(record => ({
        id: record.id,
        timestamp: record.timestamp,
        raiyatId: record.raiyatId,
        raiyatName: record.raiyat.name,
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
  } catch (error: any) {
    console.error('Failed to update project:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('name')) {
        return NextResponse.json(
          { error: 'यह प्रोजेक्ट नाम पहले से मौजूद है' },
          { status: 400 }
        );
      }
      if (error.meta?.target?.includes('mobileNumber')) {
        return NextResponse.json(
          { error: 'यह मोबाइल नंबर पहले से मौजूद है' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'प्रोजेक्ट अपडेट करने में विफल' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if project exists
    const project = await db.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'प्रोजेक्ट नहीं मिला' },
        { status: 404 }
      );
    }

    // Delete project (cascade delete will handle related records)
    await db.project.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'प्रोजेक्ट सफलतापूर्वक डिलीट किया गया' });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json(
      { error: 'प्रोजेक्ट डिलीट करने में विफल' },
      { status: 500 }
    );
  }
}