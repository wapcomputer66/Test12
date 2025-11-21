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
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'अमान्य शेयर लिंक या लिंक एक्सपायर हो गया है' },
        { status: 404 }
      );
    }

    // Transform land records for better display
    const transformedRecords = project.landRecords.map(record => ({
      id: record.id,
      timestamp: record.timestamp,
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
      remarks: record.remarks,
      createdAt: record.createdAt
    }));

    // Group records by raiyat for summary
    const recordsByRaiyat = project.raiyatNames.map(raiyat => {
      const raiyatRecords = transformedRecords.filter(record => record.raiyatName === raiyat.name);
      return {
        raiyatName: raiyat.name,
        raiyatColor: raiyat.color,
        totalRecords: raiyatRecords.length,
        records: raiyatRecords
      };
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt
      },
      raiyats: recordsByRaiyat,
      totalRecords: transformedRecords.length,
      allRecords: transformedRecords
    });

  } catch (error) {
    console.error('Failed to fetch records:', error);
    return NextResponse.json(
      { error: 'रिकॉर्ड लोड करने में विफल' },
      { status: 500 }
    );
  }
}