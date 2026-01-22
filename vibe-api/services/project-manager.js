const fs = require('fs').promises;
const path = require('path');

class ProjectManager {
    constructor() {
        this.projectsPath = path.join(__dirname, '../../vibe-projects');
        this.metadataFile = path.join(this.projectsPath, 'projects.json');
    }

    async init() {
        try {
            await fs.mkdir(this.projectsPath, { recursive: true });
            try {
                await fs.access(this.metadataFile);
            } catch {
                await fs.writeFile(this.metadataFile, JSON.stringify([], null, 2));
            }
        } catch (error) {
            console.error('Failed to initialize ProjectManager:', error);
        }
    }

    async getAllProjects() {
        try {
            const data = await fs.readFile(this.metadataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading projects metadata:', error);
            return [];
        }
    }

    async saveProject(project) {
        try {
            const projects = await this.getAllProjects();
            const index = projects.findIndex(p => p.id === project.id);
            if (index !== -1) {
                projects[index] = { ...projects[index], ...project, updated_at: new Date().toISOString() };
            } else {
                projects.push({ ...project, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
            }
            await fs.writeFile(this.metadataFile, JSON.stringify(projects, null, 2));
            return project;
        } catch (error) {
            console.error('Error saving project:', error);
            throw error;
        }
    }

    async getProjectById(id) {
        const projects = await this.getAllProjects();
        return projects.find(p => p.id === id);
    }
}

module.exports = new ProjectManager();
