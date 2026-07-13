import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://marokandhumo.academy'
  const views = ['', 'courses', 'pricing', 'about', 'contact']
  return views.map((view) => ({
    url: `${baseUrl}${view ? `/?view=${view}` : ''}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: view === '' ? 1 : 0.8,
  }))
}
