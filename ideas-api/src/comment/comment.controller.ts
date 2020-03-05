import {Body, Controller, Delete, Get, Param, Post, Query, UseGuards, UsePipes} from '@nestjs/common';
import {CommentService} from './comment.service';
import {AuthGuard} from '../shared/auth.guard';
import {ValidationPipe} from '../shared/validation.pipe';
import {CommentDto} from './comment.dto';
import {User} from '../user/user.decorator';

@Controller('api/comments')
export class CommentController {
    constructor(private commentService: CommentService) {}

    @Get('idea/:id')
    async showCommentsByIdea(@Param('id') idea: string, @Query('page') page: number) {
        return await this.commentService.showByIdea(idea, page);
    }

    @Get('user/:id')
    async showCommentsByUser(@Param('id') user: string, @Query('page') page: number) {
        return await this.commentService.showByUser(user, page);
    }

    @Post('idea/:id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    async createComment(@Param('id') idea: string, @User('id') user: string, @Body() data: CommentDto) {
        return await this.commentService.create(idea, user, data);
    }

    @Get(':id')
    async showComment(@Param('id') id: string) {
        return await this.commentService.show(id);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    async destroyComment(@Param('id') id: string, @User('id') user: string) {
        return await this.commentService.destroy(id, user);
    }
}
