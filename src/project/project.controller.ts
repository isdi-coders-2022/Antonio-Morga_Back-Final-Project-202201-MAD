import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Headers,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @Post()
    create(
        @Body() createProjectDto: CreateProjectDto,
        @Headers('Authorization') token: string,
    ) {
        return this.projectService.create(createProjectDto, token);
    }

    @Get()
    findAll(@Headers('Authorization') token: string) {
        return this.projectService.findAll(token);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Headers('Authorization') token: string) {
        return this.projectService.findOne(id, token);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
        @Headers('Authorization') token: string,
    ) {
        return this.projectService.update(id, updateProjectDto, token);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Headers('Authorization') token: string) {
        return this.projectService.remove(id, token);
    }
}
