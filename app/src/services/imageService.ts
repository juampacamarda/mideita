const UNSPLASH_API_KEY = 'Ewdxb-18wkO1FQaqXZ85hiY8CCIeVmF_rdR27KtwFbo'
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos'

export interface UnsplashImage {
  id: string
  urls: {
    small: string
    regular: string
  }
  alt_description: string
  user: {
    name: string
  }
}

export const getImageReferences = async (query: string): Promise<UnsplashImage[]> => {
  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&per_page=6&client_id=${UNSPLASH_API_KEY}`
    )
    
    if (!response.ok) throw new Error('Error fetching images')
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error)
    return []
  }
}