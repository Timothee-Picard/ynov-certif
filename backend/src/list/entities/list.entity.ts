import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import {User} from "../../user/entities/user.entity";
import {Task} from "../../task/entities/task.entity";

@Entity('lists')
export class List {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@CreateDateColumn()
	createdAt: Date;

	@ManyToOne(() => User, user => user.lists, { onDelete: 'CASCADE' })
	user: User;

	@OneToMany(() => Task, task => task.list, { cascade: true })
	tasks: Task[];
}
