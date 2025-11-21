import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { totalAmount, receivedAmount, paymentType, description } = body;

    // Verify payment exists
    const existingPayment = await db.payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const receivedAmt = parseFloat(receivedAmount) || existingPayment.receivedAmount;
    const totalAmt = parseFloat(totalAmount) || existingPayment.totalAmount;
    const pendingAmt = totalAmt - receivedAmt;
    
    // Determine status
    let status = 'pending';
    if (receivedAmt > 0 && receivedAmt < totalAmt) {
      status = 'partial';
    } else if (receivedAmt >= totalAmt) {
      status = 'completed';
    }

    const payment = await db.payment.update({
      where: { id },
      data: {
        totalAmount: totalAmt,
        receivedAmount: receivedAmt,
        pendingAmount: pendingAmt,
        status,
        paymentType: paymentType || existingPayment.paymentType,
        description: description || existingPayment.description
      },
      include: {
        project: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verify payment exists
    const existingPayment = await db.payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    await db.payment.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}