import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';

import {IdeaEntity} from './idea.entity';
import {IdeaDto, IdeaRo} from './idea.dto';
import {UserEntity} from '../user/user.entity';
import {Votes} from '../shared/votes.enum';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity)
        private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    private toResponseObject(idea: IdeaEntity): IdeaRo {
        const responseObject: any = { ...idea, author: idea.author.toResponseObject(false) };

        if (responseObject.upvotes) {
            responseObject.upvotes = idea.upvotes.length;
        }

        if (responseObject.downvotes) {
            responseObject.downvotes = idea.downvotes.length;
        }

        return responseObject;
    }

    private ensureOwnership(idea: IdeaEntity, userId: string) {
        if (idea.author.id !== userId) {
            throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
        }
    }

    private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
        const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;

        if (idea[opposite].filter(voter => voter.id === user.id).length > 0 || idea[vote].filter(voter => voter.id === user.id).length > 0) {
            idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id);
            idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
            await this.ideaRepository.save(idea);
        } else if (idea[vote].filter(voter => voter.id === user.id).length < 1) {
            idea[vote].push(user);
            await this.ideaRepository.save(idea);
        } else {
            throw new HttpException('Unable to cats vote', HttpStatus.BAD_REQUEST);
        }

        return idea;
    }

    async showAll(): Promise<IdeaRo[]> {
        const ideas = await this.ideaRepository.find({relations: ['author', 'upvotes', 'downvotes']});
        return ideas.map(idea => this.toResponseObject(idea));
    }

    async create(userId: string, data: IdeaDto): Promise<IdeaRo> {
        const user = await this.userRepository.findOne({where: { id: userId }});
        const idea = await this.ideaRepository.create({...data, author: user});
        await this.ideaRepository.save(idea);
        return this.toResponseObject(idea);
    }

    async read(id: string): Promise<IdeaRo> {
        const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes'] });

        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        return this.toResponseObject(idea);
    }

    async update(id: string, userId: string, data: Partial<IdeaDto>): Promise<IdeaRo> {
        let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'] });

        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        this.ensureOwnership(idea, userId);

        await this.ideaRepository.update({ id }, data);
        idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'] });
        return this.toResponseObject(idea);
    }

    async destroy(id: string, userId: string): Promise<IdeaRo> {
        const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'] });

        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        this.ensureOwnership(idea, userId);

        await this.ideaRepository.delete({ id });
        return this.toResponseObject(idea);
    }

    async upvote(id: string, userId: string) {
        let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes'] });
        const user = await this.userRepository.findOne({ where: { id: userId } });

        idea = await this.vote(idea, user, Votes.UP);
        return this.toResponseObject(idea);
    }

    async downvote(id: string, userId: string) {
        let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes'] });
        const user = await this.userRepository.findOne({ where: { id: userId } });

        idea = await this.vote(idea, user, Votes.DOWN);
        return this.toResponseObject(idea);
    }

    async bookmark(id: string, userId: string) {
        const idea = await this.ideaRepository.findOne({ where: { id } });
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['bookmarks'] });

        if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1) {
            user.bookmarks.push(idea);
            await this.userRepository.save(user);
        } else {
            throw new HttpException('Idea already bookmarked', HttpStatus.BAD_REQUEST);
        }

        return user.toResponseObject();
    }

    async unbookmark(id: string, userId: string) {
        const idea = await this.ideaRepository.findOne({ where: { id } });
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['bookmarks'] });

        if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length > 0) {
            user.bookmarks = user.bookmarks.filter(bookmark => bookmark.id !== idea.id);
            await this.userRepository.save(user);
        } else {
            throw new HttpException('Idea already unbookmarked', HttpStatus.BAD_REQUEST);
        }

        return user.toResponseObject();
    }
}
