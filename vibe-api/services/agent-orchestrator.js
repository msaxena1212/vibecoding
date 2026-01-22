const axios = require('axios');

class AgentOrchestrator {
    constructor() {
        this.coreApiUrl = process.env.CORE_API_URL || 'http://localhost:8000';
    }

    async generate(intent, projectId = null) {
        try {
            const url = `${this.coreApiUrl}/api/v1/generate/`;
            const params = { intent };
            if (projectId) params.project_id = projectId;

            // Using axios with responseType: 'stream' to proxy the NDJSON stream
            const response = await axios.post(url, null, {
                params,
                responseType: 'stream'
            });

            return response.data;
        } catch (error) {
            console.error('Error calling core agent API:', error.message);
            throw error;
        }
    }

    async getHistory() {
        try {
            const response = await axios.get(`${this.coreApiUrl}/api/v1/projects`);
            return response.data;
        } catch (error) {
            console.error('Error fetching history from core:', error.message);
            return [];
        }
    }
}

module.exports = new AgentOrchestrator();
