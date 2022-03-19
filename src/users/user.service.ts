import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { ifPartialUser, ifUser } from '../models/user.model';
import { AuthService } from '../utils/auth.service';
import { CreateUserDto } from './dto/create-user-crud.dto';

@Injectable()
export class UserCrudService {
    constructor(
        @InjectModel('User') private readonly User: Model<ifUser>,
        private readonly auth: AuthService,
    ) {}

    async create(createUserDto: CreateUserDto, token: string) {
        const adminData = this.auth.validateToken(
            token,
            process.env.SECRET,
        ) as JwtPayload;
        if (adminData.admin) {
            const savedUser = await this.User.create({
                ...createUserDto,
                teamLeader: new Types.ObjectId(adminData.id),
                password: bcrypt.hashSync(createUserDto.password),
                admin: false,
                projects: [],
            });
            await this.User.findByIdAndUpdate(adminData.id, {
                $push: { team: savedUser._id },
            });
            return savedUser;
        }
        throw new UnauthorizedException();
    }

    async findAll() {
        return await this.User.find({});
    }

    async findOne(id: string) {
        return await this.User.findById(id)
            .populate('projects')
            .populate('team', { password: 0 });
    }

    async update(id: string, body: ifPartialUser) {
        const response = await this.User.findByIdAndUpdate(id, body, {
            new: true,
        });
        if (!response) throw new NotFoundException();
        return response;
    }

    async remove(id: string, token: string) {
        const adminData = this.auth.validateToken(
            token,
            process.env.SECRET,
        ) as JwtPayload;
        const deletedUser = await this.User.findByIdAndDelete(id);
        if (adminData.admin) {
            this.User.findByIdAndUpdate(adminData.id, {
                $pull: [{ _id: deletedUser._id }],
            });
        }
        return deletedUser;
    }
}