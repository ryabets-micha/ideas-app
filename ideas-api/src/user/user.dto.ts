import {IsNotEmpty} from 'class-validator';
import {IdeaEntity} from '../idea/idea.entity';

export class UserDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
}

export class UserRo {
    id: string;
    username: string;
    created: Date;
    token?: string;
    bookmarks?: IdeaEntity[];
}