const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const projectManager = require('./services/project-manager');
const agentOrchestrator = require('./services/agent-orchestrator');
const assetService = require('./services/asset-service');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Serve generated project files
// This allows /preview/p/{id}/index.html to work
app.use('/preview/p', express.static(path.join(__dirname, '../vibe-projects')));

// Initialize services
projectManager.init();

// Routes
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await agentOrchestrator.getHistory();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate', async (req, res) => {
    const { intent, project_id } = req.query;
    try {
        const stream = await agentOrchestrator.generate(intent, project_id);

        res.setHeader('Content-Type', 'application/x-ndjson');
        stream.pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Vibe-API running at http://localhost:${PORT}`);
    console.log(`Proxying core requests to ${process.env.CORE_API_URL || 'http://localhost:8000'}`);
});
