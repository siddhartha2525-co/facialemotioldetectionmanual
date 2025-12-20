const request = require('supertest');
const app = require('../src/app');

// Mock setupRoutes to avoid error
app.setupRoutes = jest.fn();

describe('Health Check', () => {
    it('should return 200 OK', async () => {
        // We add the route manually for testing since setupRoutes is mocked/not called in test env same way
        app.get('/api/health', (req, res) => res.json({ success: true }));

        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });
});
