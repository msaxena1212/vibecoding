const fs = require('fs').promises;
const path = require('path');

class AssetService {
    constructor() {
        this.projectsPath = path.join(__dirname, '../../vibe-projects');
    }

    async getFile(projectId, filePath) {
        try {
            const fullPath = path.join(this.projectsPath, projectId, filePath);
            // Security check: ensure the path is within the project directory
            const projectRoot = path.join(this.projectsPath, projectId);
            if (!fullPath.startsWith(projectRoot)) {
                throw new Error('Access denied');
            }
            return await fs.readFile(fullPath, 'utf8');
        } catch (error) {
            console.error(`Error reading file ${filePath} for project ${projectId}:`, error.message);
            throw error;
        }
    }

    async getProjectFileStream(projectId, filePath) {
        const fullPath = path.join(this.projectsPath, projectId, filePath);
        const projectRoot = path.join(this.projectsPath, projectId);
        if (!fullPath.startsWith(projectRoot)) {
            throw new Error('Access denied');
        }
        return fullPath;
    }
}

module.exports = new AssetService();
