// app/api/reports/company/[companyName]/route.js - API route to get company reports
import { NextResponse } from 'next/server';
import { getLatestReportForCompany, getCompanyReportHistory } from '../../../../../lib/database';

export async function GET(request, { params }) {
  try {
    const { companyName } = params;
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const decodedCompanyName = decodeURIComponent(companyName);

    if (includeHistory) {
      // Return all reports for this company
      const reports = await getCompanyReportHistory(decodedCompanyName, limit);
      
      return NextResponse.json({
        success: true,
        companyName: decodedCompanyName,
        reports: reports.map(report => ({
          id: report.id,
          shareId: report.share_id,
          createdAt: report.created_at,
          modelUsed: report.model_used,
          version: report.version
        })),
        totalReports: reports.length
      });
    } else {
      // Return only the latest report
      const report = await getLatestReportForCompany(decodedCompanyName);
      
      if (!report) {
        return NextResponse.json(
          { error: 'No reports found for this company' },
          { status: 404 }
        );
      }

      // Calculate cache expiration
      const cacheExpiresAt = new Date(report.created_at);
      cacheExpiresAt.setMonth(cacheExpiresAt.getMonth() + 3);
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
    }

  } catch (error) {
    console.error('Error in reports/company/[companyName] API:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve company reports. Please try again.' },
      { status: 500 }
    );
  }
}