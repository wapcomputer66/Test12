import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');

    let payments;
    
    if (projectId) {
      // Get payments for specific project
      payments = await db.payment.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      });
    } else if (userId) {
      // Get all payments for user's projects
      const userProjects = await db.project.findMany({
        where: { userId },
        select: { id: true, name: true }
      });
      
      payments = await db.payment.findMany({
        where: {
          projectId: { in: userProjects.map(p => p.id) }
        },
        include: {
          project: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return NextResponse.json({ error: 'projectId or userId required' }, { status: 400 });
    }

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received at /api/payments');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { projectId, totalAmount, receivedAmount, paymentType, description } = body;

    if (!projectId || !totalAmount) {
      console.log('Missing required fields:', { projectId, totalAmount });
      return NextResponse.json({ error: 'projectId and totalAmount are required' }, { status: 400 });
    }

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      console.log('Project not found:', projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const receivedAmt = parseFloat(receivedAmount) || 0;
    const totalAmt = parseFloat(totalAmount);
    const pendingAmt = totalAmt - receivedAmt;
    
    // Determine status
    let status = 'pending';
    if (receivedAmt > 0 && receivedAmt < totalAmt) {
      status = 'partial';
    } else if (receivedAmt >= totalAmt) {
      status = 'completed';
    }

    const paymentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log('Creating payment with data:', {
      projectId,
      totalAmount: totalAmt,
      receivedAmount: receivedAmt,
      pendingAmount: pendingAmt,
      paymentDate,
      status,
      paymentType: paymentType || 'cash',
      description: description || ''
    });

    const payment = await db.payment.create({
      data: {
        projectId,
        totalAmount: totalAmt,
        receivedAmount: receivedAmt,
        pendingAmount: pendingAmt,
        paymentDate,
        status,
        paymentType: paymentType || 'cash',
        description: description || ''
      }
    });

    console.log('Payment created successfully:', payment);
    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}