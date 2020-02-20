import {Body, Controller, Get, Post, UseGuards, UsePipes} from '@nestjs/common';
import {UserService} from './user.service';
import {UserDto} from './user.dto';
import {ValidationPipe} from '../shared/validation.pipe';
import {AuthGuard} from '../shared/auth.guard';
import {User} from './user.decorator';

@Controller()
export class UserController {

    constructor(private userService: UserService) { }


    @Get('api/users')
    @UseGuards(new AuthGuard())
    showAllUsers() {
        return this.userService.showAll();
    }

    @Post('login')
    @UsePipes(new ValidationPipe())
    login(@Body() data: UserDto) {
        return this.userService.login(data);
    }

    @Post('register')
    @UsePipes(new ValidationPipe())
    register(@Body() data: UserDto) {
        return this.userService.register(data);
    }

}
