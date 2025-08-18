import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm'
import { List } from '../../list/entities/list.entity'

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    username: string

    @Column({ unique: true })
    email: string

    @Column()
    password: string

    @Column({ nullable: true })
    avatar?: string

    @CreateDateColumn()
    createdAt: Date

    @OneToMany(() => List, (list) => list.user, { cascade: true })
    lists: List[]
}
