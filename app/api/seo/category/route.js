// ============================================
// FILE 1: app/api/admin/category-seo/route.js
// ============================================
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CategorySeo from '@/models/CategorySeo';

// GET - Fetch all category SEO data
export async function GET(request) {
  try {
    await connectDB();
    
    const categories = await CategorySeo.find({})
      .populate('categoryId', 'name')
      .sort({ categorySlug: 1 })
      .lean(); // Use lean() to handle missing categoryId gracefully
    
    return NextResponse.json({
      success: true,
      data: categories
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching category SEO:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch category SEO data'
    }, { status: 500 });
  }
}

// POST - Create or update category SEO
export async function POST(request) {
  try {
    await connectDB();
    const { Category } = await import('@/models/Product');
    
    const body = await request.json();
    let { categoryId, categorySlug, categoryName, seo, isActive } = body;
    
    // Validation
    if (!categorySlug || !categoryName || !seo?.title || !seo?.description) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields (categorySlug, categoryName, seo.title, seo.description)'
      }, { status: 400 });
    }
    
    // If categoryId is not provided, try to find it by categoryName or categorySlug
    if (!categoryId) {
      const slugify = (text = "") => text.toLowerCase().replace(/\s+/g, "-");
      const foundCategory = await Category.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${categoryName.trim()}$`, "i") } },
          { name: { $regex: new RegExp(`^${categorySlug.replace(/-/g, " ")}$`, "i") } }
        ]
      });
      
      if (foundCategory) {
        categoryId = foundCategory._id;
      }
    }
    
    // Check if category already exists by categoryId or categorySlug
    const existingCategory = await CategorySeo.findOne({ 
      $or: [
        ...(categoryId ? [{ categoryId }] : []),
        { categorySlug }
      ]
    });
    
    if (existingCategory) {
      // Update existing
      if (categoryId) existingCategory.categoryId = categoryId;
      existingCategory.categorySlug = categorySlug;
      existingCategory.categoryName = categoryName;
      existingCategory.seo = seo;
      existingCategory.isActive = isActive;
      
      await existingCategory.save();
      
      return NextResponse.json({
        success: true,
        message: 'Category SEO updated successfully',
        data: existingCategory
      }, { status: 200 });
      
    } else {
      // Create new
      const newCategory = await CategorySeo.create({
        ...(categoryId && { categoryId }),
        categorySlug,
        categoryName,
        seo,
        isActive
      });
      
      return NextResponse.json({
        success: true,
        message: 'Category SEO created successfully',
        data: newCategory
      }, { status: 201 });
    }
    
  } catch (error) {
    console.error('Error saving category SEO:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save category SEO data'
    }, { status: 500 });
  }
}

// DELETE - Delete a category SEO
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('slug');
    
    if (!categorySlug) {
      return NextResponse.json({
        success: false,
        error: 'Category slug is required'
      }, { status: 400 });
    }
    
    const deletedCategory = await CategorySeo.findOneAndDelete({ categorySlug });
    
    if (!deletedCategory) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category SEO deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting category SEO:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete category SEO data'
    }, { status: 500 });
  }
}


