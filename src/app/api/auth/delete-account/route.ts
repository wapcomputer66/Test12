import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`Starting account deletion for user: ${userId}`);

    // Check if user exists first
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      console.log(`User not found: ${userId}`);
      return NextResponse.json(
        { error: 'यूजर नहीं मिला - User not found' },
        { status: 404 }
      );
    }

    console.log(`Found user to delete: ${existingUser.email}`);

    // Get all user projects first
    const userProjects = await db.project.findMany({
      where: { userId },
      select: { id: true }
    });

    const projectIds = userProjects.map(p => p.id);
    console.log(`Found ${projectIds.length} projects to delete`);

    // Delete payments for all user projects
    if (projectIds.length > 0) {
      const deletedPayments = await db.payment.deleteMany({
        where: {
          projectId: {
            in: projectIds
          }
        }
      });
      console.log(`Deleted ${deletedPayments.count} payments`);
    }

    // Delete all user projects (this will also delete land records and raiyats due to cascade)
    const deletedProjects = await db.project.deleteMany({
      where: { userId }
    });
    console.log(`Deleted ${deletedProjects.count} projects`);

    // Delete the user
    const deletedUser = await db.user.delete({
      where: { id: userId }
    });
    console.log(`Deleted user: ${deletedUser.email}`);

    return NextResponse.json(
      { 
        message: 'Account deleted successfully',
        deletedProjects: deletedProjects.count,
        deletedPayments: projectIds.length > 0 ? 'payments deleted' : 'no payments'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete account error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'यूजर नहीं मिला - User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again.' },
      { status: 500 }
    );
  }
}