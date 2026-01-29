import { getSchoolConfig } from '../config/school.config'

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  description?: string
  auth?: boolean
}

/**
 * Define the actual available API endpoints
 * 
 * NOTE: This list should be updated when new endpoints are added to the backend.
 * Consider generating this dynamically from route definitions in a future update.
 */
export const API_ENDPOINTS: ApiEndpoint[] = [
  { method: 'GET', path: '/students', description: 'List all students (paginated)', auth: true },
  { method: 'GET', path: '/students/me', description: 'Get current user profile', auth: true },
  { method: 'GET', path: '/config', description: 'Get school configuration', auth: false },
  { method: 'GET', path: '/doc', description: 'OpenAPI specification (JSON)', auth: false },
  { method: 'GET', path: '/reference', description: 'Interactive API documentation', auth: false },
]

/**
 * Get color classes based on HTTP method
 */
const getMethodColors = (method: string): { text: string; border: string } => {
  const colors: Record<string, { text: string; border: string }> = {
    GET: { text: 'text-green-400', border: 'border-green-400/30' },
    POST: { text: 'text-blue-400', border: 'border-blue-400/30' },
    PUT: { text: 'text-yellow-400', border: 'border-yellow-400/30' },
    PATCH: { text: 'text-orange-400', border: 'border-orange-400/30' },
    DELETE: { text: 'text-red-400', border: 'border-red-400/30' },
  }
  return colors[method] || { text: 'text-gray-400', border: 'border-gray-400/30' }
}

/**
 * Generate endpoint cards HTML
 */
const generateEndpointCards = (): string => {
  return API_ENDPOINTS
    .map(endpoint => {
      const { text, border } = getMethodColors(endpoint.method)
      const authBadge = endpoint.auth 
        ? '<span class="ml-2 text-xs text-yellow-500">🔒</span>' 
        : ''
      return `
        <div class="endpoint-card p-4 bg-white/[0.03] border border-white/[0.08] rounded-lg transition-all duration-300 hover:bg-white/[0.06] hover:-translate-y-1 ${border}">
          <div class="font-mono text-sm ${text}">
            <span class="font-bold">${endpoint.method}</span> ${endpoint.path}${authBadge}
          </div>
          ${endpoint.description ? `<p class="text-xs text-gray-500 mt-1">${endpoint.description}</p>` : ''}
        </div>
      `
    })
    .join('')
}

/**
 * Generate the landing page HTML
 */
export const generateLandingPage = (): string => {
  const schoolConfig = getSchoolConfig()
  const endpointCards = generateEndpointCards()
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schoolConfig.name.short.en} Connext - API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          animation: {
            'slide-down': 'slideDown 1s ease-out',
            'slide-up': 'slideUp 1s ease-out',
            'fade-in': 'fadeIn 1s ease-out',
            'pulse-ring': 'pulseRing 2s infinite',
            'blink': 'blink 1.5s infinite'
          },
          keyframes: {
            slideDown: {
              'from': { 'opacity': '0', 'transform': 'translateY(-30px)' },
              'to': { 'opacity': '1', 'transform': 'translateY(0)' }
            },
            slideUp: {
              'from': { 'opacity': '0', 'transform': 'translateY(30px)' },
              'to': { 'opacity': '1', 'transform': 'translateY(0)' }
            },
            fadeIn: {
              'from': { 'opacity': '0' },
              'to': { 'opacity': '1' }
            },
            pulseRing: {
              '0%, 100%': { 'transform': 'scale(1)', 'box-shadow': '0 0 0 0 rgba(34, 197, 94, 0.7)' },
              '50%': { 'transform': 'scale(1.02)', 'box-shadow': '0 0 0 10px rgba(34, 197, 94, 0)' }
            },
            blink: {
              '0%, 50%': { 'opacity': '1' },
              '51%, 100%': { 'opacity': '0.3' }
            }
          }
        }
      }
    }
  </script>
  <style>
    .delay-300 { animation-delay: 0.3s; }
    .delay-600 { animation-delay: 0.6s; }
    .delay-1000 { animation-delay: 1s; }
    .delay-1200 { animation-delay: 1.2s; }
    .delay-1400 { animation-delay: 1.4s; }
  </style>
</head>
<body class="font-['Inter'] bg-black text-white min-h-screen flex items-center justify-center overflow-x-hidden">
  <!-- Background -->
  <div class="fixed inset-0 bg-black"></div>
  
  <!-- Main Container -->
  <div class="relative z-10 text-center max-w-4xl px-4 sm:px-8 py-12">
    
    <!-- Main Title -->
    <h1 class="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent animate-slide-down">
      ${schoolConfig.name.short.en}-Connext API
    </h1>
    
    <!-- Description -->
    <p class="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-600">
      ${schoolConfig.description.en}
    </p>
    
    <!-- Status Indicator -->
    <div class="inline-flex items-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-full px-6 py-3 mb-12 animate-pulse-ring delay-1000">
      <div class="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-blink shadow-lg shadow-green-500/50"></div>
      <span class="font-medium">Backend System Online</span>
    </div>
    
    <!-- API Links -->
    <div class="flex flex-wrap justify-center gap-4 mb-12 animate-slide-up delay-1000">
      <a href="/doc" class="flex items-center px-6 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white no-underline font-medium transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 hover:border-white/30">
        <span class="mr-2">📚</span>
        API Documentation
      </a>
      <a href="/reference" class="flex items-center px-6 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white no-underline font-medium transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 hover:border-white/30">
        <span class="mr-2">🔍</span>
        API Reference
      </a>
      <a href="/config" class="flex items-center px-6 py-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl text-white no-underline font-medium transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 hover:border-white/30">
        <span class="mr-2">⚙️</span>
        School Config
      </a>
    </div>
    
    <!-- Endpoints Section -->
    <div class="animate-slide-up delay-1200">
      <h2 class="text-xl font-medium text-gray-300 mb-2">Available API Endpoints</h2>
      <p class="text-sm text-gray-500 mb-6">🔒 = Authentication Required</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        ${endpointCards}
      </div>
    </div>
    
    <!-- School Info Footer -->
    <div class="text-sm text-gray-500 animate-fade-in delay-1400 space-y-1">
      <p class="font-medium">${schoolConfig.name.en}</p>
      <p>${schoolConfig.address.en}</p>
      <p>
        <a href="tel:${schoolConfig.contact.phone}" class="hover:text-green-400 transition-colors">${schoolConfig.contact.phone}</a>
        <span class="mx-2">•</span>
        <a href="mailto:${schoolConfig.contact.email}" class="hover:text-green-400 transition-colors">${schoolConfig.contact.email}</a>
      </p>
      <div class="flex justify-center gap-4 mt-2">
        <a href="${schoolConfig.links.website}" target="_blank" class="text-gray-500 hover:text-blue-300 transition-colors">Website</a>
        <a href="${schoolConfig.links.facebook}" target="_blank" class="text-gray-500 hover:text-blue-300 transition-colors">Facebook</a>
      </div>
    </div>
  </div>
</body>
</html>`
}
