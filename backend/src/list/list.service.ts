import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './entities/list.entity';
import { User } from '../user/entities/user.entity';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: string, createListDto: CreateListDto) {
    const list = this.listRepository.create({
      name: createListDto.name,
      user: { id: userId },
    });

    return this.listRepository.save(list);
  }

  async findAllByUser(userId: string) {
    const lists = await this.listRepository.find({
      where: {
        user: { id: userId },
      },
    });

    return lists;
  }

  async findOneByUser(userId: string, listId: string) {
    const list = await this.listRepository.findOne({
      where: {
        id: listId,
        user: { id: userId },
      },
      relations: ['tasks'],
    });

    if (!list) {
      throw new NotFoundException(
        `Liste #${listId} non trouvée pour l'utilisateur #${userId}`,
      );
    }

    return list;
  }

  async update(userId: string, id: string, updateListDto: UpdateListDto) {
    const list = await this.listRepository.findOne({
      where: { id },
      relations: ['user', 'tasks'],
    });
    if (!list) throw new NotFoundException('List not found');

    if (list.user.id !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas le propriétaire de cette liste",
      );
    }

    if (updateListDto.name !== undefined) {
      list.name = updateListDto.name;
    }

    return this.listRepository.save(list);
  }

  async remove(userId: string, id: string) {
    const list = await this.listRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });

    if (!list) throw new NotFoundException('List not found');

    if (list.user.id !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer cette liste",
      );
    }

    await this.listRepository.remove(list);
    return { message: 'List deleted successfully' };
  }
}
