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

    // Calculate statistics
    const totalRecords = project.landRecords.length;
    const totalRaiyats = project.raiyatNames.length;
    
    // Payment summary
    const totalAmount = project.payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
    const receivedAmount = project.payments.reduce((sum, payment) => sum + payment.receivedAmount, 0);
    const pendingAmount = totalAmount - receivedAmount;
    
    // Records by raiyat for charts
    const recordsByRaiyat = project.raiyatNames.map(raiyat => {
      const raiyatRecords = project.landRecords.filter(record => record.raiyatId === raiyat.id);
      return {
        name: raiyat.name,
        color: raiyat.color,
        count: raiyatRecords.length,
        percentage: totalRecords > 0 ? (raiyatRecords.length / totalRecords) * 100 : 0
      };
    });

    // Payment status summary
    const paymentStatus = project.payments.reduce((acc, payment) => {
      acc.status = payment.status;
      acc.total += payment.totalAmount;
      acc.received += payment.receivedAmount;
      acc.pending += payment.pendingAmount;
      return acc;
    }, { status: '', total: 0, received: 0, pending: 0 });

    // Location summary
    const locationSummary = project.landRecords.reduce((acc, record) => {
      if (record.uttar) acc.uttar++;
      if (record.dakshin) acc.dakshin++;
      if (record.purab) acc.purab++;
      if (record.paschim) acc.paschim++;
      return acc;
    }, { uttar: 0, dakshin: 0, purab: 0, paschim: 0 });

    // Recent activity
    const recentRecords = project.landRecords
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(record => ({
        id: record.id,
        khesraNumber: record.khesraNumber,
        raiyatName: record.raiyat.name,
        timestamp: record.timestamp,
        createdAt: record.createdAt
      }));

    const recentPayments = project.payments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map(payment => ({
        id: payment.id,
        totalAmount: payment.totalAmount,
        receivedAmount: payment.receivedAmount,
        status: payment.status,
        paymentDate: payment.paymentDate,
        createdAt: payment.createdAt
      }));

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt
      },
      statistics: {
        totalRecords,
        totalRaiyats,
        totalPayments: project.payments.length
      },
      paymentSummary: {
        totalAmount,
        receivedAmount,
        pendingAmount,
        paymentStatus: paymentStatus.status
      },
      charts: {
        recordsByRaiyat,
        locationSummary
      },
      recentActivity: {
        records: recentRecords,
        payments: recentPayments
      },
      raiyats: project.raiyatNames.map(raiyat => ({
        name: raiyat.name,
        color: raiyat.color,
        recordCount: project.landRecords.filter(r => r.raiyatId === raiyat.id).length
      }))
    });

  } catch (error) {
    console.error('Failed to fetch overview:', error);
    return NextResponse.json(
      { error: 'ओवरव्यू लोड करने में विफल' },
      { status: 500 }
    );
  }
}