// app/api/reports/[shareId]/route.js - API route to retrieve shared reports
import { NextResponse } from 'next/server';
import { getReportByShareId } from '../../../../lib/database';

export async function GET(request, { params }) {
  try {
    const { shareId } = params;

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    // Validate shareId format (12 characters, alphanumeric)
    if (!/^[a-zA-Z0-9]{12}$/.test(shareId)) {
      return NextResponse.json(
        { error: 'Invalid share ID format' },
        { status: 400 }
      );
    }

    const report = await getReportByShareId(shareId);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Calculate cache expiration (3 months from creation)
    const cacheExpiresAt = new Date(report.created_at);
    cacheExpiresAt.setMonth(cacheExpiresAt.getMonth() + 3);
    
    // Check if report is expired
    const isExpired = new Date() > cacheExpiresAt;

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        companyName: report.company_name,
        analysisData: report.analysis_data,
        shareId: report.share_id,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
        modelUsed: report.model_used,
        tokenLimit: report.token_limit,
        version: report.version,
        isExpired,
        cacheExpiresAt: cacheExpiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error in reports/[shareId] API:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve report. Please try again.' },
      { status: 500 }
    );
  }
}