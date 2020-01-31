import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('idea')
export class IdeaEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    created: Date;

    @Column('text')
    idea: string;

    @Column('text')
    description: string;
}