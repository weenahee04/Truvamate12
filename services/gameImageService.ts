export interface GameImage {
  id: string;
  gameId: string;
  gameName: string;
  logoImage: string;
  backgroundImage: string;
  iconImage: string;
  isActive: boolean;
  order: number;
}

const STORAGE_KEY = 'truvamate_game_images';

const DEFAULT_GAME_IMAGES: GameImage[] = [
  {
    id: 'powerball',
    gameId: 'powerball',
    gameName: 'POWERBALL®',
    logoImage: '/image/us-powerball.png',
    backgroundImage: 'https://www.powerball.com/themes/custom/baseline/images/powerball_ball_texture.jpg',
    iconImage: '/image/us-powerball.png',
    isActive: true,
    order: 1
  },
  {
    id: 'megamillions',
    gameId: 'megamillions',
    gameName: 'MEGA MILLIONS',
    logoImage: '/image/us-megamillions.png',
    backgroundImage: 'https://www.megamillions.com/images/interface/mm-logo-lg.png',
    iconImage: '/image/us-megamillions.png',
    isActive: true,
    order: 2
  },
  {
    id: 'eurojackpot',
    gameId: 'eurojackpot',
    gameName: 'EUROJACKPOT',
    logoImage: '/image/eurojackpot.png',
    backgroundImage: 'https://www.eurojackpot.net/assets/images/logo.png',
    iconImage: '/image/eurojackpot.png',
    isActive: true,
    order: 3
  }
];

class GameImageService {
  // Get all game images
  getGameImages(): GameImage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default images if not exists
      this.saveGameImages(DEFAULT_GAME_IMAGES);
      return DEFAULT_GAME_IMAGES;
    } catch (error) {
      console.error('Error loading game images:', error);
      return DEFAULT_GAME_IMAGES;
    }
  }

  // Get image for specific game
  getGameImage(gameId: string): GameImage | undefined {
    return this.getGameImages().find(g => g.gameId === gameId);
  }

  // Save all game images
  saveGameImages(images: GameImage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
      // Dispatch custom event to notify listeners
      window.dispatchEvent(new CustomEvent('gameImagesUpdated'));
    } catch (error) {
      console.error('Error saving game images:', error);
    }
  }

  // Update a game image
  updateGameImage(id: string, updates: Partial<GameImage>): void {
    const images = this.getGameImages();
    const updatedImages = images.map(img => 
      img.id === id ? { ...img, ...updates } : img
    );
    this.saveGameImages(updatedImages);
  }

  // Add a new game image
  addGameImage(image: GameImage): GameImage {
    const images = this.getGameImages();
    this.saveGameImages([...images, image]);
    return image;
  }

  // Delete a game image
  deleteGameImage(id: string): void {
    const images = this.getGameImages();
    this.saveGameImages(images.filter(img => img.id !== id));
  }

  // Reset to default images
  resetToDefault(): void {
    this.saveGameImages(DEFAULT_GAME_IMAGES);
  }
}

export const gameImageService = new GameImageService();
export default gameImageService;
