import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find project by share token
    const project = await db.project.findUnique({
      where: { 
        shareToken: token,
        isShared: true 
      },
      include: {
        user: {
          select: {
            name: true,
            mobile: true
          }
        },
        raiyatNames: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        landRecords: {
          include: {
            raiyat: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'अमान्य शेयर लिंक या लिंक एक्सपायर हो गया है' },
        { status: 404 }
      );
    }

    // Return project info without sensitive data
    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        raiyatNames: project.raiyatNames,
        landRecords: project.landRecords,
        payments: project.payments,
        owner: project.user
      }
    });

  } catch (error) {
    console.error('Failed to access shared project:', error);
    return NextResponse.json(
      { error: 'प्रोजेक्ट एक्सेस करने में विफल' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'पासवर्ड आवश्यक है' },
        { status: 400 }
      );
    }

    // Find project by share token
    const project = await db.project.findUnique({
      where: { 
        shareToken: token,
        isShared: true 
      },
      select: {
        id: true,
        name: true,
        mobileNumber: true,
        createdAt: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'अमान्य शेयर लिंक या लिंक एक्सपायर हो गया है' },
        { status: 404 }
      );
    }

    // Verify password (mobile number)
    if (project.mobileNumber !== password.trim()) {
      return NextResponse.json(
        { error: 'गलत पासवर्ड' },
        { status: 401 }
      );
    }

    // Password verified, return success
    return NextResponse.json({
      success: true,
      verified: true,
      project: {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt
      }
    });

  } catch (error) {
    console.error('Failed to verify password:', error);
    return NextResponse.json(
      { error: 'पासवर्ड सत्यापन में विफल' },
      { status: 500 }
    );
  }
}