import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CategorySeo from '@/models/CategorySeo';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // In Next.js 15, params must be awaited
    const { slug } = await params;
    
    const categorySeoData = await CategorySeo.findOne({ 
      categorySlug: slug,
      isActive: true 
    })
      .populate('categoryId', 'name')
      .lean(); // Use lean() to handle missing categoryId gracefully
    
    if (!categorySeoData) {
      return NextResponse.json({
        success: false,
        error: 'Category SEO not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: categorySeoData
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching category SEO:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch category SEO data'
    }, { status: 500 });
  }
}