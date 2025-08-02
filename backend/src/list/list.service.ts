import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createListDto: CreateListDto) {
    const user = await this.userRepository.findOne({ where: { id: createListDto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const list = this.listRepository.create({
      name: createListDto.name,
      user,
    });

    return this.listRepository.save(list);
  }

  async findAll() {
    return this.listRepository.find({ relations: ['user', 'tasks'] });
  }

  async findAllByUser(userId: number) {
    const lists = await this.listRepository.find({
      where: {
        user: { id: userId },
      },
    });

    if (!lists || lists.length === 0) {
      throw new NotFoundException('Aucune liste trouvée pour cet utilisateur.');
    }

    return lists;
  }


  async findOne(id: number) {
    const list = await this.listRepository.findOne({ where: { id }, relations: ['user', 'tasks'] });
    if (!list) throw new NotFoundException('List not found');
    return list;
  }

  async findOneByUser(userId: number, listId: number) {
    const list = await this.listRepository.findOne({
      where: {
        id: listId,
        user: { id: userId },
      },
    });

    if (!list) {
      throw new NotFoundException(`Liste #${listId} non trouvée pour l'utilisateur #${userId}`);
    }

    return list;
  }

  async update(id: number, updateListDto: UpdateListDto) {
    const list = await this.listRepository.findOne({ where: { id }, relations: ['user', 'tasks'] });
    if (!list) throw new NotFoundException('List not found');

    if (updateListDto.userId) {
      const user = await this.userRepository.findOne({ where: { id: updateListDto.userId } });
      if (!user) throw new NotFoundException('User not found');
      list.user = user;
    }

    if (updateListDto.name !== undefined) {
      list.name = updateListDto.name;
    }

    return this.listRepository.save(list);
  }

  async remove(id: number) {
    const list = await this.listRepository.findOne({ where: { id } });
    if (!list) throw new NotFoundException('List not found');

    await this.listRepository.remove(list);
    return { message: 'List deleted successfully' };
  }
}
