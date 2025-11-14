/**
 * Get image path for landing page assets
 * Assets are stored in public/landing/assets/images/
 */
export const getImage = (fileName: string): string => {
  return `/landing/assets/images/${fileName}`;
};

/**
 * Get video path for landing page assets
 * Videos are stored in public/landing/assets/videos/
 */
export const getVideo = (fileName: string): string => {
  return `/landing/assets/videos/${fileName}`;
};
