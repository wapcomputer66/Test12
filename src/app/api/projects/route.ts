import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'यूजर ID आवश्यक है' },
        { status: 400 }
      );
    }

    // Get projects for the specific user
    const projects = await db.project.findMany({
      where: { userId },
      include: {
        raiyatNames: {
          orderBy: {
            createdAt: 'asc' // Get raiyats in the order they were created
          }
        },
        landRecords: {
          include: {
            raiyat: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const transformedProjects = projects.map(project => {
      return {
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
    });

    return NextResponse.json({ projects: transformedProjects });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'प्रोजेक्ट्स लोड करने में विफल' },
      { status: 500 }
    );
  }
}

// POST create a new project
export async function POST(request: NextRequest) {
  try {
    const { name, mobileNumber, userId } = await request.json();

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

    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { error: 'यूजर ID आवश्यक है' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'यूजर मौजूद नहीं है' },
        { status: 404 }
      );
    }

    // Check if project name already exists
    const existingProjectByName = await db.project.findFirst({
      where: { 
        name: name.trim(),
        userId: userId
      }
    });

    if (existingProjectByName) {
      return NextResponse.json(
        { error: 'यह प्रोजेक्ट नाम पहले से मौजूद है' },
        { status: 400 }
      );
    }

    // Check if mobile number already exists
    const existingProjectByMobile = await db.project.findFirst({
      where: { 
        mobileNumber: mobileNumber.trim(),
        userId: userId
      }
    });

    if (existingProjectByMobile) {
      return NextResponse.json(
        { error: 'यह मोबाइल नंबर पहले से मौजूद है' },
        { status: 400 }
      );
    }

    // Create project without default raiyat names
    const project = await db.project.create({
      data: {
        name: name.trim(),
        mobileNumber: mobileNumber.trim(),
        userId: userId,
      },
      include: {
        raiyatNames: true,
        landRecords: true
      }
    });

    const transformedProject = {
      id: project.id,
      name: project.name,
      mobileNumber: project.mobileNumber,
      created: project.createdAt.toISOString(),
      raiyatNames: project.raiyatNames,
      landRecords: []
    };

    return NextResponse.json({ project: transformedProject });
  } catch (error: any) {
    console.error('Failed to create project:', error);
    
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
      { error: 'प्रोजेक्ट बनाने में विफल' },
      { status: 500 }
    );
  }
}