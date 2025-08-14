import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { List } from '../../list/entities/list.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => List, (list) => list.tasks, { onDelete: 'CASCADE' })
  list: List;
}
