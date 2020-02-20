import {IsString} from 'class-validator';

export class IdeaDto {
    id?: string;

    created?: Date;

    @IsString()
    idea: string;

    @IsString()
    description: string;
}