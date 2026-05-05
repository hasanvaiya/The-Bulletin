document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = 'pub_78e64eb37d9e4e06afbb05791b5cee84';
    const BASE_URL = 'https://newsdata.io/api/1/latest';
    const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    // Sections Configuration
    const sections = [
        {
            id: 'politics',
            url: `${BASE_URL}?apikey=${API_KEY}&country=bd&category=politics&language=bn`,
            containerId: 'politics-grid',
            loaderId: 'politics-loader'
        },
        {
            id: 'bd',
            url: `${BASE_URL}?apikey=${API_KEY}&country=bd&language=bn`,
            containerId: 'bd-grid',
            loaderId: 'bd-loader'
        },
        {
            id: 'world',
            url: `${BASE_URL}?apikey=${API_KEY}&category=world&language=bn`,
            containerId: 'international-grid',
            loaderId: 'international-loader'
        },
        {
            id: 'top',
            url: `${BASE_URL}?apikey=${API_KEY}&language=bn`,
            containerId: 'top-grid',
            loaderId: 'top-loader'
        },
        {
            id: 'sports',
            url: `${BASE_URL}?apikey=${API_KEY}&category=sports&language=bn`,
            containerId: 'sports-grid',
            loaderId: 'sports-loader'
        }
    ];

    // Format Date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Render Articles for a specific section
    const renderSection = (articles, containerId, loaderId) => {
        const container = document.getElementById(containerId);
        const loader = document.getElementById(loaderId);
        
        // Hide loader
        if (loader) loader.classList.add('hidden');
        
        // Filter valid articles, exclude ABP news, and limit to 6 for a clean layout
        const validArticles = articles.filter(article => {
            if (!article.title || !article.link) return false;
            
            // Exclude ABP News
            const sourceId = article.source_id ? article.source_id.toLowerCase() : '';
            const sourceName = article.source_name ? article.source_name.toLowerCase() : '';
            if (sourceId.includes('abp') || sourceName.includes('abp') || sourceId.includes('apb') || sourceName.includes('apb')) {
                return false;
            }
            
            return true;
        }).slice(0, 6);
        
        if (validArticles.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary)">No articles found for this section.</p>';
        } else {
            let html = '';
            validArticles.forEach(article => {
                const imageUrl = article.image_url || DEFAULT_IMAGE;
                const sourceName = article.source_name || 'News Source';
                const pubDate = formatDate(article.pubDate);
                const description = article.description || '';

                html += `
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="news-card">
                        <div class="card-img-wrapper">
                            <img src="${imageUrl}" alt="" class="card-img" onerror="this.src='${DEFAULT_IMAGE}'">
                        </div>
                        <div class="card-content">
                            <div class="card-meta">
                                <span class="source">${sourceName}</span>
                                <span>${pubDate}</span>
                            </div>
                            <h3 class="card-title">${article.title}</h3>
                            <p class="card-desc">${description}</p>
                        </div>
                    </a>
                `;
            });
            container.innerHTML = html;
        }
        
        container.classList.remove('hidden');
    };

    // Fetch Data for a single section
    const fetchSectionData = async (section) => {
        try {
            const response = await fetch(section.url);
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            
            if (data.status === 'success' && data.results) {
                renderSection(data.results, section.containerId, section.loaderId);
            } else {
                throw new Error('Invalid Data');
            }
        } catch (error) {
            console.error(`Error fetching ${section.id}:`, error);
            const container = document.getElementById(section.containerId);
            const loader = document.getElementById(section.loaderId);
            if (loader) loader.classList.add('hidden');
            container.innerHTML = `<p style="color: var(--danger-color)">Failed to load news. Please try again later.</p>`;
            container.classList.remove('hidden');
        }
    };

    // Fetch all sections with a slight delay between each to respect potential API rate limits
    const fetchAllSections = async () => {
        for (const section of sections) {
            await fetchSectionData(section);
            // Wait 500ms between requests to avoid HTTP 429 Too Many Requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    // Initialize
    fetchAllSections();
});
