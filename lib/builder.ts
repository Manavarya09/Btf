/**
 * Builder.io Integration
 * 
 * This module provides utilities for integrating Builder.io CMS content.
 * Set NEXT_PUBLIC_BUILDER_API_KEY and NEXT_PUBLIC_BUILDER_API_URL in .env
 * 
 * Usage:
 * const content = await getBuilderContent('faq');
 * const page = await getBuilderPage('about-arya');
 */

const API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_BUILDER_API_URL || 'https://cdn.builder.io/api/v3';

interface BuilderContent {
  id: string;
  name: string;
  modelId: string;
  data: {
    title?: string;
    content?: string;
    blocks?: any[];
    [key: string]: any;
  };
  createdAt: number;
  updatedAt: number;
}

interface BuilderPage {
  id: string;
  name: string;
  path: string;
  data: {
    title?: string;
    description?: string;
    blocks?: any[];
    [key: string]: any;
  };
}

/**
 * Get content from Builder.io by model/slug
 * Example: getBuilderContent('faq') returns all FAQ entries
 */
export async function getBuilderContent(
  model: string,
  options?: {
    query?: Record<string, any>;
    limit?: number;
    offset?: number;
  }
): Promise<BuilderContent[]> {
  if (!API_KEY) {
    console.warn(
      'Builder.io API key not configured. Set NEXT_PUBLIC_BUILDER_API_KEY in .env'
    );
    return [];
  }

  try {
    const searchParams = new URLSearchParams({
      apiKey: API_KEY,
      limit: String(options?.limit || 50),
      offset: String(options?.offset || 0),
    });

    if (options?.query) {
      searchParams.append('query', JSON.stringify(options.query));
    }

    const response = await fetch(
      `${API_URL}/content/${model}?${searchParams}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Builder.io API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch Builder.io content:', error);
    return [];
  }
}

/**
 * Get a specific page from Builder.io
 * Example: getBuilderPage('about-arya')
 */
export async function getBuilderPage(
  path: string
): Promise<BuilderPage | null> {
  if (!API_KEY) {
    console.warn('Builder.io API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}/pages/page?apiKey=${API_KEY}&url=${encodeURIComponent(path)}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return null; // Page doesn't exist
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Failed to fetch Builder.io page:', error);
    return null;
  }
}

/**
 * Get FAQ entries from Builder.io
 */
export async function getFAQs(): Promise<
  Array<{
    id: string;
    question: string;
    answer: string;
  }>
> {
  const faqs = await getBuilderContent('faq');
  return faqs.map((item) => ({
    id: item.id,
    question: item.data.title || '',
    answer: item.data.content || '',
  }));
}

/**
 * Get informational content (about ARYA, how it works, etc.)
 */
export async function getInfoContent(section: string): Promise<{
  title: string;
  description: string;
  blocks: any[];
}> {
  const content = await getBuilderContent('info', {
    query: { 'data.section': section },
    limit: 1,
  });

  if (content.length === 0) {
    return {
      title: section,
      description: '',
      blocks: [],
    };
  }

  const item = content[0];
  return {
    title: item.data.title || section,
    description: item.data.content || '',
    blocks: item.data.blocks || [],
  };
}

/**
 * Get all Blog/News entries
 */
export async function getBlogPosts(limit = 10): Promise<
  Array<{
    id: string;
    title: string;
    excerpt: string;
    image?: string;
    publishedAt: string;
    slug: string;
  }>
> {
  const posts = await getBuilderContent('blog', { limit });
  return posts.map((item) => ({
    id: item.id,
    title: item.data.title || '',
    excerpt: item.data.excerpt || '',
    image: item.data.image,
    publishedAt: new Date(item.createdAt).toISOString(),
    slug: item.data.slug || item.id,
  }));
}

/**
 * Test Builder.io connection
 */
export async function testBuilderConnection(): Promise<boolean> {
  if (!API_KEY) {
    console.log('Builder.io not configured (no API key)');
    return false;
  }

  try {
    const response = await fetch(
      `${API_URL}/content/test?apiKey=${API_KEY}&limit=1`
    );
    return response.ok;
  } catch (error) {
    console.error('Builder.io connection test failed:', error);
    return false;
  }
}

/**
 * BuilderContent React component wrapper
 * Usage in components:
 * <BuilderContentBlock modelId="faq" />
 */
export interface BuilderContentBlockProps {
  modelId: string;
  query?: Record<string, any>;
  className?: string;
}

// This is a placeholder - actual implementation would use Builder's React SDK
export const BuilderContentBlock = async ({
  modelId,
  query,
  className = '',
}: BuilderContentBlockProps) => {
  const content = await getBuilderContent(modelId, { query });

  if (!content.length) {
    return (
      <div className={className}>
        <p className="text-gray-500">No content available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {content.map((item) => (
        <div key={item.id} className="mb-6">
          {item.data.title && <h3 className="text-xl font-bold mb-2">{item.data.title}</h3>}
          {item.data.content && <p className="text-gray-700">{item.data.content}</p>}
        </div>
      ))}
    </div>
  );
};

export default {
  getBuilderContent,
  getBuilderPage,
  getFAQs,
  getInfoContent,
  getBlogPosts,
  testBuilderConnection,
};