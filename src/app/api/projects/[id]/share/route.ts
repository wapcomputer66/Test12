import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the request origin for dynamic URL
    const requestUrl = request.url;
    const url = new URL(requestUrl);
    
    // Use environment variable or fallback to current domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;
    
    // Check if project exists FIRST
    const project = await db.project.findUnique({
      where: { id },
      include: {
        raiyatNames: true,
        landRecords: {
          include: {
            raiyat: true
          }
        },
        payments: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'प्रोजेक्ट नहीं मिला' },
        { status: 404 }
      );
    }

    // Generate unique share token if not exists
    let shareToken = project.shareToken;
    if (!shareToken) {
      shareToken = randomBytes(16).toString('hex');
      
      // Update project with share token
      await db.project.update({
        where: { id },
        data: { 
          shareToken,
          isShared: true 
        }
      });
    }

    // Create share URL with the correct domain
    const shareUrl = `${baseUrl}/share/${shareToken}`;

    // Create WhatsApp message
    const whatsappMessage = `🏠 *प्रोजेक्ट विवरण*\n\n📝 *प्रोजेक्ट नाम*: ${project.name}\n📱 *पासवर्ड*: ${project.mobileNumber}\n🔗 *देखने के लिए लिंक*: ${shareUrl}\n\n📋 *उपलब्ध जानकारी*:\n• सभी भूमि रिकॉर्ड\n• रैयत की जानकारी\n• चार्ट और विश्लेषण\n• भुगतान सारांश`;

    return NextResponse.json({
      success: true,
      shareUrl,
      shareToken,
      whatsappMessage,
      project: {
        id: project.id,
        name: project.name,
        mobileNumber: project.mobileNumber,
        isShared: true
      }
    });

  } catch (error) {
    console.error('Failed to generate share link:', error);
    return NextResponse.json(
      { error: 'शेयर लिंक बनाने में विफल' },
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

    // Disable sharing
    await db.project.update({
      where: { id },
      data: { 
        shareToken: null,
        isShared: false 
      }
    });

    return NextResponse.json({
      success: true,
      message: 'शेयरिंग बंद कर दी गई है'
    });

  } catch (error) {
    console.error('Failed to disable sharing:', error);
    return NextResponse.json(
      { error: 'शेयरिंग बंद करने में विफल' },
      { status: 500 }
    );
  }
}