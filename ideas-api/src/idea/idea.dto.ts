import {IsString} from 'class-validator';
import {UserRo} from '../user/user.dto';

export class IdeaDto {
    id?: string;

    created?: Date;

    @IsString()
    idea: string;

    @IsString()
    description: string;
}

export class IdeaRo {
    id: string;
    created: Date;
    updated: Date;
    idea: string;
    description: string;
    author: UserRo;
}