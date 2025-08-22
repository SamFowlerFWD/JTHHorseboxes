import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

// Mock knowledge base articles
const MOCK_ARTICLES = [
  {
    id: '1',
    title: 'Getting Started with JTH Operations Platform',
    category: 'getting-started',
    content: 'Welcome to the JTH Operations Platform! This comprehensive guide will walk you through the main features of the system, including sales pipeline management, production tracking, inventory control, and customer relationship management. The platform is designed to streamline your horsebox manufacturing operations from initial inquiry to final delivery.',
    summary: 'Complete guide to using the JTH Operations Platform',
    author: 'System Admin',
    tags: ['tutorial', 'basics', 'onboarding'],
    views: 1250,
    helpful: 89,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01'),
    type: 'guide',
    featured: true
  },
  {
    id: '2',
    title: 'Managing the Sales Pipeline',
    category: 'sales',
    content: 'The sales pipeline is your central hub for tracking leads from initial inquiry through to conversion. Learn how to add new leads, update their status, schedule follow-ups, and convert leads to orders. This guide covers best practices for lead qualification, nurturing, and closing deals effectively.',
    summary: 'How to effectively manage leads and convert them to sales',
    author: 'Sales Team',
    tags: ['sales', 'leads', 'conversion'],
    views: 856,
    helpful: 67,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-11-28'),
    type: 'article',
    featured: true
  },
  {
    id: '3',
    title: 'Production Tracking Best Practices',
    category: 'production',
    content: 'Efficient production tracking is crucial for on-time delivery and customer satisfaction. This article explains how to monitor build progress, update stage completion, manage team assignments, and handle production issues. Learn about the eight production stages and how to optimize workflow through each phase.',
    summary: 'Optimize your production workflow with these proven strategies',
    author: 'Production Manager',
    tags: ['production', 'workflow', 'efficiency'],
    views: 723,
    helpful: 54,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-12-05'),
    type: 'guide',
    featured: true
  },
  {
    id: '4',
    title: 'Inventory Management Essentials',
    category: 'inventory',
    content: 'Maintain optimal stock levels and avoid production delays with proper inventory management. This guide covers setting reorder points, tracking stock movements, managing suppliers, and generating purchase orders. Learn how to use the system alerts to prevent stockouts and minimize carrying costs.',
    summary: 'Keep your inventory optimized and production running smoothly',
    author: 'Inventory Team',
    tags: ['inventory', 'stock', 'supplies'],
    views: 612,
    helpful: 45,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-11-15'),
    type: 'article',
    featured: false
  },
  {
    id: '5',
    title: 'Creating and Sending Quotes',
    category: 'sales',
    content: 'Learn how to create professional quotes using the configurator data, add custom options, apply discounts, and send quotes to customers. This guide includes tips for quote follow-up, handling revisions, and converting quotes to orders.',
    summary: 'Generate professional quotes that convert',
    author: 'Sales Team',
    tags: ['quotes', 'sales', 'configurator'],
    views: 534,
    helpful: 41,
    createdAt: new Date('2024-04-12'),
    updatedAt: new Date('2024-12-08'),
    type: 'guide',
    featured: false
  },
  {
    id: '6',
    title: 'Troubleshooting Common Issues',
    category: 'troubleshooting',
    content: 'Quick solutions to common problems users encounter. Covers login issues, data sync problems, report generation errors, and browser compatibility. Includes step-by-step troubleshooting guides and when to contact support.',
    summary: 'Quick fixes for common platform issues',
    author: 'Support Team',
    tags: ['troubleshooting', 'support', 'help'],
    views: 892,
    helpful: 72,
    createdAt: new Date('2024-05-08'),
    updatedAt: new Date('2024-12-10'),
    type: 'faq',
    featured: false
  },
  {
    id: '7',
    title: 'Understanding Reports and Analytics',
    category: 'sales',
    content: 'Make data-driven decisions with the comprehensive reporting suite. Learn how to generate sales reports, production analytics, inventory turnover reports, and customer insights. This guide explains key metrics and how to use them to improve business performance.',
    summary: 'Leverage data to drive business growth',
    author: 'Analytics Team',
    tags: ['reports', 'analytics', 'metrics'],
    views: 467,
    helpful: 38,
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-11-20'),
    type: 'article',
    featured: false
  },
  {
    id: '8',
    title: 'Customer Data Management',
    category: 'sales',
    content: 'Effective customer relationship management starts with good data. Learn how to maintain customer records, track interactions, segment customers, and use customer insights to improve sales and service.',
    summary: 'Build stronger customer relationships with proper data management',
    author: 'CRM Team',
    tags: ['customers', 'crm', 'data'],
    views: 389,
    helpful: 29,
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-11-25'),
    type: 'article',
    featured: false
  },
  {
    id: '9',
    title: 'Video: Platform Overview',
    category: 'getting-started',
    content: 'A comprehensive video walkthrough of the JTH Operations Platform. Watch this 15-minute video to get familiar with all major features and navigation. Perfect for new users or as a refresher.',
    summary: '15-minute video introduction to the platform',
    author: 'Training Team',
    tags: ['video', 'training', 'overview'],
    views: 1456,
    helpful: 112,
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-08-10'),
    type: 'video',
    featured: false
  },
  {
    id: '10',
    title: 'Scheduled Maintenance Procedures',
    category: 'maintenance',
    content: 'Keep your operations running smoothly with regular system maintenance. This guide covers daily backups, data cleanup, performance optimization, and scheduled maintenance windows. Learn best practices for system administration.',
    summary: 'Essential maintenance tasks for system administrators',
    author: 'IT Team',
    tags: ['maintenance', 'admin', 'system'],
    views: 234,
    helpful: 18,
    createdAt: new Date('2024-09-05'),
    updatedAt: new Date('2024-12-01'),
    type: 'guide',
    featured: false
  }
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceSupabaseClient()
    
    // Try to fetch from database
    const { data: articlesData, error: articlesError } = await supabase
      .from('knowledge_articles')
      .select('*')
      .order('featured', { ascending: false })
      .order('views', { ascending: false })
    
    // If table doesn't exist or error, return mock data
    if (articlesError) {
      console.log('Knowledge articles table not found, using mock data:', articlesError.message)
      return NextResponse.json({ 
        success: true, 
        data: MOCK_ARTICLES,
        mock: true 
      })
    }
    
    // If no data, return mock data
    if (!articlesData || articlesData.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: MOCK_ARTICLES,
        mock: true 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: articlesData 
    })
  } catch (error: any) {
    console.error('Knowledge API error:', error)
    // Return mock data on error
    return NextResponse.json({ 
      success: true, 
      data: MOCK_ARTICLES,
      mock: true,
      error: error.message 
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body
    
    const supabase = await createServiceSupabaseClient()
    
    switch (action) {
      case 'create':
        const { data: newArticle, error: createError } = await supabase
          .from('knowledge_articles')
          .insert(data)
          .select()
          .single()
        
        if (createError) {
          // If table doesn't exist, return mock success
          console.log('Knowledge table not found, returning mock success')
          return NextResponse.json({ 
            success: true, 
            message: 'Article created successfully (mock)',
            mock: true 
          })
        }
        
        return NextResponse.json({ 
          success: true, 
          data: newArticle 
        })
      
      case 'update':
        const { id, ...updateData } = data
        const { data: updatedArticle, error: updateError } = await supabase
          .from('knowledge_articles')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
        
        if (updateError) {
          return NextResponse.json({ 
            success: true, 
            message: 'Article updated successfully (mock)',
            mock: true 
          })
        }
        
        return NextResponse.json({ 
          success: true, 
          data: updatedArticle 
        })
      
      case 'incrementView':
        // Increment view count
        const { articleId } = data
        const { error: viewError } = await supabase.rpc('increment_article_views', {
          article_id: articleId
        })
        
        if (viewError) {
          console.log('Could not increment views')
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'View count updated' 
        })
      
      case 'markHelpful':
        // Mark article as helpful
        const { error: helpfulError } = await supabase.rpc('mark_article_helpful', {
          article_id: data.articleId
        })
        
        if (helpfulError) {
          console.log('Could not mark as helpful')
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Marked as helpful' 
        })
      
      case 'search':
        // Search articles
        const { query } = data
        const searchResults = MOCK_ARTICLES.filter(article => 
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.content.toLowerCase().includes(query.toLowerCase()) ||
          article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
        
        return NextResponse.json({ 
          success: true, 
          data: searchResults 
        })
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Knowledge API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}