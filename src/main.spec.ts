import { bootstrap } from './main';
import * as request from 'supertest';

describe('main', () => {
    it('should bootstrap', async () => {
        const { app, server } = await bootstrap();
        const response = await request(server)
            .get('/projects')
            .set(
                'Authorization',
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyMzFmOGM0MmJhNWQ4OTk0Y2ZhZTdmMiIsImFkbWluIjp0cnVlLCJpYXQiOjE2NDc2ODYyNDd9.dHHsISVurPcaU2LfV-T-Y1mxAOH2t39sCmp1sVkvytQ',
            );
        await request(server).get('/noroute');
        await request(server).get('/projects');
        await request(server)
            .patch('/tasks/123/123')
            .set(
                'Authorization',
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyMzFmOGM0MmJhNWQ4OTk0Y2ZhZTdmMiIsImFkbWluIjp0cnVlLCJpYXQiOjE2NDc2ODYyNDd9.dHHsISVurPcaU2LfV-T-Y1mxAOH2t39sCmp1sVkvytQ',
            )
            .send({});
        app.close();
        expect(response.status).toBe(200);
    });
});