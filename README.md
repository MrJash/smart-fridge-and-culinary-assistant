# Smart Fridge and Culinary Assistant

A modern web application that transforms your kitchen inventory management. Leveraging computer vision and AI, this application helps you track your refrigerator contents and discover recipes tailored to your available ingredients.

## Overview

The Smart Fridge and Culinary Assistant is a web app that combines real-time inventory tracking with intelligent recipe recommendations. Upload photos of your fridge contents, and the AI-powered system will analyze the ingredients and suggest recipes you can prepare. An integrated Chef Assistant chatbot provides step-by-step guidance, nutritional information, and cooking tips.

## Key Features

- **Intelligent Inventory Management**: Keep your fridge inventory organized and up-to-date with intuitive controls
- **Computer Vision Integration**: Upload photos of your fridge to automatically detect and catalog ingredients
- **Smart Recipe Discovery**: Get recipe recommendations based on your available ingredients
- **Personalized Suggestions**: AI-powered engine learns your preferences and dietary needs
- **Chef Assistant Chatbot**: Interactive AI assistant providing detailed recipe instructions, cooking tips, and nutritional guidance
- **Dietary Filters**: Filter recipes by dietary preferences including Vegetarian, Vegan, Keto, and Gluten-Free
- **Responsive Design**: Seamless experience across desktop and mobile devices

## Technology Stack

- **Frontend Framework**: Angular 21 with standalone components
- **Build Tool**: Vite with TypeScript
- **AI Integration**: Google Gemini API
- **Styling**: Tailwind CSS with custom animations
- **State Management**: RxJS
- **Runtime**: Node.js-based ESM modules

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MrJash/smart-fridge-and-culinary-assistant.git
cd smart-fridge-and-culinary-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Configure your environment:
   - Create or edit `.env.local` in the root directory
   - Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
```bash
npm run dev
```

The web app will be available at `http://localhost:5173` (or the port shown in your terminal).

### Production Build

To create a production-ready build:
```bash
npm run build
```

## Usage Guide

### Adding Ingredients

1. Launch the web app
2. Navigate to the inventory section
3. Add ingredients manually or use the camera feature
4. Alternatively, upload a photo of your fridge contents for automatic ingredient detection

### Finding Recipes

1. With ingredients in your inventory, browse the available recipes
2. Apply filters based on your dietary preferences:
   - Everything
   - Vegetarian
   - Vegan
   - Keto
   - Gluten-Free
3. Select a recipe to view detailed information

### Using Chef Assistant

1. While viewing a recipe, open the Chef Assistant chatbot
2. Ask questions about ingredients, cooking techniques, substitutions, or nutritional information
3. Get step-by-step guidance for recipe preparation
4. Receive real-time answers powered by Google Gemini AI

## Project Structure

```
smart-fridge-and-culinary-assistant/
├── src/
│   ├── app.component.ts          # Main application component
│   ├── app.component.html        # Application template
│   ├── components/               # Feature components
│   │   ├── camera.component.ts
│   │   ├── cooking-mode.component.ts
│   │   ├── landing.component.ts
│   │   ├── recipe-list.component.ts
│   │   └── shopping-list.component.ts
│   ├── services/                 # Application services
│   │   ├── gemini.service.ts     # AI service integration
│   │   └── store.service.ts      # State management
│   └── environments/             # Environment configuration
├── public/                       # Static assets
├── vite.config.ts               # Vite configuration
├── angular.json                 # Angular configuration
└── package.json                 # Dependencies
```

## API Integration

The application uses the Google Gemini API for intelligent recipe recommendations and the Chef Assistant chatbot. The integration is handled through the `gemini.service.ts` module, which manages:

- Recipe generation based on available ingredients
- Dietary preference filtering
- Conversational AI responses for cooking guidance
- Nutritional analysis and recommendations

## Environment Configuration

The application supports multiple environment configurations:

- `environment.ts`: Default development configuration
- `environment.development.ts`: Development-specific settings
- `environment.prod.ts`: Production configuration

Each environment can define different API endpoints and feature flags.

## Deployment

The project includes Vercel configuration for easy deployment. Connect your GitHub repository to Vercel, and the web app will automatically build and deploy on every push to the main branch.

For other hosting platforms, build the project with `npm run build` and deploy the `dist/` directory.

## Performance Considerations

- Lazy-loaded components for improved initial load time
- Optimized image processing for camera uploads
- Efficient state management with RxJS
- CSS animations use GPU-accelerated properties
- Responsive blur and glassmorphism effects without performance degradation

## Troubleshooting

### API Key Issues

If you receive authentication errors:
1. Verify your Gemini API key is correct in `.env.local`
2. Check that your API key has the required permissions
3. Ensure the API is enabled in your Google Cloud project

### Build Errors

If you encounter build errors:
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf .angular/cache`
3. Ensure you're using a compatible Node.js version

### Photo Upload Not Working

- Grant camera/file permissions in your browser
- Try a different browser if issues persist
- Check that the image format is supported (JPG, PNG)

## Contributing

Contributions are welcome and appreciated. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the project's existing style and includes appropriate documentation.

## Acknowledgments

This project includes content and code generation assisted by GitHub Copilot, an AI-powered development assistant created by GitHub and OpenAI.

## Project Status

This project was built for personal understanding and exploration of modern web development practices with Angular, AI integration, and real-time inventory management. It serves as a portfolio web app showcasing frontend development & AI Integration capabilities.

## Contact

For questions, suggestions, or feedback, please open an issue on the GitHub repository or contact the project maintainer.

---

**Note**: This web app requires an active internet connection to access the Gemini API. Ensure your API key has adequate quota for your usage patterns.
