import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthService } from '../src/utils/auth.service';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtPayload } from 'jsonwebtoken';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;
    let nonAdminToken: string;
    let adminId: string;
    let userId: string;
    let clientId: string;

    const mockAdmin = {
        userName: 'admin123',
        name: 'Admin',
        userImage: 'some url',
        password: '12345',
        mail: 'admin@gmail.com',
    };

    const mockRegularUser = {
        userName: 'user123',
        name: 'User',
        userImage: 'some url',
        password: '12345',
        mail: 'user@gmail.com',
    };

    const mockClient = {
        address: {
            street: 'test street',
            number: 23,
        },
        name: 'test client',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    test('/register (POST)', async () => {
        const response = await request(app.getHttpServer())
            .post('/register')
            .send(mockAdmin)
            .set('Accept', 'application/json');
        expect(response.status).toBe(201);
        adminToken = response.text;
        console.log(adminToken);
        console.log(response.text);
        adminId = (
            AuthService.prototype.validateToken(
                adminToken,
                process.env.SECRET,
            ) as JwtPayload
        ).id;
    });

    test('/register (POST) invalid data', async () => {
        const response = await request(app.getHttpServer())
            .post('/register')
            .send(mockAdmin)
            .set('Accept', 'application/json');
        expect(response.status).toBe(500);
    });

    test('/users/new (POST)', async () => {
        const response = await request(app.getHttpServer())
            .post('/users/new')
            .send(mockRegularUser)
            .set('Accept', 'application/json')
            .set('Authorization', `bearer ${adminToken}`);

        expect(response.status).toBe(201);
    });

    test('/users/new (POST) no token', async () => {
        const response = await request(app.getHttpServer())
            .post('/users/new')
            .send(mockRegularUser)
            .set('Accept', 'application/json');

        expect(response.status).toBe(401);
    });

    test('/users/new (POST) invalid data', async () => {
        const response = await request(app.getHttpServer())
            .post('/users/new')
            .send(mockRegularUser)
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(401);
    });

    test('/users/:id (GET)', async () => {
        const response = await request(app.getHttpServer())
            .get(`/users/${adminId}`)
            .set('Authorization', `bearer ${adminToken}`);
        expect(response.status).toBe(200);
        userId = response.body.team[0]._id;
        nonAdminToken = AuthService.prototype.createToken(
            userId,
            response.body,
            process.env.SECRET,
        );
    });

    test('/users/:id (GET) without token', async () => {
        const response = await request(app.getHttpServer()).get(
            `/users/${userId}`,
        );
        expect(response.status).toBe(401);
    });

    test('/login (POST)', async () => {
        const response = await request(app.getHttpServer())
            .post('/login')
            .send({ userName: 'admin123', password: '12345' })
            .set('Accept', 'application/json');
        expect(response.status).toBe(201);
    });

    test('/login (POST) wrong user or pw', async () => {
        const response = await request(app.getHttpServer())
            .post('/login')
            .send({ userName: 'admin123', password: 'wrongPW' })
            .set('Accept', 'application/json');
        expect(response.status).toBe(401);
    });

    test('/users (GET)', async () => {
        const response = await request(app.getHttpServer())
            .get(`/users`)
            .set('Authorization', `bearer ${adminToken}`);
        expect(response.status).toBe(200);
    });

    test('/users (GET) user token', async () => {
        const response = await request(app.getHttpServer())
            .get(`/users`)
            .set('Authorization', `bearer ${nonAdminToken}`);
        expect(response.status).toBe(200);
    });

    test('/users/:id (PATCH)', async () => {
        const response = await request(app.getHttpServer())
            .patch(`/users/${userId}`)
            .send({ name: 'updated user' })
            .set('Authorization', `bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('updated user');
    });

    test('/users/:id (PATCH) without token', async () => {
        const response = await request(app.getHttpServer())
            .patch(`/users/${adminId}`)
            .send({ name: 'updated user' });

        expect(response.status).toBe(401);
    });

    test('/clients (POST)', async () => {
        const response = await request(app.getHttpServer())
            .post('/clients')
            .send(mockClient)
            .set('Accept', 'application/json')
            .set('Authorization', `bearer ${adminToken}`);
        expect(response.status).toBe(201);
        clientId = response.body._id.toString();
    });

    test('/clients (POST) invalid data', async () => {
        const response = await request(app.getHttpServer())
            .post('/clients')
            .send({ name: '' })
            .set('Accept', 'application/json')
            .set('Authorization', `bearer ${adminToken}`);
        expect(response.status).toBe(500);
    });

    test('/clients (POST) no token', async () => {
        const response = await request(app.getHttpServer()).post('/clients');

        expect(response.status).toBe(401);
    });

    // DANGER!!! //
    // DANGER!!! //
    // CODE ABOVE THIS LINE!!!!! //
    // DANGER!!! //
    // DANGER!!! //

    test('/users/:id (DELETE) admin', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/users/${adminId}`)
            .set('Authorization', `bearer ${adminToken}`);
        expect(response.status).toBe(200);
    });

    test('/users/:id (DELETE) non admin', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/users/${userId}`)
            .set('Authorization', `bearer ${nonAdminToken}`);
        expect(response.status).toBe(200);
    });
});
